import express from "express";
import cors from "cors";
import crypto from "crypto";
import tls from "tls";
import dotenv from "dotenv";
import pool, { ensureDatabase } from "./db.js";
import { hashPassword, verifyPassword, createToken, tokenHash } from "./auth.js";

dotenv.config({ path: "backend/.env" });

const app = express();
app.disable("x-powered-by");
const allowedOrigins = String(process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS."));
  },
  credentials: false,
}));
app.use(express.json({ limit: "256kb", strict: true }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

const publicRequestWindows = new Map();
function publicFormRateLimit(req, res, next) {
  const now = Date.now();
  const key = `${req.ip || req.socket.remoteAddress || "unknown"}:${req.path}`;
  const entry = publicRequestWindows.get(key);
  if (!entry || now - entry.startedAt > 10 * 60 * 1000) {
    publicRequestWindows.set(key, { startedAt: now, count: 1 });
    return next();
  }
  if (entry.count >= 12) {
    return res.status(429).json({ ok: false, message: "Too many submissions. Please try again later." });
  }
  entry.count += 1;
  next();
}

const PORT = Number(process.env.PORT || 5050);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Atelier Noire Admin";
const SESSION_HOURS = Number(process.env.ADMIN_SESSION_HOURS || 8);

let databaseReady = null;

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    Number(process.env.SMTP_PORT || 465) === 465
  );
}

function cleanText(value, max = 10000) {
  if (value === undefined || value === null) return null;
  return String(value).trim().slice(0, max);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

function positiveId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validImageUrl(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 3000) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

function smtpCommand(socket, command, expectedCodes = []) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    let finished = false;

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("close", onClose);
    };

    const done = (fn, value) => {
      if (finished) return;
      finished = true;
      cleanup();
      fn(value);
    };

    const onData = (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1];
      if (!last || !/^\d{3} /.test(last)) return;
      const code = Number(last.slice(0, 3));
      if (expectedCodes.length && !expectedCodes.includes(code)) {
        done(reject, new Error(`SMTP ${code}: ${last.slice(4)}`));
      } else {
        done(resolve, code);
      }
    };

    const onError = (error) => done(reject, error);
    const onClose = () => {
      if (!finished) done(reject, new Error("SMTP connection closed."));
    };

    socket.on("data", onData);
    socket.on("error", onError);
    socket.on("close", onClose);

    if (command) socket.write(command + "\r\n");
  });
}

async function sendEmail({ to, subject, text, html }) {
  if (!smtpConfigured()) return false;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  if (port !== 465) {
    throw new Error("This built-in sender expects SMTP_PORT=465.");
  }

  const socket = tls.connect({
    host,
    port,
    servername: host,
    rejectUnauthorized: true,
  });

  try {
    await smtpCommand(socket, "", [220]);
    await smtpCommand(socket, "EHLO atelier-noire.local", [250]);
    await smtpCommand(socket, "AUTH LOGIN", [334]);
    await smtpCommand(socket, Buffer.from(process.env.SMTP_USER).toString("base64"), [334]);
    await smtpCommand(socket, Buffer.from(process.env.SMTP_PASSWORD).toString("base64"), [235]);
    await smtpCommand(socket, `MAIL FROM:<${process.env.SMTP_USER}>`, [250]);
    await smtpCommand(socket, `RCPT TO:<${to}>`, [250, 251]);
    await smtpCommand(socket, "DATA", [354]);

    const safeSubject = String(subject || "").replace(/[\r\n]/g, " ");
    const fromName = String(process.env.SMTP_FROM_NAME || "Atelier Noire").replace(/[\r\n<>]/g, "").slice(0, 100);
    const body = [
      `From: ${fromName} <${process.env.SMTP_USER}>`,
      `To: ${to}`,
      `Subject: ${safeSubject}`,
      "MIME-Version: 1.0",
      'Content-Type: multipart/alternative; boundary="atelier-boundary"',
      "",
      "--atelier-boundary",
      "Content-Type: text/plain; charset=utf-8",
      "",
      text,
      "",
      "--atelier-boundary",
      "Content-Type: text/html; charset=utf-8",
      "",
      html || `<p>${String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>`,
      "",
      "--atelier-boundary--",
      ".",
    ].join("\r\n");

    await smtpCommand(socket, body, [250]);
    await smtpCommand(socket, "QUIT", [221]);
    socket.end();
    return true;
  } finally {
    if (!socket.destroyed) socket.end();
  }
}

