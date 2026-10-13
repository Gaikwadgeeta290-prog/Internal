import { useState } from "react";
import { ArrowUpRight, CheckCircle2, CalendarDays, Clock, MapPin, Mail, Phone, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Layout, Sequence, Reveal } from "../components/Layout";

const initial = { name:"", email:"", phone:"", date:"", time:"", mode:"Video consultation" };

export default function Contact(){
  const [book,setBook]=useState(initial);
  const [status,setStatus]=useState({state:"idle",message:""});
  const update=(name,value)=>setBook(v=>({...v,[name]:value}));
  const submit=async e=>{
    e.preventDefault(); setStatus({state:"loading",message:""});
    try{
      const r=await fetch('/api/consultations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(book)});
      const d=await r.json(); if(!r.ok) throw new Error(d.message||'Unable to request consultation.');
      setStatus({state:'success',message:`Consultation request received. Reference ${d.reference||d.id}.`}); setBook(initial);
    }catch(err){setStatus({state:'error',message:err.message||'Unable to request consultation.'});}
  };
  return <Layout>
    <section className="contact-hero" style={{backgroundImage:"url(https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2200&q=92)"}}>
      <Sequence><span className="eyebrow">CONTACT · FIRST CONVERSATION</span><h1>Let’s find a time<br/><i>that works.</i></h1><p>No long questionnaire here. Pick a slot and tell us how you would like to meet.</p><div className="contact-hero-line"><span><MapPin size={14}/> Mumbai · Pune · Goa</span><span><Mail size={14}/> hello@ateliernoire.in</span></div></Sequence>
    </section>
    <section className="contact-layout contact-consultation-only">
      <motion.div className="contact-side" initial={{opacity:0,x:-35}} whileInView={{opacity:1,x:0}} viewport={{once:false,amount:.2}} transition={{duration:.8}}>
        <Sequence><div><span>EMAIL</span><a href="mailto:hello@ateliernoire.in">hello@ateliernoire.in</a></div><div><span>PHONE</span><a href="tel:+919876543210">+91 98765 43210</a></div><div><span>STUDIO</span><p>Mumbai · Pune · Goa<br/>India</p></div><div className="contact-note"><p>Already know what you want?</p><a href="/begin-project">Share your project brief <ArrowUpRight size={15}/></a></div></Sequence>
      </motion.div>
      <motion.form className="contact-form booking-form contact-only-form" onSubmit={submit} initial={{opacity:0,x:35}} whileInView={{opacity:1,x:0}} viewport={{once:false,amount:.15}} transition={{duration:.9,delay:.12}}>
        <div className="form-head"><span>01 — FIRST CONVERSATION</span><h2>Let’s find a time that works.</h2><p className="form-intro">No long questionnaire here. Pick a slot and tell us how you would like to meet.</p></div>
        <Sequence className="form-grid"><label>Name*<input value={book.name} onChange={e=>update('name',e.target.value)} required/></label><label>Email*<input type="email" value={book.email} onChange={e=>update('email',e.target.value)} required/></label><label>Phone*<input value={book.phone} onChange={e=>update('phone',e.target.value)} required/></label><label>Conversation mode<select value={book.mode} onChange={e=>update('mode',e.target.value)}><option>Video consultation</option><option>Phone consultation</option><option>Studio visit</option></select></label><label><span className="inline-field"><CalendarDays size={15}/> Preferred date*</span><input type="date" value={book.date} onChange={e=>update('date',e.target.value)} required/></label><label><span className="inline-field"><Clock size={15}/> Preferred time*</span><select value={book.time} onChange={e=>update('time',e.target.value)} required><option value="">Choose a time</option><option>10:00 AM</option><option>12:00 PM</option><option>3:00 PM</option><option>5:00 PM</option></select></label></Sequence>
        {status.state==='success'&&<div className="form-message success"><CheckCircle2/> {status.message}</div>}{status.state==='error'&&<div className="form-message error">{status.message}</div>}
        <button className="pill dark" disabled={status.state==='loading'}>{status.state==='loading'?'Requesting…':'Request consultation'} <Send size={16}/></button>
      </motion.form>
    </section>
  </Layout>;
}
