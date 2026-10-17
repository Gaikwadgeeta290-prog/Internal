import { useState } from "react";
import { ArrowUpRight, Sofa, Home as HomeIcon, Layers3, Palette, Play, X, Sparkles, CheckCircle2, Film } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout, Reveal, Sequence } from "../components/Layout";
import FAQAccordion from "../components/FAQAccordion";

const serviceDetailsData = [
  {
    num: "01",
    title: "Interior Architecture",
    tagline: "Structural space planning, lighting schematics, and custom joinery.",
    desc: "We analyze structural volumes, optimize daylight, and configure architectural partitions before any decoration begins.",
    deliverables: [
      "Spatial layout optimization & civil modifications",
      "Technical MEP, HVAC & architectural lighting plans",
      "Bespoke millwork & concealed storage joinery",
      "Photorealistic 3D volumetric walkthroughs"
    ],
    video: "/videos/atelier-living-reel.mp4",
    videoTitle: "Living Space 3D Volumetric Walkthrough"
  },
  {
    num: "02",
    title: "Residential Interiors",
    tagline: "Turnkey private residences designed with cohesive material restraint.",
    desc: "Complete homes tailored to the rhythm of everyday rituals—curating tactile plasters, fluted wood, and custom furnishings.",
    deliverables: [
      "Custom furniture design & artisanal upholstery",
      "Venetian lime plasters & bespoke wall textures",
      "Integrated wardrobes, walk-in closets & vanities",
      "Natural daylight & circadian lighting orchestration"
    ],
    video: "/videos/atelier-bedroom-reel.mp4",
    videoTitle: "Master Bedroom 3D Atmosphere Reel"
  },
  {
    num: "03",
    title: "Turnkey Execution",
    tagline: "Single-point custodial responsibility from demolition to white-glove handover.",
    desc: "One team manages vendors, master stonecutters, and precision site engineering with strict milestone fee accountability.",
    deliverables: [
      "Resident project architect on-site full time",
      "Direct quarry sourcing: Italian marble & seasoned teak",
      "Phase-gated milestone delivery & BOQ audits",
      "White-glove snag audit, acoustic testing & handover"
    ],
    video: "/videos/atelier-kitchen-reel.mp4",
    videoTitle: "Turnkey Gourmet Kitchen 3D Reel"
  },
  {
    num: "04",
    title: "Styling & Art Direction",
    tagline: "Objects of permanence, collectible design, and curated textiles.",
    desc: "The final layer that gives a residence soul—balancing rare vintage lighting, fine art curation, and bespoke acoustic drapery.",
    deliverables: [
      "Original fine art & sculpture gallery procurement",
      "Rare vintage lighting & collectible design objects",
      "Hand-knotted natural silk & wool rugs",
      "Curated olfactory styling & tabletop accessories"
    ],
    video: "/videos/atelier-materials.mp4",
    videoTitle: "Tactile Materials & Stone Provenance Reel"
  }
];

const icons = [Sofa, HomeIcon, Layers3, Palette];