async function notifyEmails({ userEmail, subject, userText, adminText, html }) {
  let userSent = false;
  let adminSent = false;

  if (userEmail && smtpConfigured()) {
    try {
      userSent = await sendEmail({
        to: userEmail,
        subject,
        text: userText,
        html,
      });
    } catch (error) {
      console.error("User email error:", error.message);
    }
  }

  if (process.env.ADMIN_NOTIFICATION_EMAIL && smtpConfigured()) {
    try {
      adminSent = await sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `New Atelier Noire enquiry — ${subject}`,
        text: adminText,
        html: `<pre style="font-family:Arial;white-space:pre-wrap">${adminText}</pre>`,
      });
    } catch (error) {
      console.error("Admin notification error:", error.message);
    }
  }

  return { userSent, adminSent };
}

async function logAction(adminId, action, entity = null, entityId = null, details = null) {
  try {
    await pool.query(
      "INSERT INTO audit_logs (admin_id, action, entity, entity_id, details) VALUES (?,?,?,?,?)",
      [adminId || null, action, entity, entityId ? String(entityId) : null, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
}

async function seedAdmin() {
  const [rows] = await pool.query(
    "SELECT id, email FROM admin_users WHERE email=? LIMIT 1",
    [ADMIN_EMAIL]
  );

  if (rows.length === 0) {
    const [result] = await pool.query(
      "INSERT INTO admin_users (email,password_hash,name) VALUES (?,?,?)",
      [ADMIN_EMAIL, hashPassword(ADMIN_PASSWORD), ADMIN_NAME]
    );
    console.log(`Created admin account: ${ADMIN_EMAIL}`);
    return result.insertId;
  }

  return rows[0].id;
}

async function seedProjects() {
  const [[count]] = await pool.query("SELECT COUNT(*) AS total FROM projects");
  if (Number(count.total) > 0) return;

  const projects = [
    ["Noir Dining Room","Dining","Warm Contemporary","Mumbai","2026","https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=90"],
    ["Oak & Stone Kitchen","Kitchen","Natural Modern","Pune","2026","https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=90"],
    ["Walnut Courtyard","Living","Modern Organic","Goa","2026","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=90"],
    ["Ivory Apartment","Bedroom","Soft Minimal","Delhi","2026","https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=90"],
    ["Saffron Courtyard","Living","Earthy Contemporary","Jaipur","2026","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=90"],
    ["Blue Hour Bedroom","Bedroom","Moody Modern","Mumbai","2026","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=90"],
    ["Olive Kitchen","Kitchen","Warm Minimal","Bengaluru","2026","https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=1800&q=90"],
    ["Ochre Dining Salon","Dining","Art Deco","Pune","2026","https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=90"],
    ["Clay & Linen Home","Living","Quiet Luxury","Mumbai","2026","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=90"],
    ["Forest Edge Kitchen","Kitchen","Biophilic","Nashik","2026","https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&w=1800&q=90"],
    ["Terracotta Bedroom","Bedroom","Tactile Modern","Pune","2026","https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1800&q=90"],
    ["Sandstone Lounge","Living","Desert Modern","Jodhpur","2026","https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1800&q=90"],
    ["Marble Kitchen House","Kitchen","Contemporary","Hyderabad","2026","https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1800&q=90"],
    ["Rosewood Dining","Dining","Refined Classic","Delhi","2026","https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1800&q=90"],
    ["Sage Retreat","Bedroom","Calm Organic","Goa","2026","https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1800&q=90"],
    ["Graphite Living","Living","Contemporary Luxe","Mumbai","2026","https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=90"],
    ["Brass & Oak Kitchen","Kitchen","Craft Modern","Bengaluru","2026","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1800&q=90"],
    ["Pearl Bedroom","Bedroom","Light Minimal","Pune","2026","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=90"],
    ["Cedar Dining","Dining","Scandinavian Warm","Chandigarh","2026","https://images.unsplash.com/photo-1600566753051-1a4b4f2c4f09?auto=format&fit=crop&w=1800&q=90"],
    ["Limewash Villa","Living","Mediterranean Modern","Goa","2026","https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=90"],
  ];

  for (const p of projects) {
    await pool.query(
      "INSERT INTO projects (title,category,style,location,year,image_url) VALUES (?,?,?,?,?,?)",
      p
    );
  }

  console.log("Seeded 20 projects.");
}

async function initialize() {
  if (!databaseReady) {
    databaseReady = ensureDatabase()
      .then(seedAdmin)
      .then(seedProjects)
      .catch((err) => {
        databaseReady = null;
        throw err;
      });
  }
  return databaseReady;
}

app.use(async (_req, res, next) => {
  try {
    await initialize();
    await pool.query("DELETE FROM admin_sessions WHERE expires_at < NOW()");
    next();
  } catch (error) {
    console.error("Database initialization error:", error.message);
    res.status(503).json({
      ok: false,
      message: "Database is not available. Check MySQL and backend/.env.",
    });
  }
});

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1 AS ok");
    res.json({
      ok: true,
      service: "atelier-noire-api",
      database: "connected",
      smtp: smtpConfigured(),
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      service: "atelier-noire-api",
      database: "disconnected",
      message: "Database health check failed.",
    });
  }
});

