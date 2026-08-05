import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0b2420",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;

  return {
    title: "BioLab — Ciência em movimento",
    description: "Plataforma de experiências investigativas para aulas de Ciências e Biologia.",
    applicationName: "BioLab",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: "BioLab",
      statusBarStyle: "black-translucent",
    },
    icons: {
      icon: [{ url: "/icons/biolab-icon.png", sizes: "1256x1256", type: "image/png" }],
      apple: [{ url: "/icons/biolab-icon.png", sizes: "1256x1256", type: "image/png" }],
    },
    openGraph: {
      title: "BioLab — Ciência em movimento",
      description: "150 experiências para investigar, simular, desafiar e construir ciência.",
      type: "website",
      images: [{ url: image, width: 1672, height: 941, alt: "BioLab — Ciência em movimento" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "BioLab — Ciência em movimento",
      description: "150 experiências para investigar, simular, desafiar e construir ciência.",
      images: [image],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
