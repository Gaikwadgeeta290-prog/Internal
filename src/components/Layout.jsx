import { useState, useEffect, useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";

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
  amount = 0.18,
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 52, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{
        once: false,
        amount,
        margin: "-80px 0px -80px 0px",
      }}
      transition={{
        duration: 0.9,
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
        staggerChildren: 0.16,
        delayChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 44,
      filter: "blur(8px)",
    },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.78,
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
        once: false,
        amount: 0.16,
        margin: "-70px 0px -70px 0px",
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
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -12% 0px",
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
            y: 18,
            filter: "blur(5px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          exit={{
            opacity: 0,
            y: -18,
            filter: "blur(4px)",
          }}
          transition={{
            duration: 0.55,
            ease,
          }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <footer>
        <div className="footer-brand">
          <div className="brand">
            <span>AN</span>
            <b>
              ATELIER NOIRE
              <small>INTERIORS & ARCHITECTURE</small>
            </b>
          </div>
          <p>Spaces with soul. Designed around your life.</p>
        </div>

        <div>
          <small>STUDIO</small>
          <p>
            Mumbai · Pune · Goa
            <br />
            India
          </p>
        </div>

        <div>
          <small>CONTACT</small>
          <p>
            hello@ateliernoire.in
            <br />
            +91 98765 43210
          </p>
        </div>

        <div>
          <small>FOLLOW</small>
          <p>
            Instagram
            <br />
            Pinterest
          </p>
        </div>
      </footer>
    </>
  );
}
