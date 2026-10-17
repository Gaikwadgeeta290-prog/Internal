import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, MessageCircle, ArrowUpRight } from "lucide-react";
import { faqs } from "../data/content";
import { getWhatsAppUrl } from "../lib/constants";

export default function FAQAccordion({ limit, showCategories = true, title = "Frequently Asked Questions", subtitle = "Clarity on our studio process, timelines, turnkey execution, and design engagements." }) {
  const [activeId, setActiveId] = useState(faqs[0]?.id || null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = faqs
    .filter((f) => selectedCategory === "All" || f.category === selectedCategory)
    .slice(0, limit || faqs.length);

  const toggle = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="faq-section-container">
      <div className="faq-header">
        <span className="eyebrow">TRANSPARENCY & CLARITY</span>
        <h2>{title}</h2>
        {subtitle && <p className="faq-subtitle">{subtitle}</p>}

        {showCategories && categories.length > 2 && (
          <div className="faq-category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`faq-cat-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="faq-accordion-list">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = activeId === faq.id;
          return (
            <div
              key={faq.id}
              className={`faq-accordion-item ${isOpen ? "open" : ""}`}
            >
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggle(faq.id)}
                aria-expanded={isOpen}
              >
                <span className="faq-index">0{idx + 1}</span>
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-icon-wrapper" aria-hidden="true">
                  {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="faq-answer-wrapper"
                  >
                    <div className="faq-answer-inner">
                      <p>{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="faq-direct-prompt">
        <div className="faq-prompt-text">
          <h4>Have a bespoke architectural question?</h4>
          <p>Our studio principals are available for direct preliminary consultations.</p>
        </div>
        <div className="faq-prompt-actions">
          <a
            href={getWhatsAppUrl("Hello Atelier Noire, I have an architectural inquiry regarding my residence.")}
            target="_blank"
            rel="noopener noreferrer"
            className="pill outline"
          >
            <MessageCircle size={15} /> WhatsApp Studio
          </a>
          <a href="/contact" className="pill dark">
            Book Consultation <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}
