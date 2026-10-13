import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ p, index, onOpen }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  return <motion.article className={`project-card card-${index % 3}`} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: .18, margin: '-70px' }} transition={{ duration: .72, delay: (index % 4) * .07, ease: [.22, 1, .36, 1] }} onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: (e.clientY - r.top - r.height / 2) / -22, y: (e.clientX - r.left - r.width / 2) / 22 }); }} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
    <button onClick={() => onOpen ? onOpen(p) : navigate(`/portfolio/${p.id}`)} aria-label={`Open ${p.title}`}>
      <div className="project-media">
        <motion.img src={p.image} alt={p.title} style={{ rotateX: tilt.x, rotateY: tilt.y }} />
        <div className="project-overlay" />
        <div className="project-meta"><span>{p.category} · {p.location}</span><h3>{p.title}</h3><b>{p.video && <Play size={13} fill="currentColor" />} View project <ArrowUpRight size={17} /></b></div>
      </div>
    </button>
  </motion.article>;
}
