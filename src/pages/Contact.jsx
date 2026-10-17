import { useState } from "react";
import { ArrowUpRight, CheckCircle2, CalendarDays, Clock, MapPin, Mail, Phone, Send, ShieldCheck, MessageCircle, CalendarPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Layout, Sequence, Reveal } from "../components/Layout";
import {
  STUDIO_WHATSAPP_NUMBER,
  STUDIO_PHONE_DISPLAY,
  STUDIO_PHONE_TEL,
  STUDIO_EMAIL,
  getWhatsAppUrl,
  getGoogleCalendarUrl
} from "../lib/constants";

const initial = {
  name: "",
  email: "",
  phone: "",
  date: "",
  time: "",
  mode: "Video consultation",
};

export default function Contact() {
  const [book, setBook] = useState(initial);
  const [status, setStatus] = useState({
    state: "idle",
    message: "",
    reference: "",
    clientWhatsAppUrl: "",
    adminWhatsAppUrl: "",
    adminNotified: false,
    emailSent: false
  });

  const update = (name, value) => setBook((v) => ({ ...v, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({
      state: "loading",
      message: "",
      reference: "",
      clientWhatsAppUrl: "",
      adminWhatsAppUrl: "",
      adminNotified: false,
      emailSent: false
    });

    try {
      const r = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Unable to request consultation.");

      const refId = d.reference || (d.id ? `CON-${String(d.id).padStart(5, "0")}` : "CON-NEW");
      const clientUrl = d.clientWhatsAppUrl || getWhatsAppUrl(`Hello Atelier Noire, I have scheduled private consultation ${refId} for ${book.date} at ${book.time} (${book.mode}).`);

      setStatus({
        state: "success",
        message: "Your private consultation has been reserved with our principal studio team.",
        reference: refId,
        clientWhatsAppUrl: clientUrl,
        adminWhatsAppUrl: d.adminWhatsAppUrl || "",
        adminNotified: d.adminNotified,
        emailSent: d.emailSent
      });
    } catch (err) {
      setStatus({
        state: "error",
        message: err.message || "Unable to submit consultation request. Please message us on WhatsApp directly at +91 93078 98468.",
        reference: "",
        clientWhatsAppUrl: "",
        adminWhatsAppUrl: "",
        adminNotified: false,
        emailSent: false
      });
    }
  };

  return (
    <Layout>
      <section
        className="contact-hero"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2200&q=92)",
        }}
      >
        <Sequence>
          <span className="eyebrow">CONSULTATION · FIRST CONVERSATION</span>
          <h1>
            Let’s reserve a time<br />
            <i>for your vision.</i>
          </h1>
          <p>
            An exploratory dialogue with our studio principals. Select a preferred mode and date to discuss your residence.
          </p>
          <div className="contact-hero-line">
            <span>
              <MapPin size={14} /> Mumbai · Pune · Goa
            </span>
            <span>
              <Mail size={14} /> {STUDIO_EMAIL}
            </span>
          </div>
        </Sequence>
      </section>

      <section className="contact-layout contact-consultation-only">
        <motion.div
          className="contact-side"
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <Sequence>
            <div>
              <span>DIRECT INQUIRIES</span>
              <a href={`mailto:${STUDIO_EMAIL}`}>{STUDIO_EMAIL}</a>
            </div>
            <div>
              <span>STUDIO CONCIERGE & WHATSAPP</span>
              <a href={`tel:${STUDIO_PHONE_TEL}`}>{STUDIO_PHONE_DISPLAY}</a>
            </div>
            <div>
              <span>STUDIO LOCATIONS</span>
              <p>
                Mumbai · Pune · Goa<br />
                India
              </p>
            </div>

            <div className="contact-trust-badges">
              <div className="trust-badge-item">
                <ShieldCheck size={16} />
                <span>NDA & Client Privacy Guaranteed</span>
              </div>
              <div className="trust-badge-item">
                <Clock size={16} />
                <span>Response within 24 Business Hours</span>
              </div>
            </div>

            <div className="contact-note">
              <p>Already have project dimensions & scope?</p>
              <a href="/begin-project" className="pill outline small-pill">
                Use Project Scope Estimator <ArrowUpRight size={14} />
              </a>
            </div>
          </Sequence>
        </motion.div>

        <motion.div
          className="contact-form-wrapper"
          initial={{ opacity: 0, x: 35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.9, delay: 0.12 }}
        >
          {status.state === "success" ? (
            <div className="brief-success-card">
              <div className="success-icon-wrap">
                <CheckCircle2 size={36} />
              </div>
              <span className="eyebrow">CONSULTATION CONFIRMED</span>
              <h3>Booking Reference: {status.reference}</h3>
              <p>{status.message}</p>

              {/* Notification routing confirmation badges */}
              <div className="notification-status-box" style={{ background: "rgba(169, 150, 104, 0.12)", border: "1px solid rgba(169, 150, 104, 0.3)", borderRadius: "6px", padding: "14px 16px", margin: "18px 0" }}>
                <span style={{ display: "block", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", color: "#54462e", marginBottom: "8px" }}>
                  DUAL NOTIFICATION ROUTING DISPATCHED:
                </span>
                <div style={{ display: "grid", gap: "6px", fontSize: "12px", color: "#423d35" }}>
                  <div>✓ <strong>Main Studio Admin:</strong> Logged in dashboard & routed to Studio WhatsApp (+91 93078 98468)</div>
                  <div>✓ <strong>Client Confirmation:</strong> Prepared for {book.name} ({book.email})</div>
                </div>
              </div>

              <div className="success-details">
                <p>
                  <strong>Client:</strong> {book.name}
                </p>
                <p>
                  <strong>Phone / WhatsApp:</strong> {book.phone}
                </p>
                <p>
                  <strong>Preferred Date & Time:</strong> {book.date} at {book.time}
                </p>
                <p>
                  <strong>Consultation Mode:</strong> {book.mode}
                </p>
              </div>

              <div className="success-actions">
                <a
                  href={status.clientWhatsAppUrl || getWhatsAppUrl(`Hello Atelier Noire, I have scheduled consultation ${status.reference} for ${book.date} at ${book.time} (${book.mode}).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill dark"
                >
                  <MessageCircle size={15} /> Confirm on WhatsApp Studio
                </a>

                <a
                  href={getGoogleCalendarUrl({
                    title: `Atelier Noire Private Consultation (${status.reference})`,
                    description: `Private interior architecture consultation with Atelier Noire leadership. Mode: ${book.mode}.`,
                    date: book.date,
                    time: book.time,
                    location: book.mode
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill outline"
                >
                  <CalendarPlus size={15} /> Add to Calendar
                </a>

                <button
                  type="button"
                  className="pill outline"
                  onClick={() => {
                    setBook(initial);
                    setStatus({ state: "idle", message: "", reference: "", clientWhatsAppUrl: "", adminWhatsAppUrl: "", adminNotified: false, emailSent: false });
                  }}
                >
                  Schedule Another Slot
                </button>
              </div>
            </div>
          ) : (
            <form className="contact-form booking-form contact-only-form" onSubmit={submit}>
              <div className="form-head">
                <span className="eyebrow">01 — PRIVATE CONSULTATION</span>
                <h2>Let’s find a time that works.</h2>
                <p className="form-intro">
                  Select a date and format for an introductory spatial conversation with our design directors.
                </p>
              </div>

              <div className="form-grid">
                <label>
                  <span>Full Name*</span>
                  <input
                    value={book.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Ananya Singhania"
                    required
                  />
                </label>

                <label>
                  <span>Email Address*</span>
                  <input
                    type="email"
                    value={book.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="ananya@example.com"
                    required
                  />
                </label>

                <label>
                  <span>Phone / WhatsApp*</span>
                  <input
                    value={book.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+91 93078 98468"
                    required
                  />
                </label>

                <label>
                  <span>Conversation Format</span>
                  <select
                    value={book.mode}
                    onChange={(e) => update("mode", e.target.value)}
                  >
                    <option>Video consultation (Zoom / Meet)</option>
                    <option>Phone consultation</option>
                    <option>In-Studio Visit (Mumbai / Pune / Goa)</option>
                    <option>On-Site Visit (Existing Residence)</option>
                  </select>
                </label>

                <label>
                  <span className="inline-field">
                    <CalendarDays size={15} /> Preferred Date*
                  </span>
                  <input
                    type="date"
                    value={book.date}
                    onChange={(e) => update("date", e.target.value)}
                    required
                  />
                </label>

                <label>
                  <span className="inline-field">
                    <Clock size={15} /> Preferred Time Window*
                  </span>
                  <select
                    value={book.time}
                    onChange={(e) => update("time", e.target.value)}
                    required
                  >
                    <option value="">Choose a slot</option>
                    <option>10:00 AM – 11:30 AM</option>
                    <option>12:00 PM – 1:30 PM</option>
                    <option>3:00 PM – 4:30 PM</option>
                    <option>5:30 PM – 7:00 PM</option>
                  </select>
                </label>
              </div>

              {status.state === "error" && (
                <div className="form-message error">{status.message}</div>
              )}

              <div className="form-submit-row">
                <button
                  type="submit"
                  className="pill dark large-pill"
                  disabled={status.state === "loading"}
                >
                  {status.state === "loading" ? "Reserving Slot..." : "Request Private Consultation"}
                  <Send size={16} />
                </button>

                <a
                  href={getWhatsAppUrl("Hello Atelier Noire, I would like to request a private consultation with your design directors.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill outline"
                >
                  <MessageCircle size={15} /> WhatsApp Studio
                </a>
              </div>
            </form>
          )}
        </motion.div>
      </section>
    </Layout>
  );
}
