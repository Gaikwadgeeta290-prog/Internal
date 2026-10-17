import { useState, useRef, useEffect } from "react";
import { Play, Pause, Maximize2, Sparkles, ArrowUpRight, Volume2, VolumeX, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const REELS = [
  {
    id: "living",
    title: "Living Pavilion",
    subtitle: "Spatial Volume & Daylight Trajectory",
    video: "/videos/atelier-living-reel.mp4",
    spec: "Double-height glazing · Navona Travertine · Concealed HVAC coves",
    duration: "4K 3D Walkthrough"
  },
  {
    id: "bedroom",
    title: "Master Suite",
    subtitle: "Circadian Lighting & Acoustic Serenity",
    video: "/videos/atelier-bedroom-reel.mp4",
    spec: "Fluted European oak · Bouclé wall panels · 2400K Warm circadian dimming",
    duration: "Atmospheric 3D Reel"
  },
  {
    id: "kitchen",
    title: "Gourmet Culinary",
    subtitle: "Monolithic Quartzite & Concealed Pocket Doors",
    video: "/videos/atelier-kitchen-reel.mp4",
    spec: "Honed quartzite island · Integrated Miele appliances · Zero-reveal millwork",
    duration: "Precision Joinery 3D"
  },
  {
    id: "materials",
    title: "Tactile Provenance",
    subtitle: "Quarry-Direct Stone & Hand-Troweled Plaster",
    video: "/videos/atelier-materials.mp4",
    spec: "Calacatta Viola marble · Venetian lime plaster · Solid patinated brass",
    duration: "Material Micro-Reel"
  }
];

export default function Cinematic3DReels() {
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const activeReel = REELS[activeReelIndex];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [activeReelIndex]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section className="cinematic-reels-section">
      <div className="reels-header">
        <div className="reels-title-block">
          <span className="eyebrow">
            <Sparkles size={12} className="eyebrow-sparkle" /> 3D SPATIAL EXPERIENCES
          </span>
          <h2>
            Immerse yourself in <i>crafted atmosphere.</i>
          </h2>
          <p>
            Experience our unbuilt spatial volumes before ground is broken. Select an environment to preview path-traced lighting and material materiality.
          </p>
        </div>

        {/* Room Selector Buttons */}
        <div className="reels-tab-bar" role="tablist">
          {REELS.map((reel, idx) => (
            <button
              key={reel.id}
              role="tab"
              aria-selected={idx === activeReelIndex}
              className={`reels-tab-btn ${idx === activeReelIndex ? "active" : ""}`}
              onClick={() => setActiveReelIndex(idx)}
            >
              <span className="tab-idx">0{idx + 1}</span>
              <span className="tab-name">{reel.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Cinema Viewport */}
      <div className="reels-viewport-frame">
        <video
          ref={videoRef}
          key={activeReel.video}
          src={activeReel.video}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="reels-video-element"
        />

        <div className="reels-vignette-overlay" />

        {/* Top Info Bar */}
        <div className="reels-top-bar">
          <div className="reels-badge">
            <span className="live-indicator-dot" />
            <span>3D ARCHITECTURAL REEL · 0{activeReelIndex + 1}</span>
          </div>

          <div className="reels-quick-controls">
            <button
              type="button"
              className="ctrl-icon-btn"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute Ambient Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <button
              type="button"
              className="ctrl-icon-btn"
              onClick={toggleFullscreen}
              title="Fullscreen Cinema Mode"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>

        {/* Bottom Metadata & Controls */}
        <div className="reels-bottom-meta">
          <div className="reels-info">
            <span className="reels-spec-tag">{activeReel.duration}</span>
            <h3>{activeReel.title}</h3>
            <p className="reels-subtitle">{activeReel.subtitle}</p>
            <p className="reels-material-spec">{activeReel.spec}</p>
          </div>

          <div className="reels-actions-wrap">
            <button
              type="button"
              className="reels-play-toggle"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>

            <Link to="/contact" className="pill light reels-consult-btn">
              Consult on this Layout <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
