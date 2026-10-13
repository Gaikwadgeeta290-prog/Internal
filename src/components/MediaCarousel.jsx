import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function MediaCarousel({
  images = [],
  alt = "",
  interval = 2000,
  className = "",
  fit = "cover",
}) {
  const safeImages = useMemo(
    () => Array.from(new Set(images.filter(Boolean))),
    [images]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [safeImages.join("|")]);

  useEffect(() => {
    if (safeImages.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % safeImages.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [safeImages.length, interval]);

  if (!safeImages.length) return null;

  return (
    <div
      className={`media-carousel ${className}`}
      style={{ "--media-fit": fit }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={`${safeImages[index]}-${index}`}
          src={safeImages[index]}
          alt={alt}
          initial={{
            opacity: 0,
            scale: 1.015,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 1.01,
          }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </AnimatePresence>

      {safeImages.length > 1 && (
        <div className="media-dots" aria-hidden="true">
          {safeImages.map((_, i) => (
            <span
              className={i === index ? "active" : ""}
              key={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