export default function Services() {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <Layout>
      <section
        className="page-hero"
        style={{
          backgroundImage:
            "linear-gradient(rgba(18,18,16,.3),rgba(18,18,16,.4)),url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=88)",
        }}
      >
        <Reveal>
          <span className="eyebrow">STUDIO EXPERTISE</span>
          <h1>
            Design that moves from <i>idea to reality.</i>
          </h1>
          <p>
            An end-to-end studio practice from structural spatial planning and quarry-direct material sourcing to bespoke millwork and white-glove turnkey execution.
          </p>
        </Reveal>
      </section>

      {/* Services Grid with Balanced Luxury Layout */}
      <section className="service-page-redesign">
        <div className="service-page-container">
          {serviceDetailsData.map((item, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={item.num} delay={i * 0.08}>
                <article className="service-card-luxury">
                  {/* Left Column: Number & Icon Badge */}
                  <div className="service-card-meta">
                    <span className="service-card-num">{item.num}</span>
                    <div className="service-card-icon-wrap" title={item.title}>
                      <Icon size={26} strokeWidth={1.35} />
                    </div>
                  </div>

                  {/* Middle Column: Title, Description & Deliverables */}
                  <div className="service-card-body">
                    <div className="service-card-title-row">
                      <h2>{item.title}</h2>
                      <span className="service-card-tagline">{item.tagline}</span>
                    </div>
                    <p className="service-card-desc">{item.desc}</p>

                    <div className="service-deliverables">
                      <span className="deliverables-heading">CORE DELIVERABLES:</span>
                      <ul className="deliverables-list">
                        {item.deliverables.map((d, dIdx) => (
                          <li key={dIdx}>
                            <CheckCircle2 size={13} className="deliverable-check" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Interactive Video Preview & Details Link */}
                  <div className="service-card-actions">
                    <button
                      type="button"
                      className="service-video-preview-btn"
                      onClick={() => setActiveVideo(item)}
                      title={`Watch 3D video reel for ${item.title}`}
                    >
                      <span className="play-icon-circle">
                        <Play size={14} fill="currentColor" />
                      </span>
                      <span>Watch 3D Reel</span>
                    </button>

                    <Link
                      to={`/services/${item.num}`}
                      className="service-scope-link"
                      aria-label={`Open detailed scope for ${item.title}`}
                    >
                      <span>Explore Scope</span>
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 3D Video Modal Popup */}
      {activeVideo && (
        <div className="video-modal-backdrop" onClick={() => setActiveVideo(null)}>
          <div className="video-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="video-modal-close"
              onClick={() => setActiveVideo(null)}
              aria-label="Close 3D video preview"
            >
              <X size={20} />
            </button>
            <div className="video-modal-header">
              <span className="eyebrow">3D ARCHITECTURAL REEL · {activeVideo.num}</span>
              <h3>{activeVideo.title}</h3>
              <p>{activeVideo.videoTitle}</p>
            </div>
            <div className="video-modal-player-wrap">
              <video
                src={activeVideo.video}
                autoPlay
                controls
                loop
                playsInline
                className="video-modal-player"
              />
            </div>
            <div className="video-modal-footer">
              <Link
                to="/contact"
                className="pill dark"
                onClick={() => setActiveVideo(null)}
              >
                Book Private Consultation <ArrowUpRight size={14} />
              </Link>
              <Link
                to={`/services/${activeVideo.num}`}
                className="pill outline"
                onClick={() => setActiveVideo(null)}
              >
                View Full Specifications
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Process Section */}
      <section className="process-detail">
        <Reveal>
          <span className="eyebrow">OUR PROCESS & TIMELINE</span>
          <h2>
            Four disciplined stages.<br />
            <i>One uncompromising vision.</i>
          </h2>
          <p className="process-lead">
            Every project operates under transparent milestones: discovery brief, 3D design review, vendor procurement, and white-glove site delivery. Commercial terms and payment schedules are linked strictly to verifiable on-site progress.
          </p>
        </Reveal>
        {[
          [
            "Discover",
            "We listen to how you live, what you love, and the physical parameters of the site.",
            "You share references, floor plans, lifestyle rituals, and investment targets. We perform the site audit, feasibility check, and define the master project roadmap.",
          ],
          [
            "Design",
            "Spatial layouts, bespoke millwork, and photorealistic 3D concepts materialize.",
            "You review architectural floor plans, slab selections, and lighting schematics. Every detail is refined and frozen before fabrication begins.",
          ],
          [
            "Deliver",
            "Shop drawings, vetted master craftsmen, and on-site engineering converge.",
            "Procurement, stone cutting, and civil execution are synchronized under the watchful eye of our dedicated resident project architect.",
          ],
          [
            "Reveal",
            "Textiles, curated artwork, ambient lighting, and white-glove handover.",
            "We stage the final layers, conduct rigorous quality snag audits, and deliver a space that feels collected, serene, and immediately livable.",
          ],
        ].map(([x, short, long], i) => (
          <Reveal key={x} delay={i * 0.06}>
            <div className="step-detail">
              <span>0{i + 1}</span>
              <h3>{x}</h3>
              <p>{short}</p>
              <small>{long}</small>
            </div>
          </Reveal>
        ))}
      </section>

      {/* Architectural FAQs */}
      <section className="services-faq-section">
        <FAQAccordion
          title="Frequently Asked Questions on Services"
          subtitle="Clear answers on turnkey accountability, site coordination, milestone fee structures, and material provenance."
        />
      </section>

      {/* Direct Studio Call-to-Action */}
      <section className="services-cta-banner">
        <div className="cta-banner-inner">
          <span className="eyebrow">START A CONVERSATION</span>
          <h2>
            Ready to sculpt your next<br />
            <i>residential or commercial space?</i>
          </h2>
          <p>
            Book a preliminary design consultation with our principal team or calculate an immediate scope estimate.
          </p>
          <div className="cta-actions">
            <Link to="/begin-project" className="pill dark">
              Estimate Scope & Brief <ArrowUpRight size={15} />
            </Link>
            <Link to="/contact" className="pill outline">
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