async function requireAdmin(req, res, next) {
  try {
    const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(401).json({ ok: false, message: "Admin authentication required." });
    }

    const [rows] = await pool.query(
      `SELECT s.admin_id, a.email, a.name
       FROM admin_sessions s
       JOIN admin_users a ON a.id=s.admin_id
       WHERE s.token_hash=? AND s.expires_at > NOW()
       LIMIT 1`,
      [tokenHash(token)]
    );

    if (!rows.length) {
      return res.status(401).json({ ok: false, message: "Admin session expired. Please login again." });
    }

    req.admin = rows[0];
    req.adminToken = token;
    next();
  } catch (error) {
    res.status(500).json({ ok: false, message: "Authentication check failed." });
  }
}

app.post("/api/admin/login", async (req, res) => {
  try {
    const email = cleanText(req.body?.email, 255);
    const password = String(req.body?.password || "");

    if (!validEmail(email) || !password) {
      return res.status(400).json({ ok: false, message: "Enter a valid admin email and password." });
    }

    const [rows] = await pool.query(
      "SELECT id,email,password_hash,name FROM admin_users WHERE email=? LIMIT 1",
      [email]
    );

    if (!rows.length || !verifyPassword(password, rows[0].password_hash)) {
      return res.status(401).json({ ok: false, message: "Invalid admin email or password." });
    }

    const token = createToken();
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO admin_sessions (token_hash,admin_id,expires_at) VALUES (?,?,?)",
      [tokenHash(token), rows[0].id, expiresAt]
    );

    await logAction(rows[0].id, "login", "admin", rows[0].id);

    res.json({
      ok: true,
      token,
      admin: {
        email: rows[0].email,
        name: rows[0].name,
      },
      expiresAt,
    });
  } catch (error) {
    console.error("Admin login error:", error?.code || "unexpected_error");
    res.status(500).json({ ok: false, message: "Unable to login right now." });
  }
});

app.post("/api/admin/logout", requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM admin_sessions WHERE token_hash=?", [tokenHash(req.adminToken)]);
  await logAction(req.admin.admin_id, "logout", "admin", req.admin.admin_id);
  res.json({ ok: true });
});

app.get("/api/admin/me", requireAdmin, async (req, res) => {
  res.json({ ok: true, admin: req.admin });
});

app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
  try {
    const [[projects], [enquiries], [consultations]] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM projects"),
      pool.query("SELECT COUNT(*) AS total FROM enquiries"),
      pool.query("SELECT COUNT(*) AS total FROM consultations"),
    ]);

    const [[newEnquiries]] = await pool.query(
      "SELECT COUNT(*) AS total FROM enquiries WHERE status='new'"
    );

    res.json({
      ok: true,
      stats: {
        projects: Number(projects[0].total),
        enquiries: Number(enquiries[0].total),
        consultations: Number(consultations[0].total),
        newEnquiries: Number(newEnquiries.total),
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Failed to fetch dashboard statistics." });
  }
});

