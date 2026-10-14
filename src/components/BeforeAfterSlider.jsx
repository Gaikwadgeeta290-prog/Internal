import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, Sparkles, Clock, Ruler, Layers } from "lucide-react";

const transformations = [
  {
    id: "living",
    title: "Worli Penthouse Living",
    location: "Worli, Mumbai",
    area: "3,200 sq.ft",
    duration: "7 Months",
    scope: "Full Gut Renovation · Spatial Architecture",
    description: "Transformed an outdated, compartmentalized apartment into a flowing sanctuary of light, Roman travertine and custom smoked oak joinery.",
    beforeImg: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1800&q=85",
    afterImg: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=88",
  },
  {
    id: "kitchen",
    title: "Bespoke Quartzite Kitchen",
    location: "Jubilee Hills, Hyderabad",
    area: "650 sq.ft",
    duration: "4 Months",
    scope: "Concealed Storage · Monolithic Stone Island",
    description: "Replaced heavy, enclosed millwork with an architectural quartzite composition, fluted oak paneling, and discreet pocket storage.",
    beforeImg: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1800&q=85",
    afterImg: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=88",
  },
  {
    id: "bedroom",
    title: "Earth & Linen Sanctuary",
    location: "Koregaon Park, Pune",
    area: "1,100 sq.ft Master Suite",
    duration: "5 Months",
    scope: "Acoustic Limewash · Walk-in Wardrobe",
    description: "Re-imagined a sterile developer shell into a calm, tactile bedroom pavilion wrapped in washed linen, chalk plaster and morning sunlight.",
    beforeImg: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1800&q=85",
    afterImg: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=88",
  },
];

export default function BeforeAfterSlider() {
  const [activeTab, setActiveTab] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const current = transformations[activeTab];

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const onPointerMove = (e) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    const onPointerUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isDragging, handleMove]);

  return (
    <section className="before-after-section">
      <div className="section-head-center">
        <span className="eyebrow">
          <Sparkles size={13} className="eyebrow-icon" />
          TRANSFORMATION ARCHIVE
        </span>
        <h2>Before & <i>After.</i></h2>
        <p>
          Witness how bare architectural shells and legacy interiors evolve into
          quietly luxurious, light-filled sanctuaries through considered spatial planning.
        </p>

        {/* Tab Switcher */}
        <div className="ba-tabs" role="tablist">
          {transformations.map((t, idx) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === idx}
              className={`ba-tab-btn ${activeTab === idx ? "active" : ""}`}
              onClick={() => {
                setActiveTab(idx);
                setSliderPos(50);
              }}
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      <div className="ba-stage-wrap">
        <div
          ref={containerRef}
          className="ba-container"
          onPointerDown={handlePointerDown}
          onTouchMove={handleTouchMove}
          style={{ cursor: isDragging ? "ew-resize" : "default" }}
        >
          {/* AFTER Image (Full background) */}
          <img
            src={current.afterImg}
            alt={`${current.title} After transformation`}
            className="ba-image ba-image-after"
            draggable={false}
          />

          {/* BEFORE Image (Clipped overlay) */}
          <div
            className="ba-before-wrapper"
            style={{
              clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
            }}
          >
            <img
              src={current.beforeImg}
              alt={`${current.title} Before renovation`}
              className="ba-image ba-image-before"
              draggable={false}
            />
          </div>

          {/* Floating Badges */}
          <div className="ba-badge ba-badge-before">
            <span>BEFORE</span>
            <small>EXISTING SHELL</small>
          </div>
          <div className="ba-badge ba-badge-after">
            <span>AFTER</span>
            <small>ATELIER NOIRE</small>
          </div>

          {/* Draggable Divider Line & Knob */}
          <div
            className="ba-divider"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="ba-handle" aria-label="Drag to compare before and after">
              <ArrowLeftRight size={16} />
            </div>
          </div>
        </div>

        {/* Transformation Specifications Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="ba-spec-card"
          >
            <div className="ba-spec-main">
              <div>
                <span className="ba-spec-loc">{current.location}</span>
                <h3 className="ba-spec-title">{current.title}</h3>
                <p className="ba-spec-desc">{current.description}</p>
              </div>
            </div>

            <div className="ba-spec-stats">
              <div className="ba-stat-item">
                <Ruler size={14} className="ba-stat-icon" />
                <div>
                  <small>SCALE</small>
                  <strong>{current.area}</strong>
                </div>
              </div>
              <div className="ba-stat-item">
                <Clock size={14} className="ba-stat-icon" />
                <div>
                  <small>TIMELINE</small>
                  <strong>{current.duration}</strong>
                </div>
              </div>
              <div className="ba-stat-item">
                <Layers size={14} className="ba-stat-icon" />
                <div>
                  <small>SCOPE</small>
                  <strong>{current.scope}</strong>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
