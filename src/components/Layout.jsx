import { useState, useEffect, useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { ArrowUpRight, Menu, X, MessageSquare, Phone } from "lucide-react";
import CallDetailsPopup from "./CallDetailsPopup";
import {
  STUDIO_WHATSAPP_NUMBER,
  STUDIO_PHONE_DISPLAY,
  STUDIO_PHONE_TEL,
  STUDIO_EMAIL,
  getWhatsAppUrl
} from "../lib/constants";

const nav = [
  ["/", "Home"],
  ["/portfolio", "Portfolio"],
  ["/services", "Services"],
  ["/studio", "Studio"],
  ["/insights", "Insights"],
  ["/contact", "Contact"],
];
const ease = [0.22, 1, 0.36, 1];

export function Reveal({
  children,
  delay = 0,
  className = "",
  amount = 0.1,
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount,
      }}
      transition={{
        duration: 0.7,
        delay,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}

export function Sequence({ children, className = "" }) {
  const wrap = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.04,
      },
    },
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease,
      },
    },
  };

  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <motion.div
      className={className}
      variants={wrap}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: true,
        amount: 0.1,
      }}
    >
      {childrenArray.map((child, i) => (
        <motion.div
          variants={item}
          key={child?.key || i}
          className="sequence-item"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function Magnetic({ children, to, className = "" }) {
  return (
    <Link className={className} to={to}>
      {children}
    </Link>
  );
}

export function Layout({ children }) {
  const [showCallDetails, setShowCallDetails] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { scrollYProgress } = useScroll();

  useLayoutEffect(() => {
    setOpen(false);

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [loc.pathname]);

  // Add a repeatable reveal only to actual content cards.
  // We intentionally do NOT hide every section child: that was causing
  // complete sections/projects to disappear before the observer ran.
  useEffect(() => {
    const root = document.querySelector(".route-stage");
    if (!root) return undefined;

    const selectors = [
      ".project-grid > *",
      ".project-grid-safe > *",
      ".portfolio-grid > *",
      ".service-list > *",
      ".process-row > *",
      ".post-grid > *",
      ".team-grid > *",
      ".insights-page > article",
      ".case-gallery > *",
      ".next-project > *",
      ".step-detail",
    ];

    const nodes = [];
    selectors.forEach((selector) => {
      root.querySelectorAll(selector).forEach((node, index) => {
        if (!node.classList.contains("sequence-item")) {
          node.classList.add("reveal-auto");
          node.style.setProperty(
            "--reveal-delay",
            `${index * 120}ms`
          );
          nodes.push(node);
        }
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
      }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [loc.pathname]);

  return (
    <>
      <motion.div
        className="progress"
        style={{ scaleX: scrollYProgress }}
      />

      <header className="nav">
        <Link to="/" className="brand">
          <span>AN</span>
          <b>
            ATELIER NOIRE
            <small>INTERIORS & ARCHITECTURE</small>
          </b>
        </Link>

        <nav>
          {nav.map(([path, title]) => (
            <Link
              className={
                loc.pathname === path ||
                (path === "/portfolio" &&
                  loc.pathname.startsWith("/portfolio/"))
                  ? "active"
                  : ""
              }
              to={path}
              key={path}
            >
              {title}
            </Link>
          ))}
        </nav>

        <Link to="/begin-project" className="nav-cta">
          Begin a project <ArrowUpRight size={15} />
        </Link>

        <button
          className="menu-btn"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease }}
          >
            {nav.map(([path, title]) => (
              <Link
                onClick={() => setOpen(false)}
                to={path}
                key={path}
              >
                {title}
                <ArrowUpRight />
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.main
          key={loc.pathname}
          className="route-stage"
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -10,
          }}
          transition={{
            duration: 0.35,
            ease,
          }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Floating Quick Action Buttons */}
      <div className="floating-actions" aria-label="Quick contact actions">
        <a
          href={getWhatsAppUrl("Hi Atelier Noire, I would like to enquire about interior architecture and design services.")}
          target="_blank"
          rel="noopener noreferrer"
          className="float-btn float-whatsapp"
          aria-label="Chat with studio on WhatsApp"
        >
          <MessageSquare size={19} />
          <span className="float-badge">Chat with Studio</span>
        </a>
        <button
  type="button"
  className="float-btn float-phone-btn"
  aria-label="View studio phone details"
  onClick={() => setShowCallDetails(true)}
>
  <Phone size={18} />
</button>
      </div>
      {showCallDetails && (
        <CallDetailsPopup onClose={() => setShowCallDetails(false)} />
      )}
      <footer>
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <span>AN</span>
              <b>
                ATELIER NOIRE
                <small>INTERIORS & ARCHITECTURE</small>
              </b>
            </Link>
            <p className="footer-tagline">
              Spaces with soul. Thoughtful interior architecture shaped by proportion, materiality and everyday ritual.
            </p>
            <div className="footer-direct-actions">
              <Link to="/begin-project" className="pill light">
                Start a consultation <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          <div className="footer-col">
            <small>STUDIO LOCATIONS</small>
            <p>
              <strong>Mumbai Atelier</strong>
              <br />
              Worli & Bandra West
            </p>
            <p>
              <strong>Pune & Goa</strong>
              <br />
              Koregaon Park Â· Panaji
            </p>
          </div>

          <div className="footer-col">
            <small>DIRECT INQUIRIES</small>
            <p>
              <a href={`mailto:${STUDIO_EMAIL}`} className="footer-link">
                {STUDIO_EMAIL}
              </a>
              <br />
              <a href={`tel:${STUDIO_PHONE_TEL}`} className="footer-link">
                {STUDIO_PHONE_DISPLAY}
              </a>
            </p>
            <p className="footer-hours">
              Monday â€“ Saturday
              <br />
              10:00 â€“ 19:00 IST
            </p>
          </div>

          <div className="footer-col">
            <small>EXPLORE</small>
            <div className="footer-nav-links">
              <Link to="/portfolio">Selected Portfolio</Link>
              <Link to="/services">Design Services</Link>
              <Link to="/studio">Our Atelier</Link>
              <Link to="/insights">Journal & Insights</Link>
              <Link to="/contact">Contact Studio</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>Â© {new Date().getFullYear()} Atelier Noire. All rights reserved.</span>
          <span className="footer-mantra">Crafted for timeless living.</span>
          <div className="footer-social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">Pinterest</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>
    </>
  );
}