app.get("/api/admin/analytics", requireAdmin, async (_req, res) => {
  try {
    const [[totals]] = await pool.query(`SELECT
      COUNT(*) AS pageViews,
      SUM(event_type='contact_submission') AS contactSubmissions,
      SUM(event_type='consultation_booking') AS consultationBookings
      FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);
    const [daily] = await pool.query(`SELECT DATE(created_at) AS day,
      SUM(event_type='page_view') AS pageViews,
      SUM(event_type='contact_submission') AS contacts,
      SUM(event_type='consultation_booking') AS consultations
      FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at) ORDER BY day ASC`);
    res.json({ok:true, totals:{pageViews:Number(totals.pageViews||0),contactSubmissions:Number(totals.contactSubmissions||0),consultationBookings:Number(totals.consultationBookings||0)},daily});
  } catch (error) {
    console.error("Analytics fetch error:", error?.code || "unexpected_error");
    res.status(500).json({ok:false,message:"Failed to fetch analytics."});
  }
});

app.post("/api/analytics/event", async (req,res) => {
  try {
    const allowed = new Set(["page_view", "contact_submission", "consultation_booking", "project_open"]);
    const eventType = cleanText(req.body?.event_type,60);
    const pagePath = cleanText(req.body?.page_path,500);
    if (!allowed.has(eventType)) return res.status(400).json({ok:false,message:"Unsupported analytics event."});
    await pool.query("INSERT INTO analytics_events (event_type,page_path,metadata) VALUES (?,?,?)", [eventType,pagePath,JSON.stringify({source:"website"})]);
    res.status(201).json({ok:true});
  } catch (error) {
    console.error("Analytics event error:", error?.code || "unexpected_error");
    res.status(500).json({ok:false,message:"Unable to record activity."});
  }
});

app.get("/api/admin/enquiries", requireAdmin, async (_req, res) => {
  const [items] = await pool.query("SELECT * FROM enquiries ORDER BY created_at DESC");
  res.json({ ok: true, items });
});

app.patch("/api/admin/enquiries/:id", requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ ok:false, message:"Invalid enquiry ID." });
  const allowed = ["new", "contacted", "closed"];
  const status = cleanText(req.body?.status, 30);
  if (!allowed.includes(status)) return res.status(400).json({ ok:false, message:"Invalid enquiry status." });

  const [result] = await pool.query("UPDATE enquiries SET status=? WHERE id=?", [status, id]);
  if (!result.affectedRows) return res.status(404).json({ ok:false, message:"Enquiry not found." });
  await logAction(req.admin.admin_id, "status_update", "enquiry", req.params.id, { status });
  res.json({ ok:true });
});

app.delete("/api/admin/enquiries/:id", requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ ok:false, message:"Invalid enquiry ID." });
  const [result] = await pool.query("DELETE FROM enquiries WHERE id=?", [id]);
  if (!result.affectedRows) return res.status(404).json({ ok:false, message:"Enquiry not found." });
  await logAction(req.admin.admin_id, "delete", "enquiry", req.params.id);
  res.json({ ok:true });
});

app.get("/api/admin/consultations", requireAdmin, async (_req, res) => {
  const [items] = await pool.query("SELECT * FROM consultations ORDER BY created_at DESC");
  res.json({ ok: true, items });
});

app.patch("/api/admin/consultations/:id", requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ ok:false, message:"Invalid consultation ID." });
  const allowed = ["new", "confirmed", "completed", "cancelled"];
  const status = cleanText(req.body?.status, 30);
  if (!allowed.includes(status)) return res.status(400).json({ ok:false, message:"Invalid consultation status." });

  const [result] = await pool.query("UPDATE consultations SET status=? WHERE id=?", [status, id]);
  if (!result.affectedRows) return res.status(404).json({ ok:false, message:"Consultation not found." });
  await logAction(req.admin.admin_id, "status_update", "consultation", req.params.id, { status });
  res.json({ ok:true });
});

app.delete("/api/admin/consultations/:id", requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ ok: false, message: "Invalid consultation ID." });
  const [result] = await pool.query("DELETE FROM consultations WHERE id=?", [id]);
  if (!result.affectedRows) return res.status(404).json({ ok: false, message: "Consultation not found." });
  await logAction(req.admin.admin_id, "delete", "consultation", id);
  return res.json({ ok: true, message: "Consultation deleted from the database." });
});

app.get("/api/admin/projects", requireAdmin, async (_req, res) => {
  const [items] = await pool.query(`
    SELECT p.*,
      COALESCE(
        JSON_ARRAYAGG(
          CASE WHEN pi.id IS NULL THEN NULL
               ELSE JSON_OBJECT('id',pi.id,'image_url',pi.image_url,'sort_order',pi.sort_order)
          END
        ), JSON_ARRAY()
      ) AS gallery
    FROM projects p
    LEFT JOIN project_images pi ON pi.project_id=p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
  res.json({ ok: true, items });
});

app.get("/api/projects", async (_req, res) => {
  const [items] = await pool.query("SELECT * FROM projects ORDER BY created_at DESC");
  res.json({ ok: true, items });
});

app.get("/api/projects/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [[project]] = await pool.query("SELECT * FROM projects WHERE id=?", [id]);
  if (!project) return res.status(404).json({ ok:false, message:"Project not found." });
  const [images] = await pool.query(
    "SELECT id,image_url,sort_order FROM project_images WHERE project_id=? ORDER BY sort_order,id",
    [id]
  );
  res.json({ ok:true, item:{ ...project, gallery:images } });
});

