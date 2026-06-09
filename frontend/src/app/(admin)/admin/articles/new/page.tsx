"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import { getApiUrl } from "@/lib/api";


export default function ComposeArticlePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [authors, setAuthors] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [published, setPublished] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [authorId, setAuthorId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [focusKeyword, setFocusKeyword] = useState("");
    const [coverImageUrl, setCoverImageUrl] = useState("");

    // Auto-generate slug from title
    useEffect(() => {
        if (!slug && title) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [title]);

    useEffect(() => {
        async function fetchRelations() {
            try {
                const [authRes, catRes] = await Promise.all([
                    fetch(`${getApiUrl()}/api/v1/authors`),
                    fetch(`${getApiUrl()}/api/v1/categories`)
                ]);
                if (authRes.ok) setAuthors(await authRes.json());
                if (catRes.ok) setCategories(await catRes.json());
            } catch (error) {
                console.error("Failed to load relations", error);
            }
        }
        fetchRelations();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            title,
            slug,
            content,
            excerpt,
            cover_image_url: coverImageUrl || undefined,
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
            const res = await fetch(`${getApiUrl()}/api/v1/articles`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/admin/articles");
                router.refresh();
            } else {
                alert("Failed to create article.");
            }
        } catch (error) {
            alert("Error connecting to server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between pl-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Compose Article</h1>
                    <p className="text-muted-foreground mt-1">Write a new content marketing blog post.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-primary/20">
                    <CardHeader>
                        <CardTitle>Core Content</CardTitle>
                        <CardDescription>The main body of your blog post.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Article Title</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug (Auto-generated)</Label>
                            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Excerpt (Short summary for cards)</Label>
                            <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Cover Image (appears on article card & header)</Label>
                            <ImageUploader currentImageUrl={coverImageUrl} onUpload={setCoverImageUrl} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Full Body Content</Label>
                            <RichTextEditor value={content} onChange={setContent} />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select onValueChange={setCategoryId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select clinical topic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                        ))}
                                        {categories.length === 0 && <SelectItem value="none" disabled>No Categories Found</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Author</Label>
                                <Select onValueChange={setAuthorId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select clinician" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {authors.map((auth) => (
                                            <SelectItem key={auth.id} value={auth.id.toString()}>{auth.name}</SelectItem>
                                        ))}
                                        {authors.length === 0 && <SelectItem value="none" disabled>No Authors Found</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2 pt-4 border-t mt-4">
                                <Checkbox id="publish" checked={published} onCheckedChange={(c) => setPublished(c as boolean)} />
                                <Label htmlFor="publish" className="font-medium">Publish immediately</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Meta Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="meta_title">Meta Title (Max 60 chars)</Label>
                                <Input id="meta_title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Therapy for Anxiety | Reframe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="meta_description">Meta Description (Max 160 chars)</Label>
                                <Textarea id="meta_description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} placeholder="Learn actionable techniques to navigate anxiety..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="focus_keyword">Focus Keyword</Label>
                                <Input id="focus_keyword" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="anxiety treatment, panic attacks" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={isLoading}>{isLoading ? "Saving..." : "Save Article"}</Button>
                </div>
            </form>
        </div>
    );
}