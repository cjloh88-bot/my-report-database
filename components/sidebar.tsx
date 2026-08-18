"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [["/", "Dashboard"], ["/projects", "Projects"], ["/reports", "Reports"], ["/review", "Review queue"]];

export function Sidebar() {
  const path = usePathname(); const [open, setOpen] = useState(false);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, []);
  return <>
    <button className="menu-button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(!open)}>☰ <span>Menu</span></button>
    <aside id="primary-nav" className={open ? "sidebar open" : "sidebar"}>
      <div className="brand"><span className="brand-mark">R</span><span>ReportBase<small>Engineering control room</small></span></div>
      <nav aria-label="Primary navigation">{links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={(href === "/" ? path === href : path.startsWith(href)) ? "active" : ""}>{label}</Link>)}</nav>
      <div className="demo-note"><span className="pulse" /> Open demo<br/><small>No login required</small></div>
    </aside>
  </>;
}
