import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "ReportBase — Engineering reporting",
  description: "Submit, review, approve, and track engineering project reports.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#12251f" };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  const assistantOwner = Boolean(user?.email && user.email.toLowerCase() === (process.env.ASSISTANT_OWNER_EMAIL || "cjloh88ai@gmail.com").trim().toLowerCase());
  return (
    <html lang="en">
      <body><Sidebar email={user?.email ?? null} profile={profile} assistantOwner={assistantOwner}/><main className="app-main">{children}</main></body>
    </html>
  );
}
