import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";


const merriweather = localFont({
  src: [
    {
      path: "../../public/assets/Merriweather/Merriweather-VariableFont_opsz,wdth,wght.ttf",
      style: "normal",
    },
    {
      path: "../../public/assets/Merriweather/Merriweather-Italic-VariableFont_opsz,wdth,wght.ttf",
      style: "italic",
    }
  ],
  variable: "--font-merriweather",
});

const raleway = localFont({
  src: [
    {
      path: "../../public/assets/Raleway/Raleway-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "../../public/assets/Raleway/Raleway-Italic-VariableFont_wght.ttf",
      style: "italic",
    }
  ],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "Reframe Psychology Group",
  description: "High-performance platform that modernizes client conversion and automates content marketing.",
};

function hexToHsl(hex: string): string {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

async function getSiteSettings() {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/settings/settings`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch site settings from FastAPI:", err);
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  const primaryColor = settings?.primary_color || "#7ebac8";
  const backgroundColor = settings?.background_color || "#FDF8F5";
  const secondaryColor = settings?.secondary_color || "#4a535e";
  const textColor = settings?.text_color || "#4a535e";
  const fontSans = settings?.font_sans || "Raleway";
  const fontSerif = settings?.font_serif || "Merriweather";

  const primaryHsl = hexToHsl(primaryColor);
  const backgroundHsl = hexToHsl(backgroundColor);
  const secondaryHsl = hexToHsl(secondaryColor);
  const textHsl = hexToHsl(textColor);

  // If using default local fonts, don't generate google link
  const loadGoogleFonts = fontSans !== "Raleway" || fontSerif !== "Merriweather";
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontSans.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800&family=${fontSerif.replace(/\s+/g, "+")}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap`;

  return (
    <html lang="en">
      <head>
        {loadGoogleFonts && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href={googleFontsUrl} rel="stylesheet" />
          </>
        )}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${primaryHsl} !important;
            --background: ${backgroundHsl} !important;
            --secondary: ${secondaryHsl} !important;
            --foreground: ${textHsl} !important;
          }
          body, .font-sans {
            font-family: '${fontSans}', sans-serif !important;
          }
          .font-serif {
            font-family: '${fontSerif}', serif !important;
          }
        ` }} />
      </head>
      <body className={`${raleway.variable} ${merriweather.variable} font-sans antialiased text-foreground bg-background min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
