"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    LayoutDashboard, FileText, Users, Tag, Mail,
    Palette, User, TrendingUp
} from "lucide-react";


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

    const isAdmin = session?.user?.role === "ADMIN";

    const contentItems: NavItem[] = [
        { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" />, exact: true },
        { label: "Articles",  href: "/admin/articles", icon: <FileText className="w-4 h-4" /> },
    ];

    const practiceItems: NavItem[] = [
        { label: "Newsletter", href: "/admin/newsletter", icon: <Mail className="w-4 h-4" /> },
        { label: "Insights",   href: "/admin/insights",   icon: <TrendingUp className="w-4 h-4" /> },
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
                className={`group flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13.5px] transition-all duration-150 relative
                    ${isActive
                        ? "bg-[#f0f9fb] text-[#7ebac8] font-semibold"
                        : "text-[#5c6670] hover:bg-[#f5f3f0] font-normal"
                    }`}
            >
                <span className={`shrink-0 transition-colors ${isActive ? "text-[#7ebac8]" : "text-[#9aa0a8] group-hover:text-[#5c6670]"}`}>
                    {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && item.badge > 0 ? (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                        {item.badge > 99 ? "99+" : item.badge}
                    </span>
                ) : isActive ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7ebac8]" />
                ) : null}
            </Link>
        );
    };

    const renderGroup = (label: string, items: NavItem[]) => (
        <div className="space-y-0.5">
            <p className="px-3 text-[9px] font-bold text-[#b0b8c1] uppercase tracking-[0.14em] mb-1.5">{label}</p>
            {items.map(renderItem)}
        </div>
    );

    return (
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
            {renderGroup("Content", contentItems)}
            {renderGroup("Practice", practiceItems)}
            {isAdmin && renderGroup("Admin", adminItems)}
            {renderGroup("Account", accountItems)}
        </nav>
    );
}