app.post("/api/admin/projects", requireAdmin, async (req, res) => {
  const { title, category, location, year, image_url, secondary_url, style, story } = req.body || {};
  if (!cleanText(title,180) || !cleanText(category,80) || !cleanText(location,120)) {
    return res.status(400).json({ ok:false, message:"Title, category and location are required." });
  }

  const [result] = await pool.query(
    "INSERT INTO projects (title,category,style,location,year,image_url,secondary_url,story) VALUES (?,?,?,?,?,?,?,?)",
    [
      cleanText(title,180), cleanText(category,80), cleanText(style,120),
      cleanText(location,120), cleanText(year,10) || String(new Date().getFullYear()),
      cleanText(image_url,2000), cleanText(secondary_url,2000), cleanText(story,10000)
    ]
  );

  await logAction(req.admin.admin_id, "create", "project", result.insertId);
  const [[item]] = await pool.query("SELECT * FROM projects WHERE id=?", [result.insertId]);
  res.status(201).json({ ok:true, item });
});

app.put("/api/admin/projects/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { title, category, location, year, image_url, secondary_url, style, story } = req.body || {};

  if (!cleanText(title,180) || !cleanText(category,80) || !cleanText(location,120)) {
    return res.status(400).json({ ok:false, message:"Title, category and location are required." });
  }

  const [result] = await pool.query(
    "UPDATE projects SET title=?,category=?,style=?,location=?,year=?,image_url=?,secondary_url=?,story=? WHERE id=?",
    [
      cleanText(title,180), cleanText(category,80), cleanText(style,120),
      cleanText(location,120), cleanText(year,10) || String(new Date().getFullYear()),
      cleanText(image_url,2000), cleanText(secondary_url,2000), cleanText(story,10000), id
    ]
  );

  if (!result.affectedRows) return res.status(404).json({ ok:false, message:"Project not found." });
  await logAction(req.admin.admin_id, "update", "project", id);
  const [[item]] = await pool.query("SELECT * FROM projects WHERE id=?", [id]);
  res.json({ ok:true, item });
});

app.delete("/api/admin/projects/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [result] = await pool.query("DELETE FROM projects WHERE id=?", [id]);
  if (!result.affectedRows) return res.status(404).json({ ok:false, message:"Project not found." });
  await logAction(req.admin.admin_id, "delete", "project", id);
  res.json({ ok:true });
});

