import { ArrowUpRight, Sofa, Home as HomeIcon, Layers3, Palette, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { services } from "../data/content";
import { Layout, Reveal, Sequence } from "../components/Layout";
import FAQAccordion from "../components/FAQAccordion";

const icons = [Sofa, HomeIcon, Layers3, Palette];

export default function Services() {
  return (
    <Layout>
      <section
        className="page-hero"
        style={{
          backgroundImage:
            "linear-gradient(rgba(18,18,16,.24),rgba(18,18,16,.32)),url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=88)",
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

      {/* Services Grid */}
      <section className="service-page">
        {services.map(([n, t, d], i) => {
          const Icon = icons[i];
          return (
            <Reveal key={n}>
              <article>
                <span className="service-number">{n}</span>
                <div className="service-page-icon">
                  <Icon size={30} strokeWidth={1.25} />
                </div>
                <div>
                  <h2>{t}</h2>
                  <p>{d}</p>
                  <ul>
                    <li>Concept & spatial layout optimization</li>
                    <li>Quarry-direct stone and tactile material palettes</li>
                    <li>Technical MEP & millwork construction documentation</li>
                    <li>Dedicated on-site supervision & white-glove styling</li>
                  </ul>
                </div>
                <Link to={`/services/${n}`} aria-label={`Open ${t}`}>
                  <ArrowUpRight />
                </Link>
              </article>
            </Reveal>
          );
        })}
      </section>

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
