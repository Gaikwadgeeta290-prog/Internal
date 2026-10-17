import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Play, Sofa, Home as HomeIcon, Layers3, Palette } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { projects, services, testimonials, posts } from "../data/content";
import { Layout, Reveal, Sequence } from "../components/Layout";
import ProjectCard from "../components/ProjectCard";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import MaterialsShowcase from "../components/MaterialsShowcase";
import AmbientParticles3D from "../components/AmbientParticles3D";
import Cinematic3DReels from "../components/Cinematic3DReels";

const serviceIcons = [Sofa, HomeIcon, Layers3, Palette];

export default function Home() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  // Multi-plane 3D Parallax Scroll transformations
  const heroMediaY = useTransform(scrollY, [0, 700], [0, 150]);
  const heroMediaScale = useTransform(scrollY, [0, 700], [1, 1.07]);
  const heroCopyY = useTransform(scrollY, [0, 500], [0, -55]);
  const heroCopyOpacity = useTransform(scrollY, [0, 420], [1, 0.15]);

  return (
    <Layout>
      <section className="hero hero-video">
        {/* 3D Multi-plane Media Layer */}
        <motion.div
          className="hero-media-wrapper"
          style={{ y: heroMediaY, scale: heroMediaScale }}
        >
          <video
            className="hero-video-media"
            autoPlay
            muted
            loop
            playsInline
            poster={projects[0]?.image}
          >
            <source src="/videos/atelier-hero.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* 3D Ambient Dust / Light Motes Canvas */}
        <AmbientParticles3D particleCount={75} />

        <div className="hero-shade" />
        <div className="hero-symbol">
          <Sofa size={26} strokeWidth={1.5} />
        </div>

        {/* 3D Foreground Copy Layer */}
        <motion.div
          className="hero-copy"
          style={{
            y: heroCopyY,
            opacity: heroCopyOpacity,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            INTERIOR ARCHITECTURE · INDIA
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            Spaces<br />
            <i>with soul.</i>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            Quietly expressive interiors shaped by light, material and the rituals of everyday life.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="hero-actions"
          >
            <Link className="pill light" to="/portfolio">
              Explore portfolio <ArrowUpRight size={15} />
            </Link>
            <Link className="pill dark hero-cta-btn" to="/begin-project">
              Book consultation <ArrowUpRight size={15} />
            </Link>
          </motion.div>
        </motion.div>

        <div className="hero-bottom">
          <span>SCROLL TO EXPLORE</span>
          <i />
        </div>
      </section>

      <section className="manifesto">
        <Sequence>
          <span className="eyebrow">THE ATELIER</span>
          <h2>
            We create spaces that feel <i>collected, not decorated.</i>
          </h2>
          <p>
            From architectural planning to the final object on a shelf, every decision is part of one visual story—personal, tactile and built to last.
          </p>
          <Link className="text-link" to="/studio">
            Discover our philosophy <ArrowRight />
          </Link>
        </Sequence>
      </section>

      <section className="featured">
        <Reveal>
          <div className="section-title">
            <div>
              <span className="eyebrow">SELECTED WORK</span>
              <h2>
                Designed to be <i>lived in.</i>
              </h2>
            </div>
            <Link className="text-link" to="/portfolio">
              View all projects <ArrowRight />
            </Link>
          </div>
        </Reveal>
        <div className="project-grid-safe home-project-grid">
          {projects.slice(0, 6).map((project, index) => (
            <ProjectCard
              key={project.id}
              p={project}
              index={index}
              onOpen={() => navigate(`/portfolio/${project.id}`)}
            />
          ))}
        </div>
      </section>

      {/* Interactive Before & After Renovation Transformation */}
      <BeforeAfterSlider />

      {/* Interactive Cinematic 3D Reels Theatre */}
      <Cinematic3DReels />

      <section className="services-home">
        <Sequence>
          <span className="eyebrow">WHAT WE DO</span>
          <h2>
            From first sketch<br />
            to <i>final styling.</i>
          </h2>
        </Sequence>
        <div className="service-list">
          {services.map(([number, title, description], i) => {
            const Icon = serviceIcons[i] || Sofa;
            return (
              <Reveal key={number}>
                <Link to={`/services/${number}`}>
                  <span className="service-number">{number}</span>
                  <div className="service-icon">
                    <Icon size={25} strokeWidth={1.35} />
                  </div>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  <ArrowUpRight />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Interactive Materials & Finishes Showcase */}
      <MaterialsShowcase />

      <section className="process-band">
        <Reveal>
          <span className="eyebrow">OUR PROCESS</span>
          <h2>
            Four movements.<br />
            <i>One clear vision.</i>
          </h2>
          <p className="process-lead">
            A clear path from the first conversation to the finished room, with design decisions, communication and delivery explained at every stage.
          </p>
        </Reveal>
        <div className="process-row">
          {[
            [
              "Discover",
              "Listen, understand and define the feeling.",
              "We start with your space, lifestyle, references, budget and timeline. The first conversation turns an idea into a clear brief.",
            ],
            [
              "Design",
              "Shape plans, palettes and visual direction.",
              "We develop layouts, material palettes, lighting and visual references, then refine the direction with you before detailed drawings.",
            ],
            [
              "Deliver",
              "Coordinate every detail from drawing to site.",
              "Drawings, vendors, procurement and site coordination move in sequence so the design intent stays consistent through execution.",
            ],
            [
              "Reveal",
              "Style, refine and hand over a finished story.",
              "Furniture, art, lighting and final styling complete the home. We review the finished details before handover.",
            ],
          ].map(([title, short, long], index) => (
            <Reveal key={title} delay={index * 0.1}>
              <div>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{short}</p>
                <small>{long}</small>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="testimonial-home">
        <Reveal>
          <span className="eyebrow">CLIENT STORIES</span>
          <div className="testimonial-cards">
            {testimonials.map(([quote, name, project], i) => (
              <motion.article key={name} whileHover={{ y: -8 }}>
                <span>0{i + 1}</span>
                <blockquote>{quote}</blockquote>
                <p>{name}</p>
                <small>{project}</small>
              </motion.article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="insight-preview">
        <Reveal>
          <div className="section-title">
            <div>
              <span className="eyebrow">THE JOURNAL</span>
              <h2>
                Notes on <i>space & life.</i>
              </h2>
            </div>
            <Link className="text-link" to="/insights">
              Read all insights <ArrowRight />
            </Link>
          </div>
        </Reveal>
        <div className="post-grid">
          {posts.map(([title, description, image], index) => (
            <Reveal key={title} delay={(index % 3) * 0.1}>
              <Link to={`/insights/${index + 1}`} className="post-card">
                <img src={image} alt={title} loading="lazy" />
                <span>INSIGHT · 2026</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <Reveal>
          <span className="eyebrow">START A CONVERSATION</span>
          <h2>
            Have a space<br />
            in <i>mind?</i>
          </h2>
          <Link className="pill dark" to="/begin-project">
            Begin your project <ArrowUpRight />
          </Link>
        </Reveal>
      </section>
    </Layout>
  );
}
