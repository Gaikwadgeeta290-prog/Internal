import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import { Layout, Reveal } from "../components/Layout";
import ProjectCard from "../components/ProjectCard";
import Lightbox from "../components/Lightbox";
import { projects } from "../data/content";

const categories = ["All", "Living", "Bedroom", "Kitchen", "Dining"];

export default function Portfolio() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All styles");
  const [roomFilter, setRoomFilter] = useState("All rooms");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [yearFilter, setYearFilter] = useState("All years");
  const [dbProjects, setDbProjects] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [lightboxProject, setLightboxProject] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetch("/api/projects").then(r => r.ok ? r.json() : Promise.reject()).then(data => {
      const mapped = (data.items || []).map(p => ({
        ...p, id: `db-${p.id}`, databaseId: p.id, image: p.image_url || p.secondary_url || "",
        secondary: p.secondary_url || p.image_url || "", style: p.style || "Contemporary",
        story: p.story || "", gallery: [p.image_url, p.secondary_url].filter(Boolean), video: Boolean(p.secondary_url)
      }));
      setDbProjects(mapped);
    }).catch(() => {});
  }, []);

  const allProjects = [...dbProjects, ...projects];
  const visibleProjects = useMemo(() => allProjects.filter(project =>
    (filter === "All" || project.category === filter) &&
    (styleFilter === "All styles" || project.style === styleFilter) &&
    (roomFilter === "All rooms" || project.category === roomFilter) &&
    (locationFilter === "All locations" || project.location === locationFilter) &&
    (yearFilter === "All years" || String(project.year) === yearFilter)
  ), [filter, styleFilter, roomFilter, locationFilter, yearFilter, dbProjects]);
  const styles = ["All styles", ...new Set(allProjects.map(p => p.style).filter(Boolean))];
  const locations = ["All locations", ...new Set(allProjects.map(p => p.location).filter(Boolean))];
  const years = ["All years", ...new Set(allProjects.map(p => String(p.year)).filter(Boolean))];
  const [sortOrder, setSortOrder] = useState("newest");
  const sortedProjects = useMemo(() => [...visibleProjects].sort((a,b) => {
    if (sortOrder === "az") return a.title.localeCompare(b.title);
    const delta = String(b.year || "").localeCompare(String(a.year || ""));
    return sortOrder === "oldest" ? -delta : delta;
  }), [visibleProjects, sortOrder]);
  const displayedProjects = showMore ? sortedProjects : sortedProjects.slice(0, 12);
  const hero = allProjects[2] || projects[0];

  const handleOpenLightbox = (project, idx) => {
    setLightboxProject(project);
    setLightboxIndex(idx);
  };

  const handleNextLightbox = () => {
    const nextIdx = (lightboxIndex + 1) % displayedProjects.length;
    setLightboxIndex(nextIdx);
    setLightboxProject(displayedProjects[nextIdx]);
  };

  const handlePrevLightbox = () => {
    const prevIdx = (lightboxIndex - 1 + displayedProjects.length) % displayedProjects.length;
    setLightboxIndex(prevIdx);
    setLightboxProject(displayedProjects[prevIdx]);
  };

  return (
    <Layout>
      <section className="page-hero portfolio-page-hero">
        <img
          className="page-hero-media"
          src={hero.image}
          alt=""
          aria-hidden="true"
        />

        <div className="page-hero-shade" />

        <Reveal>
          <span className="eyebrow">SELECTED WORK · {allProjects.length} PROJECTS</span>

          <h1>
            A portfolio of{" "}
            <i>quietly bold</i> spaces.
          </h1>

          <p>
            Residential interiors shaped by proportion, material,
            light and the people who inhabit them.
          </p>
        </Reveal>
      </section>

      <section className="portfolio-wrap">
        <Reveal>
          <div className="filterbar">
            {categories.map((category) => (
              <button
                type="button"
                className={
                  filter === category ? "selected" : ""
                }
                onClick={() => setFilter(category)}
                key={category}
              >
                {category}
              </button>
            ))}

            <span>
              {String(visibleProjects.length).padStart(2, "0")}{" "}
              PROJECTS
            </span>
          </div>
          <div className="filterbar extended-filters" aria-label="Additional project filters">
            <select aria-label="Filter by style" value={styleFilter} onChange={e => setStyleFilter(e.target.value)}>{styles.map(v => <option key={v} value={v}>{v}</option>)}</select>
            <select aria-label="Filter by room type" value={roomFilter} onChange={e => setRoomFilter(e.target.value)}>{["All rooms", ...categories.slice(1)].map(v => <option key={v} value={v}>{v}</option>)}</select>
            <select aria-label="Filter by location" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>{locations.map(v => <option key={v} value={v}>{v}</option>)}</select>
            <select aria-label="Filter by year" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>{years.map(v => <option key={v} value={v}>{v}</option>)}</select>
            <select aria-label="Sort projects" value={sortOrder} onChange={e => setSortOrder(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="az">Title A–Z</option></select>
          </div>
        </Reveal>

        <div className="portfolio-grid">
          {displayedProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              p={project}
              index={index}
              onOpen={(p, idx) => handleOpenLightbox(p, idx !== undefined ? idx : index)}
            />
          ))}
        </div>
        {visibleProjects.length > 12 && <div className="portfolio-load-more"><button className="pill dark" onClick={() => setShowMore(v => !v)}>{showMore ? "Show fewer projects" : "Load more projects"}</button></div>}
      </section>

      {/* If the local interior video is a 3D/interior walkthrough,
          it appears AFTER the project collection as requested. */}
      <section className="video-break portfolio-video-section">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={hero.image}
        >
          <source
            src="/videos/Master_Suite (2).mp4"
            type="video/mp4"
          />
        </video>

        <div className="video-break-shade" />

        <div>
          <span className="eyebrow">
            INTERIOR WALKTHROUGH · MATERIAL · LIGHT
          </span>

          <h2>
            A room is not a picture.
            <br />
            <i>It is an experience.</i>
          </h2>
        </div>
      </section>

      <section className="portfolio-cta">
        <Reveal>
          <h2>Inspired by a space?</h2>

          <Link
            to="/begin-project"
            className="pill dark"
          >
            Start a conversation
            <ArrowUpRight />
          </Link>
        </Reveal>
      </section>

      {/* Fullscreen High-Resolution Lightbox */}
      <Lightbox
        project={lightboxProject}
        currentIndex={lightboxIndex}
        total={displayedProjects.length}
        onClose={() => setLightboxProject(null)}
        onPrev={handlePrevLightbox}
        onNext={handleNextLightbox}
        onSelectImage={(imgUrl) => {
          setLightboxProject(prev => prev ? { ...prev, activeImage: imgUrl } : null);
        }}
      />
    </Layout>
  );
}
