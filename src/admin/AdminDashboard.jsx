import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence
} from "framer-motion";


import {
  LayoutDashboard,
  FolderKanban,
  Mail,
  CalendarDays,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  RefreshCw,
  Menu,
  X,
  Bell,
  ArrowUpRight,
  BarChart3
} from "lucide-react";


import { useNavigate } from "react-router-dom";


// ======================================
// API BASE URL
// ======================================

const API_BASE = "";


// ======================================
// ADMIN TABS
// ======================================

const tabs = [
  ["overview", "Overview", LayoutDashboard],
  ["projects", "Projects", FolderKanban],
  ["enquiries", "Enquiries", Mail],
  ["consultations", "Consultations", CalendarDays],
  ["analytics", "Conversion Analytics", BarChart3]
];


// ======================================
// EMPTY PROJECT FORM
// ======================================

const empty = {
  title: "",
  category: "Living",
  location: "",
  year: "2026",
  image_url: "",
  secondary_url: "",
  style: "Modern",
  story: ""
};

// ======================================
// MAIN ADMIN DASHBOARD
// ======================================

export default function AdminDashboard() {

  const navigate = useNavigate();

  const token = localStorage.getItem("atelier_admin_token");

  const [tab, setTab] = useState("overview");

  const [stats, setStats] = useState({
    projects: 0,
    enquiries: 0,
    consultations: 0,
    newEnquiries: 0
  });

  const [items, setItems] = useState({
    projects: [],
    enquiries: [],
    consultations: []
  });

  const [form, setForm] = useState(empty);

  const [adding, setAdding] = useState(false);

  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(true);

  const [mobile, setMobile] = useState(false);

  const [analytics, setAnalytics] = useState({ totals: { pageViews: 0, contactSubmissions: 0, consultationBookings: 0 }, daily: [] });
  const [notice, setNotice] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const adminEmail = localStorage.getItem("atelier_admin_email") || "";


  // ======================================
  // API HELPER
  // ======================================

  const api = async (path, options = {}) => {

    const response = await fetch(
      `${API_BASE}${path}`,
      {
        ...options,

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,

          ...options.headers
        }
      }
    );


    // Session expired
    if (response.status === 401) {

      localStorage.removeItem("atelier_admin_token");

      navigate("/admin/login", {
        replace: true
      });

      throw new Error("Session expired.");
    }


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message || "Request failed"
      );
    }


    return data;
  };


  // ======================================
  // LOAD DASHBOARD DATA
  // ======================================

  const load = async () => {

    setLoading(true);

    try {

      const [
        statsResponse,
        projectsResponse,
        enquiriesResponse,
        consultationsResponse,
        analyticsResponse
      ] = await Promise.all([

        api("/api/admin/stats"),

        api("/api/admin/projects"),

        api("/api/admin/enquiries"),

        api("/api/admin/consultations"),
        api("/api/admin/analytics").catch(() => ({ totals: { pageViews: 0, contactSubmissions: 0, consultationBookings: 0 }, daily: [] }))
      ]);


      setStats(
        statsResponse.stats
      );
      setAnalytics(analyticsResponse);


      setItems({

        projects:
          projectsResponse.items || [],

        enquiries:
          enquiriesResponse.items || [],

        consultations:
          consultationsResponse.items || []

      });

    } catch (error) {

      console.error(
        "Dashboard loading error:",
        error
      );

    } finally {

      setLoading(false);
    }
  };


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    if (!token) {

      navigate("/admin/login", {
        replace: true
      });

      return;
    }

    load();

  }, []);


  // ======================================
  // LOGOUT
  // ======================================

  const logout = async () => {

    try {

      await api(
        "/api/admin/logout",
        {
          method: "POST"
        }
      );

    } catch {

      // Ignore logout API error
    }


    localStorage.removeItem(
      "atelier_admin_token"
    );

    localStorage.removeItem(
      "atelier_admin_email"
    );


    navigate(
      "/admin/login",
      {
        replace: true
      }
    );
  };


  // ======================================
  // ADD PROJECT
  // ======================================

  const addProject = async (e) => {

    e.preventDefault();

    try {

      await api(
        "/api/admin/projects",
        {
          method: "POST",

          body: JSON.stringify(form)
        }
      );


      setForm(empty);

      setAdding(false);

      await load();

    } catch (error) {

      alert(
        error.message ||
        "Failed to create project."
      );
    }
  };


  const updateProject = async (e) => {
  e.preventDefault();

  try {
    await api(`/api/admin/projects/${editing.id}`, {
      method: "PUT",
      body: JSON.stringify(editing)
    });

    setEditing(null);
    await load();

  } catch (error) {
    alert(
      error.message ||
      "Failed to update project."
    );
  }
};

  // ======================================
  // DELETE PROJECT
  // ======================================

  const removeProject = async (id) => {

    if (
      !window.confirm(
        "Delete this project from the admin list?"
      )
    ) {
      return;
    }


    try {

      await api(
        `/api/admin/projects/${id}`,
        {
          method: "DELETE"
        }
      );


      await load();

    } catch (error) {

      alert(
        error.message ||
        "Failed to delete project."
      );
    }
  };


  // ======================================
  // DELETE ENQUIRY / CONSULTATION (ADMIN ONLY)
  // ======================================

  const removeEnquiry = async (id) => {
    if (!window.confirm("Delete this project enquiry permanently from the database? This cannot be undone.")) return;
    try {
      await api(`/api/admin/enquiries/${id}`, { method: "DELETE" });
      await load();
      alert("Enquiry deleted from the database.");
    } catch (error) {
      alert(error.message || "Failed to delete enquiry.");
    }
  };

  const removeConsultation = async (id) => {
    if (!window.confirm("Delete this consultation permanently from the database? This cannot be undone.")) return;
    try {
      await api(`/api/admin/consultations/${id}`, { method: "DELETE" });
      await load();
      alert("Consultation deleted from the database.");
    } catch (error) {
      alert(error.message || "Failed to delete consultation.");
    }
  };

  const replyTo = async (kind, item) => {
    const subject = window.prompt("Email subject:", kind === "enquiry" ? "A reply from Atelier Noire" : "A reply about your Atelier Noire consultation");
    if (subject === null) return;
    const message = window.prompt(`Write your reply to ${item.name} (${item.email}):`);
    if (message === null || !message.trim()) return;
    try {
      const result = await api(`/api/admin/${kind === "enquiry" ? "enquiries" : "consultations"}/${item.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ subject, message })
      });
      alert(result.message || "Reply accepted by SMTP. Check provider/inbox logs for delivery.");
    } catch (error) {
      alert(error.message || "Failed to send reply email.");
    }
  };

  // ======================================
  // RENDER
  // ======================================

  return (

    <main className="admin-shell">

      {/* ================= SIDEBAR ================= */}

      <aside
        className={
          `admin-sidebar ${mobile ? "open" : ""}`
        }
      >

        <div className="admin-side-brand">

          <span>AN</span>

          <div>

            <b>ATELIER NOIRE</b>

            <small>
              INTERIORS & ARCHITECTURE · ADMIN
            </small>

          </div>


          <button
            className="admin-mobile-close"
            onClick={() => setMobile(false)}
          >
            <X />
          </button>

        </div>


        <div className="admin-nav">

          {tabs.map(
            ([id, label, Icon]) => (

              <button
                className={
                  tab === id
                    ? "active"
                    : ""
                }
                key={id}
                onClick={() => {

                  setTab(id);

                  setMobile(false);
                }}
              >

                <Icon size={17} />

                {label}

              </button>

            )
          )}

        </div>


        <button
          className="admin-logout"
          onClick={logout}
        >

          <LogOut size={16} />

          Logout

        </button>

      </aside>


      {/* ================= MAIN ================= */}

      <section className="admin-main">

        {/* HEADER */}

        <header className="admin-top">

          <button
            className="admin-mobile-open"
            onClick={() => setMobile(true)}
          >
            <Menu />
          </button>


          <div>

            <span>
              ATELIER NOIRE / ADMIN
            </span>

            <h1>
              {
                tabs.find(
                  x => x[0] === tab
                )?.[1]
              }
            </h1>

          </div>


          <div className="admin-top-actions">

            <button
              className="notification-button"
              onClick={() =>
                setNotice(true)
              }
              aria-label="Notifications"
            >

              <Bell size={17} />

              {stats.newEnquiries > 0 && (
                <i>
                  {stats.newEnquiries}
                </i>
              )}

            </button>


            <button
              onClick={load}
              title="Refresh"
            >

              <RefreshCw size={17} />

            </button>


            <button
              type="button"
              className="admin-profile"
              aria-label="Open admin profile"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((open) => !open)}
            >
              <div className="admin-avatar">
                {(adminEmail.split("@")[0] || "AD").slice(0, 2).toUpperCase()}
              </div>
              <span>Admin</span>
            </button>

          </div>

        </header>


        {/* ================= ADMIN PROFILE ================= */}
        <AnimatePresence>
          {profileOpen && (
            <>
              <motion.div
                className="notice-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setProfileOpen(false)}
              />
              <motion.aside
                className="notification-drawer admin-profile-drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3 }}
                role="dialog"
                aria-label="Admin profile"
              >
                <div className="drawer-head">
                  <div>
                    <span>ACCOUNT</span>
                    <h2>Admin Profile</h2>
                  </div>
                  <button type="button" onClick={() => setProfileOpen(false)} aria-label="Close profile">
                    <X />
                  </button>
                </div>
                <div className="admin-profile-details">
                  <div className="admin-avatar admin-profile-large">
                    {(adminEmail.split("@")[0] || "AD").slice(0, 2).toUpperCase()}
                  </div>
                  <p>Administrator</p>
                  <p>{adminEmail || "Signed-in admin"}</p>
                  <button type="button" onClick={() => { setProfileOpen(false); logout(); }}>
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ================= NOTIFICATIONS ================= */}

        <AnimatePresence>

          {notice && (

            <>

              <motion.div
                className="notice-overlay"
                initial={{
                  opacity: 0
                }}
                animate={{
                  opacity: 1
                }}
                exit={{
                  opacity: 0
                }}
                onClick={() =>
                  setNotice(false)
                }
              />


              <motion.aside
                className="notification-drawer"
                initial={{
                  x: "100%"
                }}
                animate={{
                  x: 0
                }}
                exit={{
                  x: "100%"
                }}
                transition={{
                  duration: 0.45,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1
                  ]
                }}
              >

                <div className="drawer-head">

                  <div>

                    <span>
                      STUDIO INBOX
                    </span>

                    <h2>
                      Notifications
                    </h2>

                  </div>


                  <button
                    onClick={() =>
                      setNotice(false)
                    }
                  >
                    <X />
                  </button>

                </div>


                {items.enquiries.length ? (

                  <div className="notice-list">

                    {items.enquiries
                      .slice(0, 8)
                      .map(x => (

                        <button
                          key={x.id}
                          onClick={() => {

                            setTab(
                              "enquiries"
                            );

                            setNotice(false);
                          }}
                        >

                          <span className="notice-dot" />

                          <div>

                            <b>
                              {x.name}
                            </b>

                            <p>
                              New enquiry
                            </p>

                            <small>
                              {formatDate(
                                x.created_at
                              )}
                            </small>

                          </div>


                          <ArrowUpRight
                            size={14}
                          />

                        </button>

                      ))}

                  </div>

                ) : (

                  <div className="drawer-empty">

                    <Bell size={24} />

                    <p>
                      No new notifications.
                    </p>

                  </div>

                )}

              </motion.aside>

            </>

          )}

        </AnimatePresence>


        {/* ================= CONTENT ================= */}

        <AnimatePresence mode="wait">

          <motion.div
            key={tab}
            className="admin-content"
            initial={{
              opacity: 0,
              y: 18
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -12
            }}
            transition={{
              duration: 0.35
            }}
          >

            {loading ? (

              <div className="admin-loading">
                Loading studio data…
              </div>

            ) : tab === "overview" ? (

              <Overview
                stats={stats}
                items={items}
              />

            ) : tab === "projects" ? (

              <Projects
  items={items.projects}
  adding={adding}
  setAdding={setAdding}
  form={form}
  setForm={setForm}
  addProject={addProject}
  removeProject={removeProject}
  editing={editing}
  setEditing={setEditing}
  updateProject={updateProject}
/>

            ) : tab === "enquiries" ? (

              <Enquiries
                items={items.enquiries}
                onDelete={removeEnquiry}
                onReply={(item) => replyTo("enquiry", item)}
              />

            ) : tab === "consultations" ? (
              <Consultations items={items.consultations} onDelete={removeConsultation} onReply={(item) => replyTo("consultation", item)} />
            ) : (
              <AnalyticsPanel analytics={analytics} />
            )}

          </motion.div>

        </AnimatePresence>

      </section>

    </main>
  );
}


function AnalyticsPanel({ analytics }) {
  const totals = analytics?.totals || {};
  const cards = [["Page views · 30 days", totals.pageViews || 0], ["Contact submissions · 30 days", totals.contactSubmissions || 0], ["Consultation bookings · 30 days", totals.consultationBookings || 0]];
  return <section className="admin-panel" style={{ padding: 24 }}>
    <div className="admin-toolbar"><div><span>WEBSITE PERFORMANCE</span><p>Basic conversion activity recorded from public website visits and submitted forms.</p></div></div>
    <div className="admin-stats-grid">{cards.map(([label,value]) => <article className="admin-stat-card" key={label}><span>{label}</span><strong>{Number(value).toLocaleString()}</strong></article>)}</div>
    <h3 style={{ marginTop: 28 }}>Last 7 days</h3>
    <div style={{ overflowX: "auto" }}><table><thead><tr><th>Date</th><th>Page views</th><th>Contact forms</th><th>Consultations</th></tr></thead><tbody>
      {(analytics?.daily || []).length ? analytics.daily.map((day) => <tr key={String(day.day)}><td>{new Date(day.day).toLocaleDateString()}</td><td>{Number(day.pageViews || 0)}</td><td>{Number(day.contacts || 0)}</td><td>{Number(day.consultations || 0)}</td></tr>) : <tr><td colSpan="4">No activity has been recorded yet.</td></tr>}
    </tbody></table></div>
    <p style={{ opacity: .7, marginTop: 16, fontSize: 12 }}>Analytics are basic event counts, not unique visitors or a third-party analytics service.</p>
  </section>;
}

// ======================================
// DATE FORMATTER
// ======================================

function formatDate(value) {

  if (!value) {
    return "—";
  }

  return new Date(value)
    .toLocaleDateString(
      "en-IN"
    );
}


// ======================================
// OVERVIEW
// ======================================

function Overview({
  stats,
  items
}) {

  return (

    <>

      <div className="admin-welcome">

        <div>

          <span>
            GOOD MORNING
          </span>

          <h2>
            The studio, at a glance.
          </h2>

          <p>
            One place for the work,
            conversations and upcoming
            consultations.
          </p>

        </div>


        <div className="admin-date">

          {new Date().toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "long",
              year: "numeric"
            }
          )}

        </div>

      </div>


      <div className="stat-grid">

        {[
          [
            "Projects",
            stats.projects,
            "Published portfolio"
          ],

          [
            "Enquiries",
            stats.enquiries,
            "Total conversations"
          ],

          [
            "New enquiries",
            stats.newEnquiries,
            "Need attention"
          ],

          [
            "Consultations",
            stats.consultations,
            "Requests received"
          ]

        ].map(
          ([title, value, description], index) => (

            <motion.div
              className="stat-card"
              initial={{
                opacity: 0,
                y: 25
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: index * 0.08
              }}
              key={title}
            >

              <span>
                {title}
              </span>

              <strong>
                {value}
              </strong>

              <small>
                {description}
              </small>

            </motion.div>

          )
        )}

      </div>


      <div className="admin-two-col">

        {/* RECENT ENQUIRIES */}

        <section className="admin-panel">

          <div className="panel-head">

            <div>

              <span>
                RECENT ENQUIRIES
              </span>

              <h3>
                Latest conversations
              </h3>

            </div>

          </div>


          {items.enquiries
            .slice(0, 5)
            .length ? (

            items.enquiries
              .slice(0, 5)
              .map(x => (

                <div
                  className="admin-row"
                  key={x.id}
                >

                  <div className="row-avatar">

                    {x.name
                      ?.slice(0, 1)
                      || "A"}

                  </div>


                  <div>

                    <b>
                      {x.name}
                    </b>

                    <small>
                      {x.email}
                    </small>

                  </div>


                  <em>
                    {formatDate(
                      x.created_at
                    )}
                  </em>

                </div>

              ))

          ) : (

            <p className="empty-state">
              No enquiries yet.
            </p>

          )}

        </section>


        {/* RECENT PROJECTS */}

        <section className="admin-panel">

          <div className="panel-head">

            <div>

              <span>
                RECENT PROJECTS
              </span>

              <h3>
                Portfolio library
              </h3>

            </div>

          </div>


          {items.projects
            .slice(0, 5)
            .map(x => (

              <div
                className="admin-row"
                key={x.id}
              >

                <div className="project-dot" />

                <div>

                  <b>
                    {x.title}
                  </b>

                  <small>
                    {x.category} ·{" "}
                    {x.location}
                  </small>

                </div>


                <em>
                  {formatDate(
                    x.created_at
                  )}
                </em>

              </div>

            ))}

        </section>

      </div>

    </>
  );
}


// ======================================
// PROJECTS
// ======================================

function Projects({
  items,
  adding,
  setAdding,
  form,
  setForm,
  addProject,
  removeProject,
  editing,
  setEditing,
  updateProject
}) {
  return (

    <>

      <div className="admin-toolbar">

        <div>

          <span>
            PORTFOLIO LIBRARY
          </span>

          <p>
            Manage the studio's
            project catalogue.
          </p>

        </div>


        <button
          className="admin-primary"
          onClick={() =>
            setAdding(v => !v)
          }
        >

          <Plus size={16} />

          {adding
            ? "Close"
            : "Add project"}

        </button>

      </div>


      {adding && (

        <motion.form
          className="admin-add-form"
          onSubmit={addProject}
          initial={{
            height: 0,
            opacity: 0
          }}
          animate={{
            height: "auto",
            opacity: 1
          }}
        >

          <input
            placeholder="Project title"
            value={form.title}
            onChange={e =>
              setForm({
                ...form,
                title: e.target.value
              })
            }
            required
          />


          <select
            value={form.category}
            onChange={e =>
              setForm({
                ...form,
                category: e.target.value
              })
            }
          >

            <option>
              Living
            </option>

            <option>
              Bedroom
            </option>

            <option>
              Kitchen
            </option>

            <option>
              Dining
            </option>

          </select>


          <input
            placeholder="Location"
            value={form.location}
            onChange={e =>
              setForm({
                ...form,
                location: e.target.value
              })
            }
            required
          />


          <input
            placeholder="Year"
            value={form.year}
            onChange={e =>
              setForm({
                ...form,
                year: e.target.value
              })
            }
          />

        <input placeholder="Cover image URL" value={form.image_url || ""} onChange={e => setForm({ ...form, image_url: e.target.value })} />
        <input placeholder="Video / secondary media URL (optional)" value={form.secondary_url || ""} onChange={e => setForm({ ...form, secondary_url: e.target.value })} />
        <input placeholder="Design style (e.g. Modern, Minimalist)" value={form.style || ""} onChange={e => setForm({ ...form, style: e.target.value })} />
        <textarea placeholder="Project story / description" value={form.story || ""} onChange={e => setForm({ ...form, story: e.target.value })} rows={3} />

          <button className="admin-primary">
            Save project
          </button>

        </motion.form>

      )}
        {editing && (
  <motion.form
    className="admin-add-form"
    onSubmit={updateProject}
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
  >
    <input
      placeholder="Project title"
      value={editing.title}
      onChange={e =>
        setEditing({
          ...editing,
          title: e.target.value
        })
      }
      required
    />

    <select
      value={editing.category}
      onChange={e =>
        setEditing({
          ...editing,
          category: e.target.value
        })
      }
    >
      <option>Living</option>
      <option>Bedroom</option>
      <option>Kitchen</option>
      <option>Dining</option>
    </select>

    <input
      placeholder="Location"
      value={editing.location}
      onChange={e =>
        setEditing({
          ...editing,
          location: e.target.value
        })
      }
      required
    />

    <input
      placeholder="Year"
      value={editing.year}
      onChange={e =>
        setEditing({
          ...editing,
          year: e.target.value
        })
      }
    />
<input placeholder="Cover image URL" value={editing.image_url || ""} onChange={e => setEditing({ ...editing, image_url: e.target.value })} />
<input placeholder="Video / secondary media URL (optional)" value={editing.secondary_url || ""} onChange={e => setEditing({ ...editing, secondary_url: e.target.value })} />
<input placeholder="Design style" value={editing.style || ""} onChange={e => setEditing({ ...editing, style: e.target.value })} />
<textarea placeholder="Project story / description" value={editing.story || ""} onChange={e => setEditing({ ...editing, story: e.target.value })} rows={3} />
    <button
      type="submit"
      className="admin-primary"
    >
      Update project
    </button>

    <button
      type="button"
      onClick={() => setEditing(null)}
    >
      Cancel
    </button>
  </motion.form>
)}



      <section className="admin-panel table-panel">

        <table>

          <thead>

            <tr>

              <th>
                Project
              </th>

              <th>
                Category
              </th>

              <th>
                Location
              </th>

              <th>
                Year
              </th>

              <th>
                Status
              </th>

              <th />

            </tr>

          </thead>


          <tbody>

            {items.map(x => (

              <tr key={x.id}>

                <td>
                  <b>
                    {x.title}
                  </b>
                </td>

                <td>
                  {x.category}
                </td>

                <td>
                  {x.location}
                </td>

                <td>
                  {new Date(
                    x.created_at
                  ).getFullYear()}
                </td>

                <td>

                  <span className="status-pill">
                    Published
                  </span>

                </td>

                <td>

                  <button
  className="icon-button"
  onClick={() =>
   setEditing({
  id: x.id,
  title: x.title || "",
  category: x.category || "Living",
  location: x.location || "",
  year: x.year || "",
  image_url: x.image_url || "",
  secondary_url: x.secondary_url || "",
  style: x.style || "",
  story: x.story || ""
})
  }
  title="Edit project"
>
  <Pencil size={15} />
</button>

<button
  className="icon-danger"
  onClick={() =>
    removeProject(x.id)
  }
  title="Delete project"
>
  <Trash2 size={15} />
</button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>

    </>

  );
}


// ======================================
// ENQUIRIES
// ======================================

function Enquiries({
  items,
  onDelete,
  onReply
}) {

  return (

    <section className="admin-panel table-panel">

      <div className="panel-head">

        <div>

          <span>
            CONTACT FORM
          </span>

          <h3>
            Project enquiries
          </h3>

        </div>

      </div>


      {items.length ? (

        <table>

          <thead>

            <tr>

              <th>
                Client
              </th>

              <th>
                Contact
              </th>

              <th>
                Message
              </th>

              <th>
                Email status
              </th>

              <th>
                Received
              </th>

              <th>Actions</th>

            </tr>

          </thead>


          <tbody>

            {items.map(x => (

              <tr key={x.id}>

                <td>

                  <b>
                    {x.name}
                  </b>

                  <small>
                    #{x.id}
                  </small>

                </td>


                <td>

                  {x.email}

                  <br />

                  {x.phone}

                </td>


                <td>

                  {x.message || "—"}

                </td>

                <td>
                  <span className="status-pill">{Number(x.email_sent) ? "Confirmation accepted by SMTP" : "Confirmation not sent"}</span>
                </td>

                <td>
                  {new Date(x.created_at).toLocaleString("en-IN")}
                </td>
                <td>
                  <div className="admin-record-actions">
                    <button type="button" onClick={() => onReply(x)}>Reply by email</button>
                    <button type="button" className="admin-danger-action" onClick={() => onDelete(x.id)}>Delete</button>
                  </div>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      ) : (

        <p className="empty-state">
          No enquiries yet.
        </p>

      )}

    </section>

  );
}


// ======================================
// CONSULTATIONS
// ======================================

function Consultations({
  items,
  onDelete,
  onReply
}) {

  return (

    <section className="admin-panel table-panel">

      <div className="panel-head">

        <div>

          <span>
            BOOKING REQUESTS
          </span>

          <h3>
            Consultations
          </h3>

        </div>

      </div>


      {items.length ? (

        <table>

          <thead>

            <tr>

              <th>
                Client
              </th>

              <th>
                Date
              </th>

              <th>
                Time
              </th>

              <th>
                Mode
              </th>

              <th>
                Contact
              </th>

              <th>Actions</th>

            </tr>

          </thead>


          <tbody>

            {items.map(x => (

              <tr key={x.id}>

                <td>

                  <b>
                    {x.name}
                  </b>

                  <small>
                    #{x.id}
                  </small>

                </td>


                <td>

                  {x.preferred_date
                    ? new Date(
                        x.preferred_date
                      ).toLocaleDateString(
                        "en-IN"
                      )
                    : "—"}

                </td>


                <td>

                  {x.preferred_time ||
                    "—"}

                </td>


                <td>

                  {x.message ||
                    "Video consultation"}

                </td>


                <td>
                  {x.email}<br />{x.phone}
                </td>
                <td>
                  <div className="admin-record-actions">
                    <button type="button" onClick={() => onReply(x)}>Reply by email</button>
                    <button type="button" className="admin-danger-action" onClick={() => onDelete(x.id)}>Delete</button>
                  </div>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      ) : (

        <p className="empty-state">
          No consultation requests yet.
        </p>

      )}

    </section>

  );
}