"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";


export default function EditArticlePage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const { data: session } = useSession();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [published, setPublished] = useState(false);

    // Convert to strings for Radix Select compatibility
    const [authorId, setAuthorId] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [focusKeyword, setFocusKeyword] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                // Fetch dependencies
                const [authorsRes, categoriesRes, articleRes] = await Promise.all([
                    fetch(`${getApiUrl()}/api/v1/authors`),
                    fetch(`${getApiUrl()}/api/v1/categories`),
                    fetch(`${getApiUrl()}/api/v1/articles/${params.slug}`)
                ]);

                if (!articleRes.ok) throw new Error("Article not found");

                const authData = await authorsRes.json();
                const catData = await categoriesRes.json();
                const articleData = await articleRes.json();

                if (isMounted) {
                    setAuthors(authData);
                    setCategories(catData);

                    setTitle(articleData.title || "");
                    setSlug(articleData.slug || "");
                    setContent(articleData.content || "");
                    setExcerpt(articleData.excerpt || "");
                    setPublished(articleData.published || false);
                    setAuthorId(articleData.author_id ? String(articleData.author_id) : "");
                    setCategoryId(articleData.category_id ? String(articleData.category_id) : "");

                    if (articleData.seo_meta) {
                        setMetaTitle(articleData.seo_meta.meta_title || "");
                        setMetaDescription(articleData.seo_meta.meta_description || "");
                        setFocusKeyword(articleData.seo_meta.focus_keyword || "");
                    }
                }
            } catch (error) {
                console.error("Failed to load article details:", error);
                if (isMounted) {
                    alert("Article not found or server error.");
                    router.push("/admin/articles");
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchData();
        return () => { isMounted = false; };
    }, [params.slug, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!authorId || !categoryId) {
            alert("Please select both an author and a category.");
            return;
        }

        setIsSaving(true);

        const payload = {
            title,
            slug,
            content,
            excerpt,
            published,
            author_id: parseInt(authorId),
            category_id: parseInt(categoryId),
            seo_meta: {
                meta_title: metaTitle,
                meta_description: metaDescription,
                focus_keyword: focusKeyword
            }
        };

        try {
            const res = await fetch(`${getApiUrl()}/api/v1/articles/${params.slug}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/admin/articles");
                router.refresh(); // Tells Next.js to re-fetch Server Components (like the articles list)
            } else {
                alert("Failed to update article.");
            }
        } catch (error) {
            alert("Error connecting to server.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Article</h1>
                    <p className="text-muted-foreground mt-1">Update your content and modify SEO data.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Content</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Article Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        placeholder="How to Manage Anxiety"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">URL Slug</Label>
                                    <Input
                                        id="slug"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        required
                                        placeholder="how-to-manage-anxiety"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Body Content</Label>
                                    <div className="min-h-[400px]">
                                        {/* Rich Text Editor injects the HTML string back up via onChange */}
                                        <RichTextEditor value={content} onChange={setContent} />
                                    </div>
                                </div>
                                <div className="space-y-2 pt-4">
                                    <Label htmlFor="excerpt">Excerpt / Summary</Label>
                                    <Textarea
                                        id="excerpt"
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        rows={3}
                                        placeholder="Brief summary for the blog listing page..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>SEO Data</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="metaTitle">Meta Title</Label>
                                    <Input id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Optimal title for Google..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="metaDescription">Meta Description</Label>
                                    <Textarea id="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} placeholder="Optimal description for Google search results..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="focusKeyword">Focus Keyword</Label>
                                    <Input id="focusKeyword" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="anxiety management" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Configuration */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Publishing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2 flex flex-col">
                                    <Label>Status</Label>
                                    <div className="flex bg-muted p-1 rounded-md">
                                        <Button
                                            type="button"
                                            variant={!published ? "default" : "ghost"}
                                            className="w-1/2 h-8 text-xs"
                                            onClick={() => setPublished(false)}
                                        >
                                            Draft
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={published ? "default" : "ghost"}
                                            className="w-1/2 h-8 text-xs"
                                            onClick={() => setPublished(true)}
                                        >
                                            Published
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat: any) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="author">Author</Label>
                                    <Select value={authorId} onValueChange={setAuthorId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an author" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {authors.map((auth: any) => (
                                                <SelectItem key={auth.id} value={auth.id.toString()}>
                                                    {auth.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-3">
                            <Button type="submit" size="lg" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Update Article"}
                            </Button>
                            <Button variant="outline" type="button" onClick={() => router.back()}>
                                Discard Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}