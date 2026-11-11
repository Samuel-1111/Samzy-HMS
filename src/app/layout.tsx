import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Samzy HMS | Hospital Operations", description: "A secure, configurable hospital management platform by Samzy Technology.", applicationName: "Samzy HMS", robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
