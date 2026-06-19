"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2, Globe, FileText, Eye } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import { getApiUrl } from "@/lib/api";

const inputCls = "w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40 bg-white text-[#333a42] placeholder:text-muted-foreground/60";
const labelCls = "block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5";

export default function EditArticlePage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const { data: session } = useSession();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(false);
    const [saveMode, setSaveMode] = useState<"draft" | "publish">("draft");
    const [error, setError]     = useState("");

    const [authors, setAuthors]       = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [title, setTitle]         = useState("");
    const [slug, setSlug]           = useState("");
    const [excerpt, setExcerpt]     = useState("");
    const [content, setContent]     = useState("");
    const [published, setPublished] = useState(false);
    const [wasPublished, setWasPublished] = useState(false);
    const [authorId, setAuthorId]     = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [coverImageUrl, setCoverImageUrl]   = useState("");
    const [metaTitle, setMetaTitle]           = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [focusKeyword, setFocusKeyword]     = useState("");

    useEffect(() => {
        let mounted = true;
        async function fetchData() {
            try {
                const [authRes, catRes, articleRes] = await Promise.all([
                    fetch(`${getApiUrl()}/api/v1/authors`),
                    fetch(`${getApiUrl()}/api/v1/categories`),
                    fetch(`${getApiUrl()}/api/v1/articles/${params.slug}`),
                ]);
                if (!articleRes.ok) throw new Error("Article not found");
                const [authData, catData, art] = await Promise.all([
                    authRes.json(), catRes.json(), articleRes.json(),
                ]);
                if (!mounted) return;
                setAuthors(authData);
                setCategories(catData);
                setTitle(art.title || "");
                setSlug(art.slug || "");
                setExcerpt(art.excerpt || "");
                setContent(art.content || "");
                setPublished(art.published || false);
                setWasPublished(art.published || false);
                setCoverImageUrl(art.cover_image_url || "");
                setAuthorId(art.author_id ? String(art.author_id) : "");
                setCategoryId(art.category_id ? String(art.category_id) : "");
                if (art.seo_meta) {
                    setMetaTitle(art.seo_meta.meta_title || "");
                    setMetaDescription(art.seo_meta.meta_description || "");
                    setFocusKeyword(art.seo_meta.focus_keyword || "");
                }
            } catch {
                if (mounted) { alert("Article not found."); router.push("/admin/articles"); }
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchData();
        return () => { mounted = false; };
    }, [params.slug, router]);

    async function handleSubmit(publishNow: boolean) {
        if (!authorId || !categoryId) {
            setError("Please select both an author and a category.");
            return;
        }
        setSaveMode(publishNow ? "publish" : "draft");
        setSaving(true);
        setError("");
        const token = (session as any)?.accessToken;
        const payload = {
            title, slug, content, excerpt,
            cover_image_url: coverImageUrl || undefined,
            published: publishNow,
            author_id: parseInt(authorId),
            category_id: parseInt(categoryId),
            seo_meta: { meta_title: metaTitle, meta_description: metaDescription, focus_keyword: focusKeyword },
        };
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/articles/${params.slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (res.ok) { router.push("/admin/articles"); router.refresh(); }
            else {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || "Failed to update article.");
            }
        } catch { setError("Could not connect to the server."); }
        finally { setSaving(false); }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const isFirstPublish = !wasPublished;

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
                    <span className="text-[12px] font-semibold text-[#333a42]">Edit Article</span>
                    {wasPublished && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            ● Live
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {wasPublished && (
                        <Link href={`/blog/${params.slug}`} target="_blank"
                            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-[#7ebac8] font-medium transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View Live
                        </Link>
                    )}
                    <button onClick={() => handleSubmit(false)} disabled={saving}
                        className="flex items-center gap-2 bg-white border border-black/[0.1] hover:border-black/20 text-[#333a42] px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
                        {saving && saveMode === "draft" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                        Save Draft
                    </button>
                    <button onClick={() => handleSubmit(true)} disabled={saving}
                        className="flex items-center gap-2 bg-[#1e2328] hover:bg-[#2d3540] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shadow-sm">
                        {saving && saveMode === "publish" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                        {wasPublished ? "Update" : "Publish"}
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
                        onChange={e => setSlug(e.target.value)}
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

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

                {/* Left */}
                <div className="space-y-5">

                    <div className="bg-white rounded-xl border border-black/[0.06] p-5 space-y-3">
                        <p className={labelCls}>Summary / Excerpt</p>
                        <textarea
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            rows={2}
                            placeholder="Short summary shown on blog cards and in newsletter emails…"
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
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                : <><Globe className="w-4 h-4" /> {wasPublished ? "Save & Keep Live" : "Publish Article"}</>}
                        </button>
                        <button onClick={() => handleSubmit(false)} disabled={saving}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-black/[0.1] hover:border-black/20 text-[#333a42] rounded-lg py-3 text-sm font-semibold transition-all disabled:opacity-50">
                            {saving && saveMode === "draft"
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                : <><FileText className="w-4 h-4" /> {wasPublished ? "Unpublish & Save Draft" : "Save as Draft"}</>}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
