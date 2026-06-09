"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    LayoutDashboard, FileText, Users, Tag, Mail,
    Palette, User, LogOut, CalendarCheck, ChevronRight, Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";


interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    exact?: boolean;
    badge?: number;
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [consultationCount, setConsultationCount] = useState(0);

    // Fetch unread consultation count for badge
    useEffect(() => {
        if (session?.user?.role !== "ADMIN") return;
        async function fetchCounts() {
            try {
                const res = await fetch(`${getApiUrl()}/api/v1/consultations/counts`, {
                    headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setConsultationCount((data.new_inquiries || 0) + (data.new_bookings || 0));
                }
            } catch { /* silent */ }
        }
        fetchCounts();
        const interval = setInterval(fetchCounts, 60000);
        return () => clearInterval(interval);
    }, [session]);

    const isAdmin = session?.user?.role === "ADMIN";

    const contentItems: NavItem[] = [
        { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" />, exact: true },
        { label: "Articles", href: "/admin/articles", icon: <FileText className="w-4 h-4" /> },
    ];

    const practiceItems: NavItem[] = [
        { label: "Consultations", href: "/admin/consultations", icon: <CalendarCheck className="w-4 h-4" />, badge: consultationCount },
        { label: "Newsletter", href: "/admin/newsletter", icon: <Mail className="w-4 h-4" /> },
        { label: "AI Insights", href: "/admin/insights", icon: <Sparkles className="w-4 h-4" /> },
    ];

    const adminItems: NavItem[] = [
        { label: "Clinicians", href: "/admin/authors", icon: <Users className="w-4 h-4" /> },
        { label: "Topics", href: "/admin/categories", icon: <Tag className="w-4 h-4" /> },
        { label: "Site Settings", href: "/admin/settings", icon: <Palette className="w-4 h-4" /> },
    ];

    const accountItems: NavItem[] = [
        { label: "My Profile", href: "/admin/profile", icon: <User className="w-4 h-4" /> },
    ];

    const renderItem = (item: NavItem) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
            <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative
                    ${isActive
                        ? "bg-[#7ebac8]/15 text-[#7ebac8] shadow-[inset_2px_0_0_#7ebac8]"
                        : "text-[#8a9ab0] hover:bg-white/[0.06] hover:text-[#c8d6e0]"
                    }`}
            >
                <span className={`shrink-0 ${isActive ? "text-[#7ebac8]" : "text-[#5a6a7a] group-hover:text-[#7ebac8]"} transition-colors`}>
                    {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && item.badge > 0 ? (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                        {item.badge > 99 ? "99+" : item.badge}
                    </span>
                ) : isActive ? (
                    <ChevronRight className="w-3 h-3 text-[#7ebac8] opacity-60" />
                ) : null}
            </Link>
        );
    };

    const renderGroup = (label: string, items: NavItem[]) => (
        <div className="space-y-0.5">
            <p className="px-3 text-[10px] font-semibold text-[#3d4f5f] uppercase tracking-widest mb-1.5">{label}</p>
            {items.map(renderItem)}
        </div>
    );

    return (
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
            {renderGroup("Content", contentItems)}
            {renderGroup("Practice", practiceItems)}
            {isAdmin && renderGroup("Admin", adminItems)}
            {renderGroup("Account", accountItems)}

            {/* Sign out */}
            <div className="pt-2 border-t border-white/[0.05]">
                <Link
                    href="/api/auth/signout"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#5a6a7a] hover:bg-white/[0.06] hover:text-rose-400 transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:text-rose-400 transition-colors" />
                    Sign Out
                </Link>
            </div>
        </nav>
    );
}