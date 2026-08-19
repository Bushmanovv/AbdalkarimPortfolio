import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";

import { AppShell } from "@/components/layout/AppShell";
import { profile } from "@/data/profile";
import { asset, basePath } from "@/lib/site";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteDescription =
  "Software & AI Engineer and Computer Engineering graduate building AI applications, backend systems, embedded ML and hardware-integrated software.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.website),
  title: {
    default: `${profile.name} | ${profile.primaryTitle}`,
    template: `%s | ${profile.name}`,
  },
  description: siteDescription,
  applicationName: `${profile.name} — Portfolio`,
  authors: [{ name: profile.name, url: profile.website }],
  creator: profile.name,
  keywords: [
    "Software Engineer",
    "AI Engineer",
    "Machine Learning",
    "Computer Engineering",
    "Embedded Systems",
    "Embedded Linux",
    "Digital Verification",
    "SystemVerilog",
    "UVM",
    "Computer Vision",
    "NLP",
    "Generative AI",
    "RAG",
    "Signal Processing",
    "Birzeit University",
    "Ramallah",
    profile.name,
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: profile.website,
    siteName: `${profile.name} — ${profile.primaryTitle}`,
    title: `${profile.name} | ${profile.primaryTitle}`,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} | ${profile.primaryTitle}`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: asset("/icon.svg"), type: "image/svg+xml" }],
    apple: [{ url: asset("/icon.svg") }],
  },
};

export const viewport: Viewport = {
  themeColor: "#080b0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/** JSON-LD Person schema. Only fields backed by real data are emitted. */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.primaryTitle,
  description: profile.positioning,
  email: `mailto:${profile.email}`,
  url: profile.website,
  sameAs: [profile.github, profile.linkedin],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ramallah",
    addressCountry: "PS",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: profile.university,
  },
  knowsAbout: [
    "Artificial Intelligence",
    "Machine Learning",
    "Software Engineering",
    "Backend Engineering",
    "Computer Vision",
    "Natural Language Processing",
    "Generative AI",
    "Embedded Systems",
    "Embedded Linux",
    "Digital Verification",
    "Signal Processing",
  ],
  knowsLanguage: [
    { "@type": "Language", name: "Arabic" },
    { "@type": "Language", name: "Russian" },
    { "@type": "Language", name: "English" },
    { "@type": "Language", name: "German" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${jetbrainsMono.variable}`}
      // The pre-paint boot script adds a `booting` class to this element
      // before React hydrates, so the server and client class lists differ by
      // design. Scoped to <html>'s own attributes; children still reconcile.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint, so the server-rendered page never flashes
            in the moment before React hydrates and mounts the boot overlay.
            Decides synchronously whether this visit boots, and if so paints a
            cover (see `html.booting::before` in globals.css) that the overlay
            then draws on top of.

            The base path has to be stripped before comparing. `usePathname()`
            removes it for React, but this script sees the raw URL — and under
            a sub-path deployment the home page is `/<base>/`, not `/`, so a
            bare `=== "/"` test silently never matches. The symptom is the one
            this script exists to prevent: the page renders, then the boot
            sequence drops over it once hydration lands.

            Gated on the home path because BootOverlay only renders there —
            without that check, landing directly on a shared /projects link
            would sit behind a black screen until the failsafe fired. The
            timeout is that failsafe: if hydration never happens, the page
            still becomes visible rather than staying blank forever. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
var d=document.documentElement;
var b=${JSON.stringify(basePath)};
var p=location.pathname;
if(b&&p.indexOf(b)===0)p=p.slice(b.length);
if((p===''||p==='/')&&!sessionStorage.getItem('portfolio:booted')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
d.classList.add('booting');
setTimeout(function(){d.classList.remove('booting')},6000);
}}catch(e){}})();`,
          }}
        />
        {/* Scroll-reveal elements ship with Framer Motion's `initial` styles
            inlined by SSR. Without JS they would never animate in, leaving
            content invisible — so pin them to their resting state instead. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="bg-bg text-fg antialiased">
        <script
          type="application/ld+json"
          // Static, developer-authored object — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
