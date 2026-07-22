import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "LOOP — Customer feedback intelligence", description: "Understand every customer signal." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body>{children}</body></html>; }
