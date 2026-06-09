import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AuthProvider from "@/components/admin/AuthProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

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
        console.error("Failed to fetch site settings in AdminLayout:", err);
        return null;
    }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    if (session.user?.must_change_password) {
        redirect("/change-password");
    }

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

    const loadGoogleFonts = fontSans !== "Raleway" || fontSerif !== "Merriweather";
    const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontSans.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800&family=${fontSerif.replace(/\s+/g, "+")}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap`;

    return (
        <AuthProvider>
            <div className="flex min-h-screen dynamic-theme-container" style={{ fontFamily: `'${fontSans}', sans-serif` }}>
                {loadGoogleFonts && (
                    <>
                        <link rel="preconnect" href="https://fonts.googleapis.com" />
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                        <link href={googleFontsUrl} rel="stylesheet" />
                    </>
                )}
                <style dangerouslySetInnerHTML={{ __html: `
                    .dynamic-theme-container {
                        --primary: ${primaryHsl} !important;
                        --background: ${backgroundHsl} !important;
                        --secondary: ${secondaryHsl} !important;
                        --foreground: ${textHsl} !important;
                    }
                    .dynamic-theme-container h1,
                    .dynamic-theme-container h2,
                    .dynamic-theme-container h3,
                    .dynamic-theme-container .font-serif {
                        font-family: '${fontSerif}', serif !important;
                    }
                ` }} />

                {/* ── Dark Sidebar ─────────────────────────────────────────── */}
                <aside className="w-60 shrink-0 bg-[#1e2328] flex flex-col min-h-screen border-r border-white/[0.04]">
                    {/* Logo area */}
                    <div className="h-16 flex items-center px-5 border-b border-white/[0.06] shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#7ebac8]/20 flex items-center justify-center">
                                <span className="text-[#7ebac8] font-bold text-sm">R</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold text-[13px] leading-tight tracking-tight">Reframe</p>
                                <p className="text-[#4a6070] text-[10px] font-medium tracking-widest uppercase">Admin</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <AdminSidebar />

                    {/* User pill */}
                    <div className="shrink-0 px-3 py-3 border-t border-white/[0.06]">
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.04]">
                            <div className="w-7 h-7 rounded-full bg-[#7ebac8]/25 flex items-center justify-center shrink-0">
                                <span className="text-[#7ebac8] text-xs font-bold">
                                    {session.user?.name?.charAt(0)?.toUpperCase() || "A"}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[#c8d6e0] text-[12px] font-semibold truncate leading-tight">{session.user?.name || "Admin"}</p>
                                <p className="text-[#3d4f5f] text-[10px] truncate leading-tight">{session.user?.email}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── Main Content ─────────────────────────────────────────── */}
                <main className="flex-1 flex flex-col overflow-hidden bg-[#f4f1ed] min-h-screen">
                    {/* Top bar */}
                    <header className="h-16 flex items-center justify-between px-8 border-b border-black/[0.06] bg-white shrink-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium text-[#333a42]">Reframe Psychology</span>
                            <span className="text-black/20">›</span>
                            <span className="text-[#7ebac8] font-semibold capitalize">Admin</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/" target="_blank"
                                className="text-[12px] text-muted-foreground hover:text-[#7ebac8] transition-colors font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                View Live Site
                            </Link>
                        </div>
                    </header>
                    <div className="flex-1 overflow-auto p-6 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </AuthProvider>
    );
}
