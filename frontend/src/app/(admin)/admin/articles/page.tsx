"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    PlusCircle, Search, FileText, CheckCircle2, Circle,
    Clock, Pencil, Trash2, Filter, Image as ImageIcon
} from "lucide-react";
import DeleteAction from "@/components/admin/DeleteAction";
import { getApiUrl } from "@/lib/api";


interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    cover_image_url?: string;
    published: boolean;
    created_at: string;
    published_at?: string;
    content: string;
    author?: { name: string; profile_image_url?: string };
    category?: { name: string };
}

function readingTime(content: string) {
    const words = content?.split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(words / 200));
}

export default function AdminArticlesPage() {
    const { data: session } = useSession();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${getApiUrl()}/api/v1/articles`, { cache: "no-store" });
                if (res.ok) setArticles(await res.json());
            } finally { setLoading(false); }
        }
        load();
    }, []);

    const filtered = articles.filter(a => {
        const matchesFilter = filter === "all" || (filter === "published" ? a.published : !a.published);
        const q = search.toLowerCase();
        const matchesSearch = !q || a.title.toLowerCase().includes(q) ||
            a.author?.name.toLowerCase().includes(q) ||
            a.category?.name.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    const counts = {
        all: articles.length,
        published: articles.filter(a => a.published).length,
        draft: articles.filter(a => !a.published).length,
    };

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e2328] tracking-tight">Articles</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Create, edit and manage your clinical blog posts</p>
                </div>
                <Link href="/admin/articles/new"
                    className="flex items-center gap-2 bg-[#7ebac8] hover:bg-[#6aaab8] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                    <PlusCircle className="w-4 h-4" /> Compose Article
                </Link>
            </div>

            {/* Filters + Search bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Tab filters */}
                <div className="flex items-center bg-white border border-black/[0.07] rounded-lg p-1 gap-0.5">
                    {(["all", "published", "draft"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-[12px] font-semibold capitalize transition-colors ${filter === f
                                ? "bg-[#1e2328] text-white shadow-sm"
                                : "text-muted-foreground hover:text-[#333a42]"}`}>
                            {f} <span className="ml-1 text-[10px] opacity-60">({counts[f]})</span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search title, author, category…"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-black/[0.07] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40 placeholder:text-muted-foreground/60"
                    />
                </div>
            </div>

            {/* Articles grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-black/[0.06] overflow-hidden animate-pulse">
                            <div className="h-40 bg-gray-100" />
                            <div className="p-4 space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-1/3" />
                                <div className="h-4 bg-gray-100 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-black/[0.06] p-16 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm font-medium text-[#333a42]">
                        {search ? `No articles match "${search}"` : "No articles yet"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {search ? "Try a different search term" : "Start writing your first clinical blog post"}
                    </p>
                    {!search && (
                        <Link href="/admin/articles/new"
                            className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#7ebac8] hover:underline font-semibold">
                            <PlusCircle className="w-3.5 h-3.5" /> Compose article
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(article => (
                        <div key={article.id}
                            className="bg-white rounded-xl border border-black/[0.06] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col">
                            {/* Cover image */}
                            <div className="h-40 bg-[#f4f1ed] relative overflow-hidden shrink-0">
                                {article.cover_image_url ? (
                                    <img src={article.cover_image_url} alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
                                    </div>
                                )}
                                {/* Status badge */}
                                <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${article.published
                                    ? "bg-emerald-500/90 text-white"
                                    : "bg-amber-400/90 text-amber-900"}`}>
                                    {article.published ? "Published" : "Draft"}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex flex-col flex-1">
                                {article.category && (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7ebac8] mb-1">
                                        {article.category.name}
                                    </span>
                                )}
                                <h3 className="text-[14px] font-bold text-[#1e2328] line-clamp-2 leading-snug mb-2 group-hover:text-[#7ebac8] transition-colors">
                                    {article.title}
                                </h3>
                                {article.excerpt && (
                                    <p className="text-[12px] text-muted-foreground line-clamp-2 mb-3 flex-1">{article.excerpt}</p>
                                )}
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/[0.04]">
                                    <div className="flex items-center gap-2">
                                        {article.author?.profile_image_url ? (
                                            <img src={article.author.profile_image_url} alt={article.author.name}
                                                className="w-5 h-5 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-[#7ebac8]/20 flex items-center justify-center">
                                                <span className="text-[8px] font-bold text-[#7ebac8]">
                                                    {article.author?.name?.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-[11px] text-muted-foreground font-medium">{article.author?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        {readingTime(article.content)} min
                                    </div>
                                </div>
                            </div>

                            {/* Actions bar */}
                            <div className="flex items-center gap-1 px-4 py-2.5 border-t border-black/[0.04] bg-[#fafaf9]">
                                <Link href={`/admin/articles/${article.slug}/edit`}
                                    className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#333a42] hover:text-[#7ebac8] transition-colors py-1">
                                    <Pencil className="w-3 h-3" /> Edit
                                </Link>
                                <span className="w-px h-4 bg-black/[0.06]" />
                                <DeleteAction endpoint={`articles/${article.slug}`} itemName={article.title} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}