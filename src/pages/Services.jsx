import { ArrowUpRight, Sofa, Home as HomeIcon, Layers3, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { services } from "../data/content";
import { Layout, Reveal, Sequence } from "../components/Layout";
const icons=[Sofa,HomeIcon,Layers3,Palette];
export default function Services(){return <Layout>
<section className="page-hero" style={{backgroundImage:"linear-gradient(rgba(18,18,16,.24),rgba(18,18,16,.32)),url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=88)"}}><Reveal><span className="eyebrow">EXPERTISE</span><h1>Design that moves from <i>idea to reality.</i></h1><p>An end-to-end studio practice from spatial planning and material direction to styling and execution.</p></Reveal></section>
<section className="service-page">{services.map(([n,t,d],i)=>{const Icon=icons[i];return <Reveal key={n}><article><span className="service-number">{n}</span><div className="service-page-icon"><Icon size={30} strokeWidth={1.25}/></div><div><h2>{t}</h2><p>{d}</p><ul><li>Concept & spatial planning</li><li>Material and lighting palette</li><li>Detailed drawings & coordination</li><li>Execution / styling support</li></ul></div><Link to={`/services/${n}`} aria-label={`Open ${t}`}><ArrowUpRight/></Link></article></Reveal>})}</section>
<section className="process-detail"><Reveal><span className="eyebrow">OUR PROCESS</span><h2>Four steps.<br/><i>One clear vision.</i></h2><p className="process-lead">You always know what happens next: brief, design review, execution coordination and final styling. Commercial terms and payment milestones are agreed before the corresponding stage begins.</p></Reveal>{[
['Discover','We listen to how you live, what you love and what the space needs.','You share references, location, scope and budget. We define the brief, priorities and project roadmap.'],
['Design','Plans, palettes and 3D concepts turn the idea into something tangible.','You review layouts, materials and visual direction. Revisions are agreed before detailed documentation.'],
['Deliver','Drawings, vendors and site coordination bring every decision together.','Procurement and site work are coordinated against the approved design and agreed project timeline.'],
['Reveal','Styling, art and final details complete the story.','We finish the final layers, review the completed spaces and hand over the finished design story.']
].map(([x,short,long],i)=><Reveal key={x} delay={i*.06}><div className="step-detail"><span>0{i+1}</span><h3>{x}</h3><p>{short}</p><small>{long}</small></div></Reveal>)}</section>
</Layout>}
