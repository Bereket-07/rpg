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

                {/* ── Light Sidebar ─────────────────────────────────────────── */}
                <aside className="w-60 shrink-0 bg-white flex flex-col min-h-screen border-r border-[#ede8e0]" style={{ boxShadow: "2px 0 20px rgba(0,0,0,0.04)" }}>
                    {/* Logo area */}
                    <div className="h-16 flex items-center px-5 border-b border-[#f0ebe3] shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7ebac8, #5aabb8)" }}>
                                <span className="text-white font-extrabold text-sm">R</span>
                            </div>
                            <div>
                                <p className="text-[#333a42] font-bold text-[13px] leading-tight">Reframe</p>
                                <p className="text-[#9aa0a8] text-[10px] font-medium tracking-[0.1em] uppercase mt-0.5">Admin</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <AdminSidebar />

                    {/* User area */}
                    <div className="shrink-0 px-4 py-4 border-t border-[#f0ebe3]">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#f0ebe3] flex items-center justify-center shrink-0">
                                <span className="text-[#5c6670] text-xs font-bold">
                                    {session.user?.name?.charAt(0)?.toUpperCase() || "A"}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[#333a42] text-[12.5px] font-semibold truncate leading-tight">{session.user?.name || "Admin"}</p>
                                <p className="text-[#9aa0a8] text-[11px] truncate leading-tight">{session.user?.email}</p>
                            </div>
                        </div>
                        <Link href="/api/auth/signout" className="flex items-center gap-2 text-[12px] text-[#9aa0a8] hover:text-rose-400 transition-colors">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Sign out
                        </Link>
                    </div>
                </aside>

                {/* ── Main Content ─────────────────────────────────────────── */}
                <main className="flex-1 flex flex-col overflow-hidden bg-[#f5f3f0] min-h-screen">
                    {/* Top bar */}
                    <header className="h-16 flex items-center justify-between px-8 border-b border-[#ede8e0] bg-white shrink-0" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
                        <div>
                            <span className="font-bold text-[18px] text-[#333a42]">Dashboard</span>
                            <span className="ml-3 text-[13px] text-[#9aa0a8]">
                                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {session.user?.name?.split(" ")[0] || "Admin"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="flex items-center gap-2 bg-[#f5f3f0] rounded-lg px-3 py-2 w-52">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa0a8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                <span className="text-[13px] text-[#b0b8c1]">Search...</span>
                            </div>
                            {/* Bell */}
                            <div className="relative">
                                <div className="w-9 h-9 rounded-lg bg-[#f5f3f0] flex items-center justify-center cursor-pointer">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5c6670" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                </div>
                                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7ebac8] border-2 border-white" />
                            </div>
                            {/* View Live Site */}
                            <Link href="/" target="_blank"
                                className="flex items-center gap-1.5 bg-[#333a42] hover:bg-[#4a535e] text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition-colors">
                                View Live Site
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
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
