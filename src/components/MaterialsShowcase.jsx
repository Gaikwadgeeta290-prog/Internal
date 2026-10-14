import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, Compass, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const materials = [
  {
    id: "travertine",
    name: "Roman Navona Travertine",
    category: "Natural Stone",
    origin: "Tivoli, Italy",
    finish: "Honed & open-pore matte",
    color: "Warm ivory with soft limestone strata",
    tactile: "Cool, porous, quietly monumental and light-diffusing",
    application: "Monolithic low credenzas, bathroom vanities, floor paving",
    pairings: "French Smoked Oak · Washed Belgian Linen · Unlacquered Brass",
    image: "https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?auto=format&fit=crop&w=1200&q=85",
    swatchColor: "#E3DACB",
  },
  {
    id: "oak",
    name: "Smoked French Oak",
    category: "Hardwood Joinery",
    origin: "Burgundy, France",
    finish: "Wire-brushed & matte natural oil",
    color: "Deep charcoal-brown with warm golden grain",
    tactile: "Rich grain texture, warm to the touch, light-absorbing",
    application: "Bespoke architectural wall paneling, floating consoles, dining tables",
    pairings: "Roman Travertine · Blackened Bronze · Raw Bouclé",
    image: "https://images.unsplash.com/photo-1546484475-7f7bd55792da?auto=format&fit=crop&w=1200&q=85",
    swatchColor: "#4A3B2C",
  },
  {
    id: "brass",
    name: "Patinated Aged Brass",
    category: "Artisanal Metal",
    origin: "Jaipur & Moradabad, India",
    finish: "Hand-burnished, unlacquered living patina",
    color: "Warm muted gold with subtle organic oxidation",
    tactile: "Silky hand feel that gracefully deepens with human touch over years",
    application: "Recessed joinery pulls, linear shelf framing, bespoke lighting troffers",
    pairings: "Calacatta Viola · Smoked Oak · Limewash Plaster",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85",
    swatchColor: "#B6985C",
  },
  {
    id: "linen",
    name: "Belgian Washed Linen & Bouclé",
    category: "Tactile Textiles",
    origin: "Flanders, Belgium",
    finish: "Natural enzyme-washed flax & wool loop",
    color: "Oatmeal, chalk white and raw flax sand",
    tactile: "Deeply comfortable, textural, breathable and calming",
    application: "Custom sectional upholstery, floor-to-ceiling sheer drapery, headboards",
    pairings: "Fluted Walnut · Aged Brass · Roman Travertine",
    image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1200&q=85",
    swatchColor: "#DDD6C7",
  },
  {
    id: "marble",
    name: "Calacatta Viola Marble",
    category: "Precious Stone",
    origin: "Apuan Alps, Carrara, Italy",
    finish: "Silk honed, low-sheen sealer",
    color: "Brecciated cabernet & violet veins on creamy ivory",
    tactile: "Sculptural, dramatic, cool, highly expressive",
    application: "Kitchen waterfall islands, statement powder room basins, fireplace surrounds",
    pairings: "Unlacquered Brass · Smoked Oak · Minimal Limewash",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    swatchColor: "#8D6268",
  },
  {
    id: "walnut",
    name: "Fluted American Walnut",
    category: "Architectural Millwork",
    origin: "Missouri, USA",
    finish: "Precision micro-fluting, matte organic wax",
    color: "Rich chocolate with amber undertones",
    tactile: "Rhythmic architectural relief that catches changing daylight shadows",
    application: "Entryway portals, hidden cocktail bars, acoustic dining screens",
    pairings: "Roman Travertine · Belgian Linen · Patinated Brass",
    image: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=85",
    swatchColor: "#5C3E28",
  },
];

export default function MaterialsShowcase() {
  const [selected, setSelected] = useState(materials[0]);

  return (
    <section className="materials-section">
      <div className="section-head-split">
        <div>
          <span className="eyebrow">
            <Gem size={13} className="eyebrow-icon" />
            MATERIAL PALETTE & FINISHES
          </span>
          <h2>Tactile <i>honesty.</i></h2>
        </div>
        <p>
          We do not decorate surfaces—we build spaces out of authentic materials that
          wear in, not out. Touch, proportion, and natural patina are at the center of our craft.
        </p>
      </div>

      <div className="materials-layout">
        {/* Left: Swatch Selector Grid */}
        <div className="materials-swatches">
          <span className="swatches-label">SELECT MATERIAL SPECIFICATION</span>
          <div className="swatch-grid">
            {materials.map((m) => {
              const isSelected = selected.id === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelected(m)}
                  className={`swatch-card ${isSelected ? "selected" : ""}`}
                  aria-pressed={isSelected}
                >
                  <div
                    className="swatch-color-pill"
                    style={{ backgroundColor: m.swatchColor }}
                  />
                  <div className="swatch-info">
                    <span className="swatch-cat">{m.category}</span>
                    <strong className="swatch-name">{m.name}</strong>
                    <small className="swatch-origin">{m.origin}</small>
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={16} className="swatch-check" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="materials-cta-note">
            <p>
              Custom swatches and physical finish samples are curated during our Initial Concept phase.
            </p>
            <Link to="/begin-project" className="text-link">
              Request material consultation <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right: Macro Texture Inspection Card */}
        <div className="materials-preview">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="preview-card"
            >
              <div className="preview-media-frame">
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="preview-image"
                />
                <div className="preview-shade" />
                <div className="preview-badge">
                  <span>{selected.category}</span>
                </div>
              </div>

              <div className="preview-body">
                <div className="preview-header">
                  <div>
                    <span className="preview-origin">
                      <Compass size={12} /> {selected.origin}
                    </span>
                    <h3 className="preview-title">{selected.name}</h3>
                  </div>
                </div>

                <div className="preview-specs-grid">
                  <div className="spec-row">
                    <small>FINISH SPECIFICATION</small>
                    <p>{selected.finish}</p>
                  </div>
                  <div className="spec-row">
                    <small>TACTILE PROFILE</small>
                    <p>{selected.tactile}</p>
                  </div>
                  <div className="spec-row">
                    <small>RECOMMENDED APPLICATION</small>
                    <p>{selected.application}</p>
                  </div>
                  <div className="spec-row">
                    <small>HARMONIOUS PAIRINGS</small>
                    <p className="pairings-text">{selected.pairings}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