app.post("/api/admin/projects/:id/images", requireAdmin, async (req, res) => {
  const projectId = positiveId(req.params.id);
  const imageUrl = cleanText(req.body?.image_url, 3000);
  const sortOrder = Number(req.body?.sort_order ?? 0);
  if (!projectId) return res.status(400).json({ok:false,message:"Invalid project ID."});
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000) return res.status(400).json({ok:false,message:"sort_order must be a non-negative integer."});

  const [[project]] = await pool.query("SELECT id FROM projects WHERE id=?", [projectId]);
  if (!project) return res.status(404).json({ok:false,message:"Project not found."});
  if (!validImageUrl(imageUrl)) return res.status(400).json({ok:false,message:"image_url must be a valid HTTP or HTTPS URL."});

  const [result] = await pool.query(
    "INSERT INTO project_images (project_id,image_url,sort_order) VALUES (?,?,?)",
    [projectId,imageUrl,sortOrder]
  );
  await logAction(req.admin.admin_id, "create", "project_image", result.insertId, {projectId});
  const [[item]] = await pool.query("SELECT * FROM project_images WHERE id=?", [result.insertId]);
  res.status(201).json({ok:true,item});
});

app.delete("/api/admin/project-images/:id", requireAdmin, async (req,res)=>{
  const id=positiveId(req.params.id);
  if(!id) return res.status(400).json({ok:false,message:"Invalid project image ID."});
  const [result]=await pool.query("DELETE FROM project_images WHERE id=?", [id]);
  if(!result.affectedRows) return res.status(404).json({ok:false,message:"Project image not found."});
  await logAction(req.admin.admin_id,"delete","project_image",id);
  res.json({ok:true});
});

// Admin-only SMTP smoke test. It can only send to the configured admin recipient.
app.post("/api/admin/email-test", requireAdmin, async (_req, res) => {
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!smtpConfigured() || !recipient || !validEmail(recipient)) {
    return res.status(503).json({ ok: false, message: "SMTP or ADMIN_NOTIFICATION_EMAIL is not configured." });
  }
  try {
    const accepted = await sendEmail({
      to: recipient,
      subject: "Atelier Noire SMTP test",
      text: "This is a test message from the Atelier Noire backend. SMTP accepted the message if it appears in your mail provider inbox.",
      html: "<p>This is a test message from the Atelier Noire backend.</p><p>SMTP accepted the message if it appears in your mail provider inbox.</p>"
    });
    if (!accepted) return res.status(502).json({ ok: false, message: "SMTP did not accept the test message." });
    res.json({ ok: true, status: "accepted_by_smtp", recipientConfigured: true, message: "SMTP accepted the test message. Verify it in the recipient inbox or Mailtrap." });
  } catch (error) {
    console.error("SMTP test failed:", error?.code || "smtp_error");
    res.status(502).json({ ok: false, status: "failed", message: "SMTP test failed. Check SMTP host, port, credentials and provider logs." });
  }
});

// Admin reply endpoint. It sends to the saved record's email, never an arbitrary request recipient.
app.post("/api/admin/enquiries/:id/reply", requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id);
  const subject = cleanText(req.body?.subject, 180);
  const message = cleanText(req.body?.message, 10000);
  if (!id) return res.status(400).json({ ok: false, message: "Invalid enquiry ID." });
  if (!message) return res.status(400).json({ ok: false, message: "Reply message is required." });
  const [[enquiry]] = await pool.query("SELECT id,name,email FROM enquiries WHERE id=? LIMIT 1", [id]);
  if (!enquiry) return res.status(404).json({ ok: false, message: "Enquiry not found." });
  if (!smtpConfigured()) return res.status(503).json({ ok: false, message: "SMTP is not configured." });
  try {
    await sendEmail({
      to: enquiry.email,
      subject: subject || "A reply from Atelier Noire",
      text: `Hello ${enquiry.name},\n\n${message}\n\nAtelier Noire`,
      html: `<p>Hello ${escapeHtml(enquiry.name)},</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p><p>Atelier Noire</p>`
    });
    await logAction(req.admin.admin_id, "email_reply", "enquiry", id);
    return res.json({ ok: true, status: "accepted_by_smtp", message: "SMTP accepted the reply. Check provider/inbox logs for delivery." });
  } catch (error) {
    console.error("Admin reply email failed:", error?.code || "smtp_error");
    return res.status(502).json({ ok: false, status: "failed", message: "Reply email failed. The enquiry was preserved; you can retry." });
  }
});

