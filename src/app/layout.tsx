import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_URL = "https://flowwled.com";
const SITE_NAME = "Flowwled";
const SITE_DESCRIPTION =
  "AI-powered financial cockpit for solo founders and freelancers. Track runway, analyze expenses with AI verdicts, simulate what-if scenarios, and never overspend again. Free forever.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Flowwled — AI-Powered Financial Cockpit for Founders",
    template: "%s | Flowwled",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "AI CFO",
    "startup finance",
    "runway tracker",
    "expense analyzer",
    "founder tools",
    "freelancer finance",
    "cash flow management",
    "burn rate calculator",
    "AI expense analysis",
    "what-if financial simulator",
    "bootstrap startup tools",
    "solo founder finance",
    "business runway calculator",
    "smart expense tracker",
  ],
  authors: [{ name: "Flowwled", url: SITE_URL }],
  creator: "Flowwled",
  publisher: "Flowwled",
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Flowwled — AI-Powered Financial Cockpit for Founders",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Flowwled — AI Financial Cockpit Dashboard",
        type: "image/png",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Flowwled — AI-Powered Financial Cockpit for Founders",
    description:
      "Stop guessing. Let AI analyze every expense, track your runway in real-time, and simulate any scenario before you spend.",
    images: ["/brand/og-image.png"],
    creator: "@flowwled",
  },

  // Icons
  icons: {
    icon: [
      { url: "/brand/logo-icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/brand/logo-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification (add your codes when ready)
  // verification: {
  //   google: "your-google-verification-code",
  // },

  // Alternate languages
  alternates: {
    canonical: SITE_URL,
  },

  // Category
  category: "Finance",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-neutral-100 text-black min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
