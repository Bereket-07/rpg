"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2, Users, Globe, FileText } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import { getApiUrl } from "@/lib/api";

function toSlug(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const inputCls = "w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40 bg-white text-[#333a42] placeholder:text-muted-foreground/60";
const labelCls = "block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5";

export default function ComposeArticlePage() {
    const router = useRouter();
    const { data: session } = useSession();

    const [authors, setAuthors]         = useState<any[]>([]);
    const [categories, setCategories]   = useState<any[]>([]);
    const [subscribers, setSubscribers] = useState(0);

    const [title, setTitle]             = useState("");
    const [slug, setSlug]               = useState("");
    const [slugManual, setSlugManual]   = useState(false);
    const [excerpt, setExcerpt]         = useState("");
    const [content, setContent]         = useState("");
    const [authorId, setAuthorId]       = useState("");
    const [categoryId, setCategoryId]   = useState("");
    const [coverImageUrl, setCoverImageUrl]   = useState("");
    const [metaTitle, setMetaTitle]           = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [focusKeyword, setFocusKeyword]     = useState("");

    const [saving, setSaving]     = useState(false);
    const [saveMode, setSaveMode] = useState<"draft" | "publish">("draft");
    const [error, setError]       = useState("");

    // Auto-slug from title
    useEffect(() => {
        if (!slugManual && title) setSlug(toSlug(title));
    }, [title, slugManual]);

    // Auto-populate SEO meta title
    useEffect(() => {
        if (!metaTitle && title) setMetaTitle(title.slice(0, 60));
    }, [title]);

    useEffect(() => {
        const token = (session as any)?.accessToken;
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        async function load() {
            const [authRes, catRes, nlRes] = await Promise.allSettled([
                fetch(`${getApiUrl()}/api/v1/authors`),
                fetch(`${getApiUrl()}/api/v1/categories`),
                fetch(`${getApiUrl()}/api/v1/newsletter`, { headers }),
            ]);
            if (authRes.status === "fulfilled" && authRes.value.ok) setAuthors(await authRes.value.json());
            if (catRes.status === "fulfilled" && catRes.value.ok) setCategories(await catRes.value.json());
            if (nlRes.status === "fulfilled" && nlRes.value?.ok) {
                const subs = await nlRes.value.json();
                setSubscribers(subs.filter((s: any) => s.is_active).length);
            }
        }
        load();
    }, [session]);

    async function handleSubmit(publishNow: boolean) {
        if (!title.trim() || !content.trim() || !authorId || !categoryId) {
            setError("Please fill in title, content, author and category.");
            return;
        }
        setSaveMode(publishNow ? "publish" : "draft");
        setSaving(true);
        setError("");
        const payload = {
            title, slug, content, excerpt,
            cover_image_url: coverImageUrl || undefined,
            published: publishNow,
            author_id: parseInt(authorId),
            category_id: parseInt(categoryId),
            seo_meta: { meta_title: metaTitle, meta_description: metaDescription, focus_keyword: focusKeyword },
        };
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/articles`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) { router.push("/admin/articles"); router.refresh(); }
            else {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || "Failed to create article.");
            }
        } catch { setError("Could not connect to the server."); }
        finally { setSaving(false); }
    }

    return (
        <div className="max-w-6xl pb-20">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/admin/articles"
                        className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-[#333a42] font-medium transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Articles
                    </Link>
                    <span className="text-black/20">›</span>
                    <span className="text-[12px] font-semibold text-[#333a42]">New Article</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleSubmit(false)} disabled={saving}
                        className="flex items-center gap-2 bg-white border border-black/[0.1] hover:border-black/20 text-[#333a42] px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
                        {saving && saveMode === "draft" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                        Save Draft
                    </button>
                    <button onClick={() => handleSubmit(true)} disabled={saving}
                        className="flex items-center gap-2 bg-[#1e2328] hover:bg-[#2d3540] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shadow-sm">
                        {saving && saveMode === "publish" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                        Publish
                    </button>
                </div>
            </div>

            {/* Title block */}
            <div className="bg-white rounded-xl border border-black/[0.06] px-6 py-5 mb-5">
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Article title…"
                    className="w-full text-[26px] font-bold text-[#1e2328] placeholder:text-muted-foreground/25 bg-transparent border-none outline-none leading-tight"
                />
                <div className="flex items-center gap-1.5 mt-2.5">
                    <span className="text-[11px] text-muted-foreground font-mono">/blog/</span>
                    <input
                        value={slug}
                        onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                        placeholder="url-slug"
                        className="text-[11px] font-mono text-[#7ebac8] bg-transparent border-none outline-none flex-1 min-w-0"
                    />
                    {slug && (
                        <Link href={`/blog/${slug}`} target="_blank"
                            className="text-[10px] text-muted-foreground hover:text-[#7ebac8] transition-colors shrink-0">
                            Preview ↗
                        </Link>
                    )}
                </div>
            </div>

            {/* Newsletter notice */}
            {subscribers > 0 && (
                <div className="flex items-center gap-2.5 bg-[#f0f9ff] border border-[#7ebac8]/30 rounded-lg px-4 py-2.5 mb-5">
                    <Users className="w-4 h-4 text-[#7ebac8] shrink-0" />
                    <p className="text-[13px] text-[#4a535e]">
                        Publishing will automatically notify <strong className="text-[#1e2328]">{subscribers} active subscribers</strong> by email.
                    </p>
                </div>
            )}

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

                {/* Left: content */}
                <div className="space-y-5">

                    <div className="bg-white rounded-xl border border-black/[0.06] p-5 space-y-3">
                        <p className={labelCls}>Summary / Excerpt</p>
                        <textarea
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            rows={2}
                            placeholder="Short summary shown on the blog card and in newsletter emails…"
                            className={`${inputCls} resize-none`}
                        />
                    </div>

                    <div className="bg-white rounded-xl border border-black/[0.06] p-5 space-y-3">
                        <p className={labelCls}>Cover Image</p>
                        <ImageUploader currentImageUrl={coverImageUrl} onUpload={setCoverImageUrl} />
                    </div>

                    <div className="bg-white rounded-xl border border-black/[0.06] p-5 space-y-3">
                        <p className={labelCls}>Body Content</p>
                        <RichTextEditor value={content} onChange={setContent} />
                    </div>

                </div>

                {/* Right: sidebar */}
                <div className="space-y-4 lg:sticky lg:top-6 self-start">

                    {/* Organization */}
                    <div className="bg-white rounded-xl border border-black/[0.06] p-5 space-y-4">
                        <p className={labelCls}>Organization</p>

                        <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold text-[#333a42]">Topic / Category</label>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                                className={`${inputCls} appearance-none cursor-pointer`}>
                                <option value="">Select a topic…</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {categories.length === 0 && (
                                <Link href="/admin/categories" className="text-[11px] text-[#7ebac8] hover:underline">
                                    + Create a topic first
                                </Link>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold text-[#333a42]">Author / Clinician</label>
                            <select value={authorId} onChange={e => setAuthorId(e.target.value)}
                                className={`${inputCls} appearance-none cursor-pointer`}>
                                <option value="">Select an author…</option>
                                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white rounded-xl border border-black/[0.06] p-5 space-y-4">
                        <p className={labelCls}>SEO</p>

                        <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold text-[#333a42]">
                                Meta Title
                                <span className={`ml-1.5 text-[10px] font-normal ${metaTitle.length > 60 ? "text-rose-500" : "text-muted-foreground"}`}>
                                    {metaTitle.length}/60
                                </span>
                            </label>
                            <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
                                placeholder="Page title for Google…" className={inputCls} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold text-[#333a42]">
                                Meta Description
                                <span className={`ml-1.5 text-[10px] font-normal ${metaDescription.length > 160 ? "text-rose-500" : "text-muted-foreground"}`}>
                                    {metaDescription.length}/160
                                </span>
                            </label>
                            <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)}
                                rows={3} placeholder="Search result snippet…"
                                className={`${inputCls} resize-none`} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold text-[#333a42]">Focus Keyword</label>
                            <input value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)}
                                placeholder="anxiety treatment, CBT…" className={inputCls} />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2.5">
                        <button onClick={() => handleSubmit(true)} disabled={saving}
                            className="w-full flex items-center justify-center gap-2 bg-[#1e2328] hover:bg-[#2d3540] text-white rounded-lg py-3 text-sm font-semibold transition-all disabled:opacity-50 shadow-sm">
                            {saving && saveMode === "publish"
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>
                                : <><Globe className="w-4 h-4" /> Publish Article</>}
                        </button>
                        <button onClick={() => handleSubmit(false)} disabled={saving}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-black/[0.1] hover:border-black/20 text-[#333a42] rounded-lg py-3 text-sm font-semibold transition-all disabled:opacity-50">
                            {saving && saveMode === "draft"
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                : <><FileText className="w-4 h-4" /> Save as Draft</>}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
