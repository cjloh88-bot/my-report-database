"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAction } from "@/app/auth/actions";
import type { CurrentProfile } from "@/lib/auth";

const baseLinks = [["/", "Dashboard"], ["/projects", "Projects"], ["/reports", "Reports"], ["/activity", "Activity"]];
const linkIcons: Record<string, string> = { "/": "⌂", "/projects": "▦", "/reports": "▤", "/review": "✓", "/activity": "↺", "/admin": "⚙" };

export function Sidebar({ email, profile }: { email: string | null; profile: CurrentProfile | null }) {
  const path = usePathname(); const [open, setOpen] = useState(false);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, []);
  useEffect(() => { document.body.classList.toggle("nav-open", open); return () => document.body.classList.remove("nav-open"); }, [open]);
  if (path === "/login" || path === "/signup" || path.startsWith("/auth/")) return null;
  const links = profile?.role === "admin" ? [...baseLinks.slice(0, 3), ["/review", "Review queue"], baseLinks[3], ["/admin", "User access"]] : profile?.role === "manager" ? [...baseLinks.slice(0, 3), ["/review", "Review queue"], baseLinks[3]] : baseLinks;
  const mobileLinks = profile?.role === "admin" ? links.filter(([href]) => href !== "/activity") : links;
  const active = (href: string) => href === "/" ? path === href : path.startsWith(href);
  return <>
    <header className="mobile-header"><Link href="/" className="mobile-brand"><span className="brand-mark">R</span><strong>ReportBase</strong></Link><button className="menu-button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(!open)}><span>{open ? "×" : "☰"}</span><small>Menu</small></button></header>
    {open && <button className="nav-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)}/>}
    <aside id="primary-nav" className={open ? "sidebar open" : "sidebar"}>
      <div className="brand"><span className="brand-mark">R</span><span>ReportBase<small>Engineering control room</small></span></div>
      <nav aria-label="Primary navigation">{links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={active(href) ? "active" : ""}><span aria-hidden="true">{linkIcons[href]}</span>{label}</Link>)}</nav>
      <div className="account-card"><span className="role-pill">{profile?.role || "engineer"}</span><strong>{profile?.display_name || "User"}</strong><small>{email}</small><form action={signOutAction}><button type="submit">Sign out</button></form></div>
    </aside>
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">{mobileLinks.map(([href, label]) => <Link key={href} href={href} className={active(href) ? "active" : ""}><span aria-hidden="true">{linkIcons[href]}</span><small>{label.replace(" queue", "").replace("User access", "Users")}</small></Link>)}</nav>
  </>;
}
