import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ p, index, onOpen }) {
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, opacity: 0 });
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calibrated subtle 3D tilt angles (max 6.5 degrees for quiet luxury feel)
    const rotX = -((y - centerY) / centerY) * 6.5;
    const rotY = ((x - centerX) / centerX) * 6.5;

    setTilt({
      rotateX: rotX,
      rotateY: rotY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      opacity: 0.16,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, opacity: 0 });
  };

  const handleCardClick = () => {
    if (onOpen) {
      onOpen(p, index);
    } else {
      navigate(`/portfolio/${p.databaseId ? `db-${p.databaseId}` : p.id}`);
    }
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    navigate(`/portfolio/${p.databaseId ? `db-${p.databaseId}` : p.id}`);
  };

  return (
    <motion.article
      ref={cardRef}
      className={`project-card card-${index % 3} tilt-3d-enabled`}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.65,
        delay: Math.min((index % 3) * 0.08, 0.24),
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(${isHovered ? 1.018 : 1}, ${isHovered ? 1.018 : 1}, 1)`,
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
      }}
    >
      <div
        onClick={handleCardClick}
        aria-label={`Open project: ${p.title}, ${p.category} in ${p.location}`}
        className="project-card-button"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCardClick();
          }
        }}
      >
        <div className="project-media">
          <img
            src={p.image}
            alt={p.title}
            loading="lazy"
            className="project-card-image"
          />
          <div className="project-overlay" />

          {/* 3D Specular Sheen Glare */}
          <div
            className="project-card-glare"
            style={{
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0) 60%)`,
              opacity: tilt.opacity,
            }}
          />
          
          <div className="project-card-badge">
            <span className="project-badge-category">{p.category}</span>
            {p.year && <span className="project-badge-year">{p.year}</span>}
          </div>

          <div className="project-meta">
            <span className="project-meta-location">{p.location || 'India'}</span>
            <h3 className="project-meta-title">{p.title}</h3>
            <div
              className="project-meta-action"
              onClick={handleDetailsClick}
              role="link"
              tabIndex={0}
              aria-label={`View full case study for ${p.title}`}
            >
              {p.video && <Play size={12} fill="currentColor" className="project-play-icon" />}
              <span>View Case Study</span>
              <ArrowUpRight size={15} className="project-arrow-icon" />
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
