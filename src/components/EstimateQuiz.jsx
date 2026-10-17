import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Home, 
  Landmark, 
  Compass, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  MessageCircle, 
  Clock, 
  ShieldCheck, 
  Layers 
} from "lucide-react";
import { getWhatsAppUrl } from "../lib/constants";

const TYPOLOGIES = [
  {
    id: "apartment",
    label: "Apartment (3BHK / 4BHK)",
    desc: "Single-level contemporary residential apartments.",
    defaultArea: 2200,
    icon: Building2,
    multiplier: 1.0,
  },
  {
    id: "penthouse",
    label: "Penthouse / Duplex",
    desc: "Multi-level or terrace residence with panoramic vistas.",
    defaultArea: 3800,
    icon: Compass,
    multiplier: 1.15,
  },
  {
    id: "villa",
    label: "Private Villa / Estate",
    desc: "Independent expansive residence with indoor-outdoor flow.",
    defaultArea: 5500,
    icon: Home,
    multiplier: 1.25,
  },
  {
    id: "commercial",
    label: "Boutique Commercial / Studio",
    desc: "Executive offices, private galleries, or hospitality suites.",
    defaultArea: 2000,
    icon: Landmark,
    multiplier: 0.95,
  },
];

const SCOPES = [
  {
    id: "turnkey",
    label: "Full Turnkey Architecture & Execution",
    badge: "Most Selected",
    desc: "Single-point studio responsibility: complete civil, MEP, bespoke millwork, stone fabrication, and white-glove site delivery.",
    timelineWeeks: "20 – 26 Weeks",
    signatureBase: 3800,
    coutureBase: 6200,
    inclusions: ["Full Architectural Working Drawings", "Civil, Electrical & HVAC Engineering", "Custom Italian/German Millwork", "Quarry-Direct Stone Masonry", "Dedicated On-Site Project Architect", "Final Curation & White-Glove Handover"],
  },
  {
    id: "design_millwork",
    label: "Bespoke Interior Design & Millwork",
    badge: "Design & Fit-Out",
    desc: "Comprehensive 3D concept, construction drawings, lighting schematics, and custom cabinetry manufacturing.",
    timelineWeeks: "14 – 18 Weeks",
    signatureBase: 2600,
    coutureBase: 4200,
    inclusions: ["Spatial Layouts & 3D Visualizations", "Bespoke Cabinetry & Joinery Detailing", "Lighting & Electrical Schematics", "Material & Hardware Specifications", "Milestone Quality Inspections"],
  },
  {
    id: "styling",
    label: "Curation, Soft Furnishing & Styling",
    badge: "Finishing & Art",
    desc: "Art advisory, architectural lighting fixtures, Italian loose furniture procurement, wall finishes, and bespoke drapery.",
    timelineWeeks: "8 – 12 Weeks",
    signatureBase: 1500,
    coutureBase: 2700,
    inclusions: ["Art & Sculpture Advisory", "Designer Loose Furniture Procurement", "Custom Luxury Drapery & Rugs", "Decorative Lighting Curation", "Accessory & Object Placement"],
  },
];

const TIERS = [
  {
    id: "signature",
    name: "Atelier Signature",
    tagline: "Refined Contemporary Craftsmanship",
    desc: "Engineered smoked European oak, honed Travertine accents, precision architectural hardware, imported Belgian linen, and high-CRI warm lighting.",
  },
  {
    id: "couture",
    name: "Atelier Haute Couture",
    tagline: "Rare Monolithic Stone & Custom Bronze",
    desc: "Full-slab bookmatched Calacatta Viola / Quartzite, solid walnut joinery, bespoke patinated bronze hardware, and Lutron ambient automation.",
  },
];

function formatInLakhs(value) {
  if (value >= 10000000) {
    const cr = (value / 10000000).toFixed(2);
    return `₹${cr.replace(/\.00$/, "")} Cr`;
  }
  const lk = Math.round(value / 100000);
  return `₹${lk} Lakh`;
}

