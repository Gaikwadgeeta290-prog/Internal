import { useState, useRef } from "react";
import { ArrowUpRight, CheckCircle2, Send, Calculator, FileText, MessageCircle, Sparkles, Clock, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout, Sequence } from "../components/Layout";
import EstimateQuiz from "../components/EstimateQuiz";
import FAQAccordion from "../components/FAQAccordion";
import { STUDIO_WHATSAPP_NUMBER, STUDIO_PHONE_DISPLAY, getWhatsAppUrl } from "../lib/constants";

const initial = {
  name: "",
  email: "",
  phone: "",
  city: "Mumbai",
  projectType: "Full Turnkey Interior Architecture",
  propertyType: "Apartment (3BHK / 4BHK)",
  area: "",
  budget: "₹50 Lakh–1 Cr",
  startDate: "Within 3 Months",
  message: "",
};

export default function BeginProject() {
  const [activeTab, setActiveTab] = useState("estimator"); // "estimator" | "form"
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState({ state: "idle", message: "", reference: "" });
  const formRef = useRef(null);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleApplyEstimate = (estData) => {
    setForm((prev) => ({
      ...prev,
      propertyType: estData.typology || prev.propertyType,
      area: estData.area || prev.area,
      projectType: estData.scope || prev.projectType,
      budget: estData.budgetRange || prev.budget,
      message: prev.message || `Estimated scope: ${estData.scope} (${estData.tier}). Indicative timeline: ${estData.timeline}.`,
    }));
    setActiveTab("form");
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "loading", message: "", reference: "" });

    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Failed to submit project brief.");

      const refId = d.reference || (d.id ? `ENQ-${String(d.id).padStart(5, "0")}` : "ENQ-NEW");
      setStatus({
        state: "success",
        message: "Your architectural brief has been securely logged with our studio leadership.",
        reference: refId,
      });
    } catch (err) {
      // Graceful fallback: even if MySQL or network had an issue, provide fallback options
      setStatus({
        state: "error",
        message: err.message || "Unable to send right now. Please reach out via WhatsApp or email directly.",
        reference: "",
      });
    }
  };

  return (
    <Layout>
      {/* Editorial Hero */}
      <section className="build-hero">
        <div className="build-hero-image" />
        <div className="build-hero-shade" />
        <Sequence>
          <span className="eyebrow">COMMISSION A RESIDENCE · 01</span>
          <h1>
            Let’s sculpt<br />
            <i>your private sanctuary.</i>
          </h1>
          <p>
            Whether embarking on a panoramic penthouse, heritage villa restoration, or complete turnkey residence, our studio crafts spaces of enduring poise and tactile restraint.
          </p>
        </Sequence>
      </section>

      {/* Main Interactive Container */}
      <section className="build-interactive-section" ref={formRef}>
        <div className="build-mode-tabs">
          <button
            type="button"
            className={`mode-tab-btn ${activeTab === "estimator" ? "active" : ""}`}
            onClick={() => setActiveTab("estimator")}
          >
            <Calculator size={16} /> 01. Interactive Investment Estimator
          </button>
          <button
            type="button"
            className={`mode-tab-btn ${activeTab === "form" ? "active" : ""}`}
            onClick={() => setActiveTab("form")}
          >
            <FileText size={16} /> 02. Direct Project Brief Form
          </button>
        </div>

        <div className="build-content-area">
          {activeTab === "estimator" ? (
            <motion.div
              key="estimator"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <EstimateQuiz onApplyEstimate={handleApplyEstimate} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="build-form-container"
            >
              <div className="build-intro">
                <span className="eyebrow">STUDIO BRIEFING</span>
                <h2>Tell us the story before we draw the first line.</h2>
                <p>
                  Share the essential parameters of your space. Our principals will review your brief against our current studio capacity and coordinate an initial concept consultation.
                </p>
                <div className="build-reassurance-cards">
                  <div className="reassurance-card">
                    <Shield size={16} />
                    <div>
                      <strong>Strict Confidentiality</strong>
                      <small>NDA executed on request prior to architectural drawings.</small>
                    </div>
                  </div>
                  <div className="reassurance-card">
                    <Clock size={16} />
                    <div>
                      <strong>24-Hour Review</strong>
                      <small>Dedicated response from a lead design architect.</small>
                    </div>
                  </div>
                </div>
              </div>

              {status.state === "success" ? (
                <motion.div
                  className="brief-success-card"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="success-icon-wrap">
                    <CheckCircle2 size={36} />
                  </div>
                  <span className="eyebrow">BRIEF REGISTERED</span>
                  <h3>Reference: {status.reference}</h3>
                  <p>{status.message}</p>
                  <div className="success-details">
                    <p>
                      <strong>Client:</strong> {form.name} ({form.email})
                    </p>
                    <p>
                      <strong>Scope:</strong> {form.projectType} · {form.propertyType}
                    </p>
                    <p>
                      <strong>Estimated Budget:</strong> {form.budget}
                    </p>
                  </div>
                  <div className="success-actions">
                    <a
                      href={getWhatsAppUrl(`Hello Atelier Noire, I have submitted project brief ${status.reference} for ${form.name}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill dark"
                    >
                      <MessageCircle size={15} /> Confirm on WhatsApp Studio
                    </a>
                    <button
                      type="button"
                      className="pill outline"
                      onClick={() => {
                        setForm(initial);
                        setStatus({ state: "idle", message: "", reference: "" });
                      }}
                    >
                      Submit Another Brief
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form className="build-form-enhanced" onSubmit={submit}>
                  <div className="form-grid">
                    <label>
                      <span>Full Name*</span>
                      <input
                        name="name"
                        value={form.name}
                        onChange={update}
                        placeholder="e.g. Vikram Singhania"
                        required
                      />
                    </label>

                    <label>
                      <span>Email Address*</span>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={update}
                        placeholder="vikram@example.com"
                        required
                      />
                    </label>

                    <label>
                      <span>Phone / WhatsApp*</span>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={update}
                        placeholder="+91 93078 98468"
                        required
                      />
                    </label>

                    <label>
                      <span>City / Project Location</span>
                      <input
                        name="city"
                        value={form.city}
                        onChange={update}
                        placeholder="Mumbai (Worli, Bandra, Juhu), Pune, Goa..."
                      />
                    </label>

                    <label>
                      <span>Scope of Work</span>
                      <select name="projectType" value={form.projectType} onChange={update}>
                        <option>Full Turnkey Interior Architecture</option>
                        <option>Bespoke Interior Design & Millwork</option>
                        <option>Heritage / Villa Restoration</option>
                        <option>Penthouse / Duplex Renovation</option>
                        <option>Curation, Soft Furnishing & Styling</option>
                      </select>
                    </label>

                    <label>
                      <span>Property Typology</span>
                      <select name="propertyType" value={form.propertyType} onChange={update}>
                        <option>Apartment (3BHK / 4BHK)</option>
                        <option>Penthouse / Duplex</option>
                        <option>Private Villa / Estate</option>
                        <option>Boutique Commercial / Studio</option>
                        <option>Vacation Residence</option>
                      </select>
                    </label>

                    <label>
                      <span>Approximate Footprint</span>
                      <input
                        name="area"
                        value={form.area}
                        onChange={update}
                        placeholder="e.g. 3,500 sq ft"
                      />
                    </label>

                    <label>
                      <span>Target Investment Range</span>
                      <select name="budget" value={form.budget} onChange={update}>
                        <option>₹25–50 Lakh</option>
                        <option>₹50 Lakh–1 Cr</option>
                        <option>₹1 Cr–2 Cr</option>
                        <option>₹2 Cr–5 Cr</option>
                        <option>₹5 Cr+</option>
                      </select>
                    </label>

                    <label className="full-span">
                      <span>Anticipated Project Kickoff</span>
                      <select name="startDate" value={form.startDate} onChange={update}>
                        <option>Immediate (Within 4 Weeks)</option>
                        <option>Within 3 Months</option>
                        <option>3 to 6 Months</option>
                        <option>Currently in Architecture / Possession Stage</option>
                      </select>
                    </label>
                  </div>

                  <label className="build-message">
                    <span>Architectural Vision & Spatial Priorities*</span>
                    <textarea
                      name="message"
                      rows="6"
                      value={form.message}
                      onChange={update}
                      required
                      placeholder="Share details regarding your space, material preferences (e.g. travertine, fluted oak, brass), family rituals, and the atmosphere you wish to curate..."
                    />
                  </label>

                  {status.state === "error" && (
                    <div className="form-message error">
                      {status.message}
                    </div>
                  )}

                  <div className="form-submit-row">
                    <button
                      type="submit"
                      className="pill dark large-pill"
                      disabled={status.state === "loading"}
                    >
                      {status.state === "loading" ? "Registering Brief..." : "Submit Architectural Brief"}
                      <Send size={16} />
                    </button>

                    <a
                      href={getWhatsAppUrl("Hello Atelier Noire, I would like to discuss a new interior architecture commission.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill outline"
                    >
                      <MessageCircle size={15} /> Discuss on WhatsApp Studio
                    </a>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Integrated FAQ section */}
      <section className="build-faq-wrap">
        <FAQAccordion
          title="Questions About Commencing a Project"
          subtitle="Clear answers on our discovery phase, milestone fees, turnkey management, and contractor integration."
        />
      </section>

      {/* Editorial Footer Strip */}
      <section className="build-end">
        <span className="eyebrow">ATELIER NOIRE · BESPOKE COMMISSIONS</span>
        <h2>
          From the first sketch<br />
          to <i>the finished sanctuary.</i>
        </h2>
        <a className="pill dark" href="/portfolio">
          Explore Our Realized Portfolio <ArrowUpRight />
        </a>
      </section>
    </Layout>
  );
}