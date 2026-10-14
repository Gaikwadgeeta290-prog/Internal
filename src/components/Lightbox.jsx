import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowLeft, ArrowRight, ArrowUpRight, Compass, Maximize2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Lightbox({
  project,
  currentIndex = 0,
  total = 0,
  onClose,
  onPrev,
  onNext,
  onSelectImage,
}) {
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [project, onClose, onPrev, onNext]);

  if (!project) return null;

  const galleryImages = project.gallery?.length ? project.gallery : [project.image, project.secondary].filter(Boolean);
  const activeImage = project.activeImage || project.image;

  return (
    <AnimatePresence>
      <motion.div
        className="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} Lightbox Gallery`}
      >
        {/* Top Bar Controls */}
        <div className="lb-top-bar">
          <div className="lb-counter">
            <span className="lb-gold-dot" />
            <span>
              {String((currentIndex ?? 0) + 1).padStart(2, "0")} / {String(total || 1).padStart(2, "0")}
            </span>
            <span className="lb-proj-name">{project.title}</span>
          </div>

          <button
            className="lb-close"
            onClick={onClose}
            aria-label="Close lightbox (Escape)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Previous Navigation Button */}
        {onPrev && (
          <button
            className="lb-nav-btn lb-prev"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous project (Left arrow)"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Main Content Modal */}
        <motion.div
          key={project.id + (activeImage || "")}
          className="lb-content"
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lb-media-frame">
            <img
              src={activeImage}
              alt={project.title}
              className="lb-main-image"
            />
          </div>

          <div className="lb-caption">
            <div className="lb-meta-tags">
              <span className="lb-tag">{project.category}</span>
              <span className="lb-tag">{project.location}</span>
              {project.year && <span className="lb-tag-year">{project.year}</span>}
            </div>

            <h2>{project.title}</h2>
            <p className="lb-story">{project.story || project.detailDescription}</p>

            {project.materials && (
              <div className="lb-materials-callout">
                <small>MATERIAL PALETTE</small>
                <p>{project.materials}</p>
              </div>
            )}

            <div className="lb-action-footer">
              <Link
                to={`/portfolio/${project.databaseId ? `db-${project.databaseId}` : project.id}`}
                onClick={onClose}
                className="pill dark"
              >
                View Full Case Study <ArrowUpRight size={14} />
              </Link>
            </div>

            {/* Thumbnail selector if gallery has multiple photos */}
            {galleryImages.length > 1 && (
              <div className="lb-thumbnails">
                <small>GALLERY ANGLES</small>
                <div className="lb-thumb-row">
                  {galleryImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSelectImage?.(imgUrl)}
                      className={`lb-thumb-btn ${activeImage === imgUrl ? "active" : ""}`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Next Navigation Button */}
        {onNext && (
          <button
            className="lb-nav-btn lb-next"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next project (Right arrow)"
          >
            <ArrowRight size={20} />
          </button>
        )}

        <div className="lb-note">
          <Maximize2 size={13} />
          <span>Press ESC to close · Use arrow keys ← → to browse</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
