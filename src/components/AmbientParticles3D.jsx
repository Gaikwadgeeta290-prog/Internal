import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function AmbientParticles3D({ particleCount = 75, speed = 0.0006 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect low-power or mobile
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? Math.min(particleCount, 30) : particleCount;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 240;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Geometry: Floating architectural light motes
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 450;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 280;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      scales[i] = Math.random() * 2.5 + 1.2;

      velocities.push({
        x: (Math.random() - 0.5) * 0.15,
        y: Math.random() * 0.18 + 0.05,
        z: (Math.random() - 0.5) * 0.12,
        osc: Math.random() * Math.PI * 2,
      });
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Particle texture (soft circular glow)
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(225, 205, 155, 0.95)");
    gradient.addColorStop(0.35, "rgba(179, 147, 85, 0.45)");
    gradient.addColorStop(1, "rgba(24, 23, 21, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 6,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.7,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse Parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 35;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 25;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth mouse interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      particles.rotation.y = currentMouseX * 0.008;
      particles.rotation.x = currentMouseY * 0.006;

      const posArr = geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const vel = velocities[i];
        vel.osc += 0.012;

        // Upward drift + gentle horizontal oscillation
        posArr[i * 3 + 1] += vel.y;
        posArr[i * 3] += Math.sin(vel.osc) * 0.08;

        // Wrap around if drifts above top
        if (posArr[i * 3 + 1] > 140) {
          posArr[i * 3 + 1] = -140;
          posArr[i * 3] = (Math.random() - 0.5) * 450;
        }
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [particleCount, speed]);

  return <div ref={mountRef} className="ambient-particles-3d-wrap" aria-hidden="true" />;
}