export default function EstimateQuiz({ onApplyEstimate }) {
  const [typologyId, setTypologyId] = useState("penthouse");
  const [area, setArea] = useState(3800);
  const [scopeId, setScopeId] = useState("turnkey");
  const [tierId, setTierId] = useState("signature");

  const areaSliderId = useId();

  const selectedTypology = TYPOLOGIES.find((t) => t.id === typologyId) || TYPOLOGIES[1];
  const selectedScope = SCOPES.find((s) => s.id === scopeId) || SCOPES[0];
  const selectedTier = TIERS.find((t) => t.id === tierId) || TIERS[0];

  // Calculation logic
  const baseRate = tierId === "signature" ? selectedScope.signatureBase : selectedScope.coutureBase;
  const adjustedRate = baseRate * selectedTypology.multiplier;

  const lowEstimate = Math.round((area * adjustedRate * 0.92) / 50000) * 50000;
  const highEstimate = Math.round((area * adjustedRate * 1.12) / 50000) * 50000;
  const budgetRangeStr = `${formatInLakhs(lowEstimate)} – ${formatInLakhs(highEstimate)}`;

  const handleSelectTypology = (t) => {
    setTypologyId(t.id);
    setArea(t.defaultArea);
  };

  const handleApply = () => {
    if (onApplyEstimate) {
      onApplyEstimate({
        typology: selectedTypology.label,
        area: `${area} sq ft`,
        scope: selectedScope.label,
        tier: selectedTier.name,
        budgetRange: budgetRangeStr,
        timeline: selectedScope.timelineWeeks,
      });
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Atelier Noire, I used your Project Estimator for a ${selectedTypology.label} (${area} sq ft) with ${selectedScope.label} (${selectedTier.name} tier). Estimated range: ${budgetRangeStr}. I would like to schedule a private consultation.`
  );

  return (
    <div className="estimator-wrapper">
      <div className="estimator-header">
        <span className="eyebrow">ARCHITECTURAL DISCOVERY</span>
        <h3>Project Scope & Investment Estimator</h3>
        <p>
          Obtain immediate clarity on estimated studio investments and timelines based on Mumbai, Pune & Goa high-end standards.
        </p>
      </div>

      <div className="estimator-body">
        {/* Step 1: Typology */}
        <div className="estimator-step">
          <label className="estimator-step-label">
            <span className="step-num">01</span>
            <span>Select Property Typology</span>
          </label>
          <div className="estimator-typology-grid">
            {TYPOLOGIES.map((t) => {
              const Icon = t.icon;
              const isSelected = typologyId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`typology-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectTypology(t)}
                >
                  <div className="typology-icon-wrap">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <div className="typology-info">
                    <h4>{t.label}</h4>
                    <p>{t.desc}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="typology-check" size={16} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Footprint Area Slider */}
        <div className="estimator-step">
          <div className="estimator-area-header">
            <label htmlFor={areaSliderId} className="estimator-step-label">
              <span className="step-num">02</span>
              <span>Spatial Footprint (Area)</span>
            </label>
            <div className="area-live-val">
              <strong>{area.toLocaleString()}</strong> <span>sq ft</span>
            </div>
          </div>

          <div className="area-slider-wrap">
            <input
              id={areaSliderId}
              type="range"
              min={1000}
              max={8500}
              step={100}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="area-range-slider"
              aria-label="Spatial Footprint in Square Feet"
            />
            <div className="area-presets">
              {[1500, 2500, 4000, 6000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`preset-btn ${area === preset ? "active" : ""}`}
                  onClick={() => setArea(preset)}
                >
                  {preset.toLocaleString()} sq ft
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Scope of Engagement */}
        <div className="estimator-step">
          <label className="estimator-step-label">
            <span className="step-num">03</span>
            <span>Desired Scope of Engagement</span>
          </label>
          <div className="scope-selection-grid">
            {SCOPES.map((s) => {
              const isSelected = scopeId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`scope-card ${isSelected ? "active" : ""}`}
                  onClick={() => setScopeId(s.id)}
                >
                  <div className="scope-head">
                    <span className="scope-badge">{s.badge}</span>
                    <span className="scope-timeline"><Clock size={13} /> {s.timelineWeeks}</span>
                  </div>
                  <h4>{s.label}</h4>
                  <p>{s.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Craftsmanship & Finishes Tier */}
        <div className="estimator-step">
          <label className="estimator-step-label">
            <span className="step-num">04</span>
            <span>Material & Craftsmanship Tier</span>
          </label>
          <div className="tier-toggle-grid">
            {TIERS.map((tier) => {
              const isSelected = tierId === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  className={`tier-card ${isSelected ? "active" : ""}`}
                  onClick={() => setTierId(tier.id)}
                >
                  <div className="tier-head">
                    <Sparkles size={16} />
                    <h4>{tier.name}</h4>
                  </div>
                  <span className="tier-sub">{tier.tagline}</span>
                  <p>{tier.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculation Result Panel */}
        <div className="estimator-result-card">
          <div className="result-grid">
            <div className="result-metric">
              <span className="result-label">INDICATIVE INVESTMENT RANGE</span>
              <div className="result-value">{budgetRangeStr}</div>
              <small className="result-note">Excludes government GST & municipal approvals. Based on recent projects.</small>
            </div>

            <div className="result-metric">
              <span className="result-label">ESTIMATED PROJECT TIMELINE</span>
              <div className="result-value sub">{selectedScope.timelineWeeks}</div>
              <small className="result-note">Concept through site completion & white-glove styling.</small>
            </div>
          </div>

          <div className="result-inclusions">
            <span className="result-inclusions-title"><ShieldCheck size={14} /> Key Deliverables in this Scope:</span>
            <div className="inclusions-pills">
              {selectedScope.inclusions.map((inc, i) => (
                <span key={i} className="inclusion-pill">
                  <CheckCircle2 size={12} /> {inc}
                </span>
              ))}
            </div>
          </div>

          <div className="estimator-actions">
            <button
              type="button"
              className="pill dark large-pill"
              onClick={handleApply}
            >
              Apply to Project Brief & Continue <ArrowRight size={16} />
            </button>

            <a
              href={getWhatsAppUrl(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="pill outline"
            >
              <MessageCircle size={15} /> Instant WhatsApp Estimate
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
