import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { X, Play, Pause, ZoomIn, ZoomOut, Compass, Eye, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PANORAMA_ROOMS = [
  {
    id: "penthouse_living",
    title: "Worli Penthouse · Oceanfront Living Pavilion",
    subtitle: "Full 360° perspective of travertine slab flooring, fluted oak millwork & panoramic sea views.",
    url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=90",
  },
  {
    id: "quartzite_kitchen",
    title: "Sculptural Quartzite & Dining Salon",
    subtitle: "Monolithic quartzite island with integrated concealed cabinetry and aged brass fixtures.",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=90",
  },
  {
    id: "boucle_sanctuary",
    title: "Malabar Hill · Primary Bedroom Suite",
    subtitle: "Wabi-sabi retreat layered in Belgian bouclé, smoked European oak, and indirect diffused lighting.",
    url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=90",
  },
];

export default function PanoramicViewer3D({ isOpen, onClose, initialRoomIndex = 0 }) {
  const containerRef = useRef(null);
  const [activeRoomIndex, setActiveRoomIndex] = useState(initialRoomIndex);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(75);

  const activeRoom = PANORAMA_ROOMS[activeRoomIndex];

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    setIsLoading(true);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      zoomLevel,
      container.clientWidth / container.clientHeight,
      1,
      1200
    );
    camera.target = new THREE.Vector3(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Inverted Sphere for 360 view
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    let isDisposed = false;

    const texture = textureLoader.load(
      activeRoom.url,
      () => {
        if (isDisposed) return;
        setIsLoading(false);
        renderer.render(scene, camera);
      },
      undefined,
      (err) => {
        console.warn("Panorama texture error, fallback active:", err);
        if (isDisposed) return;
        setIsLoading(false);
      }
    );

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Interaction controls
    let isUserInteracting = false;
    let onPointerDownMouseX = 0;
    let onPointerDownMouseY = 0;
    let lon = 0;
    let onPointerDownLon = 0;
    let lat = 0;
    let onPointerDownLat = 0;
    let phi = 0;
    let theta = 0;

    const onPointerDown = (event) => {
      if (event.isPrimary === false) return;
      isUserInteracting = true;
      onPointerDownMouseX = event.clientX;
      onPointerDownMouseY = event.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
    };

    const onPointerMove = (event) => {
      if (event.isPrimary === false) return;
      lon = (onPointerDownMouseX - event.clientX) * 0.15 + onPointerDownLon;
      lat = (event.clientY - onPointerDownMouseY) * 0.15 + onPointerDownLat;
    };

    const onPointerUp = (event) => {
      if (event.isPrimary === false) return;
      isUserInteracting = false;
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };

    const onWheel = (event) => {
      camera.fov = THREE.MathUtils.clamp(camera.fov + event.deltaY * 0.05, 40, 95);
      camera.updateProjectionMatrix();
      setZoomLevel(Math.round(camera.fov));
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("wheel", onWheel, { passive: true });

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isUserInteracting && isAutoRotating) {
        lon += 0.08;
      }

      lat = Math.max(-85, Math.min(85, lat));
      phi = THREE.MathUtils.degToRad(90 - lat);
      theta = THREE.MathUtils.degToRad(lon);

      const target = new THREE.Vector3();
      target.x = 500 * Math.sin(phi) * Math.cos(theta);
      target.y = 500 * Math.cos(phi);
      target.z = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(target);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      if (container) {
        container.removeEventListener("pointerdown", onPointerDown);
        container.removeEventListener("wheel", onWheel);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [isOpen, activeRoomIndex, isAutoRotating]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="panoramic-3d-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div ref={containerRef} className="panoramic-3d-canvas" />

        {isLoading && (
          <div className="panoramic-loading-overlay">
            <Loader2 className="spinning-loader" size={32} />
            <span>Streaming 360° Architectural Environment...</span>
          </div>
        )}

        <div className="panoramic-top-bar">
          <div className="panoramic-title-wrap">
            <span className="eyebrow-pill">
              <Eye size={12} /> 360° ARCHITECTURAL WALKTHROUGH
            </span>
            <h3>{activeRoom.title}</h3>
            <p>{activeRoom.subtitle}</p>
          </div>

          <button
            type="button"
            className="panoramic-close-btn"
            onClick={onClose}
            aria-label="Close 360 Walkthrough"
          >
            <X size={20} />
          </button>
        </div>

        <div className="panoramic-bottom-bar">
          <div className="panoramic-rooms-pills">
            {PANORAMA_ROOMS.map((room, idx) => (
              <button
                key={room.id}
                type="button"
                className={`panoramic-room-pill ${activeRoomIndex === idx ? "active" : ""}`}
                onClick={() => setActiveRoomIndex(idx)}
              >
                0{idx + 1} · {room.title.split("·")[0].trim()}
              </button>
            ))}
          </div>

          <div className="panoramic-actions">
            <button
              type="button"
              className="panoramic-tool-btn"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              title={isAutoRotating ? "Pause Auto-Rotate" : "Start Auto-Rotate"}
            >
              {isAutoRotating ? <Pause size={16} /> : <Play size={16} />}
              <span>{isAutoRotating ? "Pause" : "Rotate"}</span>
            </button>

            <div className="panoramic-hint">
              <Compass size={14} /> Drag to look around · Scroll to zoom
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
