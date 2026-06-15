"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    AlertCircle,
    ArrowRight,
    CalendarCheck,
    CheckCircle2,
    Circle,
    Eye,
    FileText,
    Mail,
    Palette,
    PlusCircle,
    Tag,
    Users,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface Stats {
    published: number;
    drafts: number;
    authors: number;
    categories: number;
    subscribers: number;
    new_consultations: number;
}

interface RecentArticle {
    id: number;
    title: string;
    slug: string;
    published: boolean;
    created_at: string;
    author?: { name: string };
    category?: { name: string };
}

interface BookingPriority {
    id: number;
    first_name: string;
    last_name: string;
    requested_date: string;
    requested_time: string;
    presenting_concern?: string;
    urgency?: string;
    status: string;
    submitted_at: string;
}

interface InquiryPriority {
    id: number;
    first_name: string;
    last_name: string;
    subject?: string;
    status: string;
    submitted_at: string;
}

export default function AdminDashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<Stats>({
        published: 0,
        drafts: 0,
        authors: 0,
        categories: 0,
        subscribers: 0,
        new_consultations: 0,
    });
    const [recent, setRecent] = useState<RecentArticle[]>([]);
    const [priorityBookings, setPriorityBookings] = useState<BookingPriority[]>([]);
    const [priorityInquiries, setPriorityInquiries] = useState<InquiryPriority[]>([]);
    const [loading, setLoading] = useState(true);

    const token = (session as any)?.accessToken;
    const isAdmin = session?.user?.role === "ADMIN";

    useEffect(() => {
        if (!session) return;

        async function fetchDashboard() {
            try {
                const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
                const [articlesRes, authorsRes, catsRes, newsletterRes, consultRes] = await Promise.allSettled([
                    fetch(`${getApiUrl()}/api/v1/articles`, { cache: "no-store" }),
                    isAdmin ? fetch(`${getApiUrl()}/api/v1/users/authors`, { headers }) : Promise.resolve(null),
                    fetch(`${getApiUrl()}/api/v1/categories`),
                    isAdmin ? fetch(`${getApiUrl()}/api/v1/newsletter`, { headers }) : Promise.resolve(null),
                    isAdmin ? fetch(`${getApiUrl()}/api/v1/consultations/counts`, { headers }) : Promise.resolve(null),
                ]);

                let articles: RecentArticle[] = [];
                let published = 0;
                let drafts = 0;
                if (articlesRes.status === "fulfilled" && articlesRes.value.ok) {
                    articles = await articlesRes.value.json();
                    published = articles.filter((article) => article.published).length;
                    drafts = articles.filter((article) => !article.published).length;
                    setRecent(articles.slice(0, 6));
                }

                let authors = 0;
                if (authorsRes.status === "fulfilled" && authorsRes.value && authorsRes.value.ok) {
                    const data = await authorsRes.value.json();
                    authors = data.length;
                }

                let categories = 0;
                if (catsRes.status === "fulfilled" && catsRes.value.ok) {
                    const data = await catsRes.value.json();
                    categories = data.length;
                }

                let subscribers = 0;
                if (newsletterRes.status === "fulfilled" && newsletterRes.value && newsletterRes.value.ok) {
                    const data = await newsletterRes.value.json();
                    subscribers = data.filter((subscriber: any) => subscriber.is_active).length;
                }

                let new_consultations = 0;
                if (consultRes.status === "fulfilled" && consultRes.value && consultRes.value.ok) {
                    const data = await consultRes.value.json();
                    new_consultations = (data.new_inquiries || 0) + (data.new_bookings || 0);
                }

                if (isAdmin) {
                    const [bookingsRes, inquiriesRes] = await Promise.all([
                        fetch(`${getApiUrl()}/api/v1/consultations/bookings`, { headers }),
                        fetch(`${getApiUrl()}/api/v1/consultations/inquiries`, { headers }),
                    ]);
                    if (bookingsRes.ok) {
                        const data: BookingPriority[] = await bookingsRes.json();
                        setPriorityBookings(
                            data
                                .filter((item) => !["confirmed", "declined", "completed"].includes(item.status))
                                .sort((a, b) => {
                                    const urgentA = (a.urgency || "").toLowerCase().includes("soon") ? 0 : 1;
                                    const urgentB = (b.urgency || "").toLowerCase().includes("soon") ? 0 : 1;
                                    return urgentA - urgentB || new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
                                })
                                .slice(0, 4)
                        );
                    }
                    if (inquiriesRes.ok) {
                        const data: InquiryPriority[] = await inquiriesRes.json();
                        setPriorityInquiries(data.filter((item) => item.status === "new").slice(0, 3));
                    }
                }

                setStats({ published, drafts, authors, categories, subscribers, new_consultations });
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, [session, token, isAdmin]);

    const statCards = [
        {
            label: "Published Articles",
            value: stats.published,
            icon: <FileText className="w-5 h-5" />,
            color: "text-[#7ebac8]",
            bg: "bg-[#7ebac8]/10",
            sub: `${stats.drafts} draft${stats.drafts !== 1 ? "s" : ""} pending`,
            href: "/admin/articles",
            primary: true,
        },
        {
            label: "Active Subscribers",
            value: stats.subscribers,
            icon: <Mail className="w-5 h-5" />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            sub: "Newsletter list",
            href: "/admin/newsletter",
        },
        {
            label: "Clinicians",
            value: stats.authors,
            icon: <Users className="w-5 h-5" />,
            color: "text-violet-600",
            bg: "bg-violet-50",
            sub: "Active accounts",
            href: "/admin/authors",
        },
        {
            label: "Topics",
            value: stats.categories,
            icon: <Tag className="w-5 h-5" />,
            color: "text-amber-600",
            bg: "bg-amber-50",
            sub: "Article categories",
            href: "/admin/categories",
        },
    ];

    const quickActions = [
        { label: "Write Article", icon: <PlusCircle className="w-4 h-4" />, href: "/admin/articles/new", color: "bg-[#7ebac8] hover:bg-[#6aaab8] text-white" },
        { label: "View Site", icon: <Eye className="w-4 h-4" />, href: "/", color: "bg-white hover:bg-gray-50 text-[#333a42] border border-black/10" },
        { label: "Open CMS", icon: <Palette className="w-4 h-4" />, href: "/admin/settings", color: "bg-white hover:bg-gray-50 text-[#333a42] border border-black/10" },
        {
            label: isAdmin ? "Consultations" : "My Requests",
            icon: <CalendarCheck className="w-4 h-4" />,
            href: isAdmin ? "/admin/consultations" : "/admin/my-requests",
            color: "bg-white hover:bg-gray-50 text-[#333a42] border border-black/10",
        },
    ];

    return (
        <div className="space-y-8 max-w-6xl">
            <div>
                <h1 className="text-2xl font-bold text-[#1e2328] tracking-tight">
                    Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
                    {session?.user?.name?.split(" ")[0] || "Admin"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Here is what needs attention today.</p>
            </div>

            {isAdmin && stats.new_consultations > 0 && (
                <Link
                    href="/admin/consultations"
                    className="flex items-center gap-4 bg-rose-50 border border-rose-200 rounded-xl px-5 py-4 hover:bg-rose-100 transition-colors group"
                >
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4.5 h-4.5 text-rose-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-rose-700">
                            {stats.new_consultations} new {stats.new_consultations === 1 ? "consultation request" : "consultation requests"} waiting
                        </p>
                        <p className="text-xs text-rose-500">Review and respond to incoming client inquiries and bookings</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                </Link>
            )}

            {isAdmin && (priorityBookings.length > 0 || priorityInquiries.length > 0) && (
                <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
                    <div className="px-5 py-4 border-b border-black/[0.04] flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Practice Priorities</p>
                            <p className="text-sm text-[#333a42] mt-0.5">Open client requests that need the next action</p>
                        </div>
                        <Link href="/admin/consultations" className="text-[12px] text-[#7ebac8] hover:underline font-medium flex items-center gap-1 shrink-0">
                            Open workflow <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-black/[0.04]">
                        {priorityBookings.map((booking) => (
                            <Link key={`booking-${booking.id}`} href="/admin/consultations" className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f7f5f2] transition-colors">
                                <CalendarCheck className="w-4 h-4 text-[#7ebac8] shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-[#333a42] truncate">{booking.first_name} {booking.last_name}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">
                                        {booking.requested_date} at {booking.requested_time}
                                        {booking.presenting_concern && ` - ${booking.presenting_concern}`}
                                    </p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${(booking.urgency || "").toLowerCase().includes("soon") ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>
                                    {booking.urgency || "Open"}
                                </span>
                            </Link>
                        ))}
                        {priorityInquiries.map((inquiry) => (
                            <Link key={`inquiry-${inquiry.id}`} href="/admin/consultations" className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f7f5f2] transition-colors">
                                <Mail className="w-4 h-4 text-rose-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-[#333a42] truncate">{inquiry.first_name} {inquiry.last_name}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{inquiry.subject || "General inquiry"}</p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-rose-50 text-rose-700">New inquiry</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <Link
                        key={card.label}
                        href={card.href}
                        className={`bg-white rounded-xl border border-black/[0.06] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group ${card.primary ? "ring-1 ring-[#7ebac8]/30" : ""}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                                {card.icon}
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-[#7ebac8] group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className={`text-3xl font-bold ${card.color} tabular-nums`}>
                            {loading ? <span className="inline-block w-8 h-7 bg-gray-100 rounded animate-pulse" /> : card.value}
                        </p>
                        <p className="text-[13px] font-semibold text-[#333a42] mt-1">{card.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{card.sub}</p>
                    </Link>
                ))}
            </div>

            <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Quick Actions</p>
                <div className="flex flex-wrap gap-2.5">
                    {quickActions.map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${action.color} shadow-sm`}
                        >
                            {action.icon} {action.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Recent Articles</p>
                    <Link href="/admin/articles" className="text-[12px] text-[#7ebac8] hover:underline font-medium flex items-center gap-1">
                        View all <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="bg-white rounded-xl border border-black/[0.06] divide-y divide-black/[0.04] overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : recent.length === 0 ? (
                        <div className="p-8 text-center">
                            <FileText className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No articles yet. Ready to start writing?</p>
                            <Link href="/admin/articles/new" className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#7ebac8] hover:underline font-medium">
                                <PlusCircle className="w-3.5 h-3.5" /> Compose your first article
                            </Link>
                        </div>
                    ) : (
                        recent.map((article) => (
                            <Link
                                key={article.id}
                                href={`/admin/articles/${article.slug}/edit`}
                                className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f7f5f2] transition-colors group"
                            >
                                <div className="shrink-0">
                                    {article.published
                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        : <Circle className="w-4 h-4 text-amber-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-[#333a42] truncate group-hover:text-[#7ebac8] transition-colors">
                                        {article.title}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {article.author?.name} - {article.category?.name} - {new Date(article.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                </div>
                                <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${article.published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                    {article.published ? "Published" : "Draft"}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-[#7ebac8] group-hover:translate-x-0.5 transition-all shrink-0" />
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