app.post("/api/admin/consultations/:id/reply", requireAdmin, async (req, res) => {
  const id = positiveId(req.params.id);
  const subject = cleanText(req.body?.subject, 180);
  const message = cleanText(req.body?.message, 10000);
  if (!id) return res.status(400).json({ ok: false, message: "Invalid consultation ID." });
  if (!message) return res.status(400).json({ ok: false, message: "Reply message is required." });
  const [[consultation]] = await pool.query("SELECT id,name,email FROM consultations WHERE id=? LIMIT 1", [id]);
  if (!consultation) return res.status(404).json({ ok: false, message: "Consultation not found." });
  if (!smtpConfigured()) return res.status(503).json({ ok: false, message: "SMTP is not configured." });
  try {
    await sendEmail({
      to: consultation.email,
      subject: subject || "A reply about your Atelier Noire consultation",
      text: `Hello ${consultation.name},\n\n${message}\n\nAtelier Noire`,
      html: `<p>Hello ${escapeHtml(consultation.name)},</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p><p>Atelier Noire</p>`
    });
    await logAction(req.admin.admin_id, "email_reply", "consultation", id);
    return res.json({ ok: true, status: "accepted_by_smtp", message: "SMTP accepted the reply. Check provider/inbox logs for delivery." });
  } catch (error) {
    console.error("Consultation reply email failed:", error?.code || "smtp_error");
    return res.status(502).json({ ok: false, status: "failed", message: "Reply email failed. The consultation was preserved; you can retry." });
  }
});

