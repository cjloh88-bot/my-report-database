import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "ReportBase — Engineering reporting",
  description: "Submit, review, approve, and track engineering project reports.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><Sidebar/><main className="app-main">{children}</main></body>
    </html>
  );
}
