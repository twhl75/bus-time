import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const themeInitScript = `(() => {
  const storageKey = "theme-preference";
  const root = document.documentElement;
  const syncFavicons = (theme) => {
    const darkFavicon = document.querySelector('link[rel="icon"][data-app-favicon="dark"]');
    const lightFavicon = document.querySelector('link[rel="icon"][data-app-favicon="light"]');

    if (!darkFavicon || !lightFavicon) {
      return;
    }

    if (theme === "dark") {
      darkFavicon.media = "all";
      lightFavicon.media = "not all";
      return;
    }

    if (theme === "light") {
      darkFavicon.media = "not all";
      lightFavicon.media = "all";
      return;
    }

    darkFavicon.media = "(prefers-color-scheme: dark)";
    lightFavicon.media = "(prefers-color-scheme: light)";
  };
  const stored = localStorage.getItem(storageKey);
  const theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const isDark = theme === "dark" || (theme === "system" && media.matches);
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  syncFavicons(theme);
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
  title: "Oakville Bus Tracker",
  description: "Real-time bus arrival tracking for Oakville Transit",
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
