import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useLayoutEffect, useEffect } from "react";

import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import ProjectDetails from "./pages/ProjectDetails";
import Services from "./pages/Services";
import Studio from "./pages/Studio";
import Insights from "./pages/Insights";
import Contact from "./pages/Contact";
import ServiceDetail from "./pages/ServiceDetail";
import InsightDetail from "./pages/InsightDetail";
import BeginProject from "./pages/BeginProject";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Dynamic SEO Titles
    const routeTitles = {
      "/": "Atelier Noire — Luxury Interiors & Architecture | Mumbai · Pune · Goa",
      "/portfolio": "Selected Architectural Portfolio — Atelier Noire",
      "/services": "Studio Services & Turnkey Execution — Atelier Noire",
      "/studio": "Studio Practice & Craft Philosophy — Atelier Noire",
      "/insights": "Architectural Insights & Journal — Atelier Noire",
      "/contact": "Reserve a Private Consultation — Atelier Noire",
      "/begin-project": "Project Scope & Investment Estimator — Atelier Noire",
      "/admin/login": "Studio Concierge Login — Atelier Noire",
      "/admin/dashboard": "Studio Executive Dashboard — Atelier Noire",
    };

    if (routeTitles[pathname]) {
      document.title = routeTitles[pathname];
    } else if (pathname.startsWith("/portfolio/")) {
      document.title = "Architectural Case Study — Atelier Noire";
    } else if (pathname.startsWith("/services/")) {
      document.title = "Practice Area — Atelier Noire";
    } else if (pathname.startsWith("/insights/")) {
      document.title = "Design Editorial — Atelier Noire";
    } else {
      document.title = "Atelier Noire — Luxury Interiors & Architecture";
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "page_view", page_path: pathname })
    }).catch(() => {});
  }, [pathname]);

  return null;
}

function AdminRoute() {
  const token = localStorage.getItem("atelier_admin_token");
  return token ? <AdminDashboard /> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:id" element={<ProjectDetails />} />

        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />

        <Route path="/studio" element={<Studio />} />

        <Route path="/insights" element={<Insights />} />
        <Route path="/insights/:id" element={<InsightDetail />} />

        <Route path="/contact" element={<Contact />} />
        <Route path="/begin-project" element={<BeginProject />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminRoute />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
