import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const themeInitScript = `(() => {
  const storageKey = "theme-preference";
  const root = document.documentElement;
  const stored = localStorage.getItem(storageKey);
  const mode = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Bus Time",
  title: "Bus Time",
  description: "Real-time bus arrival tracking for Oakville Transit",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bus Time",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="/favicon-light.ico"
          type="image/x-icon"
          media="(prefers-color-scheme: light)"
          data-app-favicon="light"
        />
        <link
          rel="icon"
          href="/favicon-dark.ico"
          type="image/x-icon"
          media="(prefers-color-scheme: dark)"
          data-app-favicon="dark"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
