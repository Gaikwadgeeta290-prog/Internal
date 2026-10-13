import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import { projects } from "../data/content";
import { Layout, Reveal } from "../components/Layout";
import MediaCarousel from "../components/MediaCarousel";

export default function ProjectDetails() {
  const { id } = useParams();

  const staticProject = projects.find((item) => String(item.id) === String(id));
  const [databaseProject, setDatabaseProject] = useState(null);
  useEffect(() => {
    if (!String(id).startsWith("db-")) return;
    const databaseId = String(id).slice(3);
    fetch(`/api/projects/${databaseId}`).then(r => r.ok ? r.json() : Promise.reject()).then(data => {
      const p = data.item;
      setDatabaseProject({ ...p, id: `db-${p.id}`, databaseId: p.id, image: p.image_url || p.secondary_url || "", secondary: p.secondary_url || p.image_url || "", style: p.style || "Contemporary", story: p.story || "", gallery: (p.gallery || []).map(x => x.image_url).filter(Boolean).length ? p.gallery.map(x => x.image_url).filter(Boolean) : [p.image_url, p.secondary_url].filter(Boolean) });
    }).catch(() => setDatabaseProject(null));
  }, [id]);
  const project = String(id).startsWith("db-") ? databaseProject : staticProject;

  if (!project && String(id).startsWith("db-")) {
    return <Layout><section className="not-found-project"><span className="eyebrow">LOADING PROJECT</span><h1>Opening the project details…</h1></section></Layout>;
  }

  if (!project) {
    return (
      <Layout>
        <section className="not-found-project">
          <span className="eyebrow">PROJECT NOT FOUND</span>
          <h1>This project is no longer in the collection.</h1>
          <Link className="pill dark" to="/portfolio">
            Back to portfolio <ArrowUpRight />
          </Link>
        </section>
      </Layout>
    );
  }

  const index = projects.findIndex((item) => item.id === project.id);
  const next = projects[(Math.max(index, 0) + 1) % projects.length];
  const previous = projects[(Math.max(index, 0) - 1 + projects.length) % projects.length];

  const gallery =
    project.gallery?.length
      ? project.gallery
      : [project.image, project.secondary];

  return (
    <Layout>
      <section className="project-detail-hero project-depth">
        <MediaCarousel
          images={gallery}
          alt={project.title}
          interval={2000}
          fit="contain"
          className="project-detail-carousel"
        />

        <div className="project-detail-hero-copy">
          <span>
            {project.category} · {project.location} ·{" "}
            {project.year}
          </span>

          <h1>{project.title}</h1>

          <p>{project.style}</p>
        </div>

        <Link
          className="project-back"
          to="/portfolio"
          aria-label="Back to portfolio"
        >
          <ArrowLeft size={16} />
          Portfolio
        </Link>
      </section>

      <section className="case-intro project-specific-intro">
        <Reveal>
          <div>
            <span className="eyebrow">
              {project.category} · {project.style}
            </span>

            <h2>
              {project.detailHeading ||
                project.story}
            </h2>
          </div>

          <div className="case-intro-copy">
            <p>
              {project.detailDescription ||
                project.story}
            </p>

            <p>
              {project.story}
            </p>
          </div>
        </Reveal>
      </section>

      <section className="case-gallery project-specific-gallery">
        <Reveal>
          <div className="case-gallery-main">
            <MediaCarousel
              images={gallery}
              alt={`${project.title} interior`}
              interval={2000}
              fit="contain"
              className="case-gallery-carousel single-gallery"
            />
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="case-copy">
            <span className="eyebrow">
              MATERIAL LANGUAGE
            </span>

            <h3>
              {project.materials ||
                "Natural materials, considered proportions and layered light."}
            </h3>

            <p>
              {project.scope ||
                "Interior architecture, detailing and final styling."}
            </p>
          </div>
        </Reveal>
      </section>

      <section className="project-reel-section">
        <div className="project-reel-frame">
          <video autoPlay muted loop playsInline poster={project.image} aria-label={`${project.category} interior walkthrough`}>
            <source src={project.videoSrc || "/videos/atelier-materials.mp4"} type="video/mp4" />
          </video>
          <div className="project-reel-overlay">
            <span className="eyebrow">{project.category.toUpperCase()} · INTERIOR WALKTHROUGH</span>
            <h2>{project.title}<br/><i>in motion.</i></h2>
          </div>
        </div>
      </section>

      <section
        className="image-break project-break"
        style={{
          backgroundImage: `url(${project.secondary || project.image})`,
        }}
      >
        <div>
          <span className="eyebrow">
            THE EXPERIENCE
          </span>

          <h2>
            {project.title}
            <br />
            <i>unfolds in layers.</i>
          </h2>
        </div>
      </section>

      <section className="next-project">
        <Reveal>
          <span>NEXT PROJECT</span>

          <Link to={`/portfolio/${next.id}`}>
            <div className="next-project-image">
              <img
                src={next.image}
                alt={next.title}
                loading="lazy"
              />
            </div>

            <div>
              <small>
                {next.category} · {next.location}
              </small>

              <h2>{next.title}</h2>

              <p>{next.story}</p>

              <b>
                View project <ArrowRight />
              </b>
            </div>
          </Link>
        </Reveal>

        <Link
          className="previous-project-link"
          to={`/portfolio/${previous.id}`}
        >
          <ArrowLeft size={15} />
          Previous project · {previous.title}
        </Link>
      </section>
    </Layout>
  );
}