app.post("/api/contact", publicFormRateLimit, async (req, res) => {
  try {
    const body = req.body || {};
    const name = cleanText(body.name,160);
    const email = cleanText(body.email,255);
    const phone = cleanText(body.phone,60);
    const city = cleanText(body.city,120);
    const projectType = cleanText(body.projectType,120);
    const propertyType = cleanText(body.propertyType,120);
    const area = cleanText(body.area,100);
    const budget = cleanText(body.budget,100);
    const startDate = cleanText(body.startDate,30);
    const message = cleanText(body.message,10000);

    if (!name || !validEmail(email) || !phone || !projectType || !message) {
      return res.status(400).json({ok:false,message:"Please complete all required fields with a valid email."});
    }

    const [result] = await pool.query(
      `INSERT INTO enquiries
      (name,email,phone,city,project_type,property_type,area,budget,start_date,message)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [name,email,phone,city,projectType,propertyType,area,budget,startDate || null,message]
    );

    await pool.query("INSERT INTO analytics_events (event_type,page_path) VALUES (?,?)", ["contact_submission", "/begin-project"]);
    const ref = `ENQ-${String(result.insertId).padStart(5,"0")}`;
    const userText = `Hello ${name},\n\nThank you for contacting Atelier Noire. We received your project enquiry (${ref}). Our studio team will review your brief and get back to you shortly.\n\nAtelier Noire\nInteriors & Architecture`;
    const adminText = `New project enquiry\nReference: ${ref}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCity: ${city || "-"}\nProject: ${projectType}\nProperty: ${propertyType || "-"}\nArea: ${area || "-"}\nBudget: ${budget || "-"}\nStart: ${startDate || "-"}\n\nMessage:\n${message}`;

    const mail = await notifyEmails({
      userEmail:email,
      subject:`We received your Atelier Noire project enquiry (${ref})`,
      userText,
      adminText,
      html:`<p>Hello ${escapeHtml(name)},</p><p>Thank you for contacting <strong>Atelier Noire</strong>. We received your project enquiry <strong>${ref}</strong>.</p><p>Our studio team will review your brief and get back to you shortly.</p><p>Atelier Noire<br>Interiors &amp; Architecture</p>`
    });

    await pool.query(
      "UPDATE enquiries SET email_sent=?,admin_notified=? WHERE id=?",
      [mail.userSent ? 1 : 0,mail.adminSent ? 1 : 0,result.insertId]
    );

    res.status(201).json({ok:true,id:result.insertId,reference:ref,emailSent:mail.userSent,adminNotified:mail.adminSent,emailStatus:mail.userSent ? "accepted_by_smtp" : "failed_or_not_configured",message:"Enquiry saved successfully. Email status is reported separately."});
  } catch (error) {
    console.error("Create enquiry error:",error?.code || "unexpected_error");
    res.status(500).json({ok:false,message:"Failed to submit enquiry."});
  }
});

app.post("/api/consultations", publicFormRateLimit, async (req,res)=>{
  try {
    const name=cleanText(req.body?.name,160);
    const email=cleanText(req.body?.email,255);
    const phone=cleanText(req.body?.phone,60);
    const date=cleanText(req.body?.date,30);
    const time=cleanText(req.body?.time,60);
    const mode=cleanText(req.body?.mode,120) || "Video consultation";

    if(!name || !validEmail(email) || !phone || !date || !time){
      return res.status(400).json({ok:false,message:"Please complete the consultation form."});
    }

    const [result]=await pool.query(
      "INSERT INTO consultations (name,email,phone,preferred_date,preferred_time,message) VALUES (?,?,?,?,?,?)",
      [name,email,phone,date,time,mode]
    );

    await pool.query("INSERT INTO analytics_events (event_type,page_path) VALUES (?,?)", ["consultation_booking", "/contact"]);
    const ref=`CON-${String(result.insertId).padStart(5,"0")}`;
    const userText=`Hello ${name},\n\nYour Atelier Noire consultation request (${ref}) has been received.\nRequested date: ${date}\nRequested time: ${time}\nMode: ${mode}\n\nOur studio will confirm the appointment with you.\n\nAtelier Noire`;
    const adminText=`New consultation request\nReference: ${ref}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${date}\nTime: ${time}\nMode: ${mode}`;

    const mail=await notifyEmails({
      userEmail:email,
      subject:`Atelier Noire consultation request received (${ref})`,
      userText,
      adminText,
      html:`<p>Hello ${escapeHtml(name)},</p><p>Your Atelier Noire consultation request <strong>${ref}</strong> has been received.</p><p><strong>${escapeHtml(date)}</strong> · <strong>${escapeHtml(time)}</strong> · ${escapeHtml(mode)}</p><p>Our studio will confirm the appointment with you.</p>`
    });

    await pool.query(
      "UPDATE consultations SET email_sent=?,admin_notified=? WHERE id=?",
      [mail.userSent ? 1 : 0,mail.adminSent ? 1 : 0,result.insertId]
    );

    res.status(201).json({ok:true,id:result.insertId,reference:ref,emailSent:mail.userSent,adminNotified:mail.adminSent,emailStatus:mail.userSent ? "accepted_by_smtp" : "failed_or_not_configured",message:"Consultation saved successfully. Email status is reported separately."});
  } catch(error){
    console.error("Create consultation error:",error?.code || "unexpected_error");
    res.status(500).json({ok:false,message:"Failed to create consultation."});
  }
});

app.use("/api", (_req,res) => {
  res.status(404).json({ok:false,message:"API endpoint not found."});
});

app.use((error, _req, res, _next) => {
  if (res.headersSent) return;
  const status = error?.type === "entity.too.large" ? 413 :
    error instanceof SyntaxError && error?.status === 400 ? 400 :
    /CORS/i.test(String(error?.message || "")) ? 403 : 500;
  if (status === 500) console.error("Unhandled API error:", error?.code || "unexpected_error");
  res.status(status).json({
    ok: false,
    message: status === 413 ? "Request body is too large." :
      status === 400 ? "Malformed JSON request body." :
      status === 403 ? "Request origin is not allowed." :
      "Unexpected server error. Please try again later."
  });
});

export { app, initialize };

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Atelier Noire backend: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    initialize()
      .then(() => {
        console.log("Database initialized successfully.");
      })
      .catch((error) => {
        console.warn("\n[WARNING] Database connection pending: " + error.message);
        console.warn("Please configure your DB_PASSWORD and DB credentials in 'backend/.env'.");
        console.warn("The backend server is running and will connect once credentials are configured.\n");
      });
  });
}
