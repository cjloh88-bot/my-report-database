import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "ReportBase — Engineering reporting",
  description: "Submit, review, approve, and track engineering project reports.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  return (
    <html lang="en">
      <body><Sidebar email={user?.email ?? null} profile={profile}/><main className="app-main">{children}</main></body>
    </html>
  );
}
