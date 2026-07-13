"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    AlertCircle,
    ArrowRight,
    ArrowUpRight,
    CalendarCheck,
    CheckCircle2,
    Circle,
    Eye,
    FileText,
    Mail,
    Palette,
    PlusCircle,
    Sparkles,
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
            label: "Newsletter Subscribers",
            value: stats.subscribers,
            icon: <Mail className="w-4 h-4" />,
            iconColor: "#7ebac8",
            iconBg: "rgba(126,186,200,0.12)",
            sub: "Active on list",
            href: "/admin/newsletter",
            change: "+12",
            up: true,
        },
        {
            label: "Published Articles",
            value: stats.published,
            icon: <FileText className="w-4 h-4" />,
            iconColor: "#a09080",
            iconBg: "rgba(160,144,128,0.12)",
            sub: `${stats.drafts} draft${stats.drafts !== 1 ? "s" : ""} pending`,
            href: "/admin/articles",
            change: `+${stats.drafts}`,
            up: true,
        },
        {
            label: "Active Clinicians",
            value: stats.authors,
            icon: <Users className="w-4 h-4" />,
            iconColor: "#8ba89e",
            iconBg: "rgba(139,168,158,0.12)",
            sub: "Team members",
            href: "/admin/authors",
            change: null,
            up: null,
        },
        {
            label: "Topics",
            value: stats.categories,
            icon: <Tag className="w-4 h-4" />,
            iconColor: "#6b7f7a",
            iconBg: "rgba(107,127,122,0.12)",
            sub: "Article categories",
            href: "/admin/categories",
            change: null,
            up: null,
        },
    ];

    const quickActions = [
        { label: "New Article",       href: "/admin/articles/new",  icon: <PlusCircle className="w-3.5 h-3.5" /> },
        { label: "Add Clinician",     href: "/admin/authors/new",   icon: <Users className="w-3.5 h-3.5" /> },
        { label: "Send Newsletter",   href: "/admin/newsletter",    icon: <Mail className="w-3.5 h-3.5" /> },
        { label: "Edit Site Content", href: "/admin/settings",      icon: <Palette className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className="max-w-6xl space-y-6">

            {/* Alert banner */}
            {isAdmin && stats.new_consultations > 0 && (
                <Link href="/admin/consultations"
                    className="flex items-center gap-4 bg-rose-50 border border-rose-200 rounded-xl px-5 py-4 hover:bg-rose-100 transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
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

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <Link key={card.label} href={card.href}
                        className="bg-white rounded-[14px] p-5 border border-[#f0ebe3] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group"
                        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                        <div className="flex items-center justify-between mb-3.5">
                            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: card.iconBg, color: card.iconColor }}>
                                {card.icon}
                            </div>
                            {card.up !== null && card.change && (
                                <div className="flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: card.up ? "#4caf7d" : "#e57373" }}>
                                    <ArrowUpRight className="w-3 h-3" />
                                    {card.change}
                                </div>
                            )}
                        </div>
                        <p className="text-[26px] font-extrabold text-[#333a42] leading-none tabular-nums">
                            {loading ? <span className="inline-block w-8 h-6 bg-[#f0ebe3] rounded animate-pulse" /> : card.value}
                        </p>
                        <p className="text-[13px] font-semibold text-[#333a42] mt-1.5">{card.label}</p>
                        <p className="text-[11px] text-[#9aa0a8] mt-0.5">{card.sub}</p>
                    </Link>
                ))}
            </div>

            {/* Main two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Articles — 2/3 */}
                <div className="lg:col-span-2 bg-white rounded-[14px] border border-[#f0ebe3] overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                    <div className="px-5 py-4 border-b border-[#f5f0ea] flex items-center justify-between">
                        <div>
                            <p className="text-[14px] font-bold text-[#333a42]">Recent Articles</p>
                            <p className="text-[11.5px] text-[#9aa0a8] mt-0.5">Latest blog posts</p>
                        </div>
                        <Link href="/admin/articles" className="text-[12px] text-[#7ebac8] font-semibold flex items-center gap-1 hover:underline">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-[#f5f0ea]">
                        {loading ? (
                            <div className="p-8 text-center text-sm text-[#9aa0a8]">Loading...</div>
                        ) : recent.length === 0 ? (
                            <div className="p-8 text-center">
                                <FileText className="w-8 h-8 text-[#9aa0a8]/30 mx-auto mb-2" />
                                <p className="text-sm text-[#9aa0a8]">No articles yet.</p>
                                <Link href="/admin/articles/new" className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#7ebac8] hover:underline font-medium">
                                    <PlusCircle className="w-3.5 h-3.5" /> Write your first article
                                </Link>
                            </div>
                        ) : (
                            recent.map((article) => (
                                <Link key={article.id} href={`/admin/articles/${article.slug}/edit`}
                                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#faf8f5] transition-colors group">
                                    <div className="shrink-0">
                                        {article.published
                                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            : <Circle className="w-4 h-4 text-amber-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-[#333a42] truncate group-hover:text-[#7ebac8] transition-colors">
                                            {article.title}
                                        </p>
                                        <p className="text-[11px] text-[#9aa0a8]">
                                            {article.author?.name}{article.category?.name ? ` · ${article.category.name}` : ""} · {new Date(article.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${article.published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                        {article.published ? "Published" : "Draft"}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Right column — 1/3 */}
                <div className="flex flex-col gap-5">

                    {/* Clinicians card */}
                    <div className="bg-white rounded-[14px] border border-[#f0ebe3] p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[14px] font-bold text-[#333a42]">Clinicians</p>
                            <Link href="/admin/authors" className="text-[11px] text-[#7ebac8] font-semibold hover:underline">Manage</Link>
                        </div>
                        {loading ? (
                            <div className="space-y-3">
                                {[1,2,3].map(i => <div key={i} className="h-9 bg-[#f5f3f0] rounded-lg animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {["#7ebac8","#a09080","#8ba89e"].slice(0, Math.max(stats.authors, 1)).map((color, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                            style={{ background: color + "22", color }}>
                                            <Users className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="h-2.5 bg-[#f0ebe3] rounded-full flex-1 animate-pulse" />
                                    </div>
                                ))}
                                <Link href="/admin/authors" className="flex items-center gap-2 mt-1 text-[12px] text-[#9aa0a8] hover:text-[#7ebac8] transition-colors">
                                    <span>{stats.authors} active clinician{stats.authors !== 1 ? "s" : ""}</span>
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick actions dark card */}
                    <div className="rounded-[14px] p-5" style={{ background: "linear-gradient(135deg, #333a42, #4a535e)", boxShadow: "0 4px 20px rgba(51,58,66,0.2)" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-[#7ebac8]" />
                            <p className="text-[13px] font-bold text-white">Quick Actions</p>
                        </div>
                        <div className="space-y-2">
                            {quickActions.map((action) => (
                                <Link key={action.label} href={action.href}
                                    className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-[12.5px] text-white font-medium hover:bg-white/10 transition-colors"
                                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                    <span className="flex items-center gap-2">{action.icon}{action.label}</span>
                                    <ArrowRight className="w-3 h-3 opacity-40" />
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
