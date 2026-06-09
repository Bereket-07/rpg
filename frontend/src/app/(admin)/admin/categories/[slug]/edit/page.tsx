"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";


export default function EditCategoryPage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function fetchCategory() {
            try {
                const res = await fetch(`${getApiUrl()}/api/v1/categories/${params.slug}`);
                if (!res.ok) {
                    throw new Error("Category not found");
                }
                const data = await res.json();

                if (isMounted) {
                    setName(data.name || "");
                    setSlug(data.slug || "");
                    setDescription(data.description || "");
                }
            } catch (error) {
                console.error(error);
                if (isMounted) {
                    alert("Category not found");
                    router.push("/admin/categories");
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchCategory();
        return () => { isMounted = false; };
    }, [params.slug, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const payload = {
            name,
            slug,
            description
        };

        try {
            const res = await fetch(`${getApiUrl()}/api/v1/categories/${params.slug}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/admin/categories");
                router.refresh();
            } else {
                alert("Failed to update category.");
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
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
                    <p className="text-muted-foreground mt-1">Update the blog category details.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                        <CardDescription>Changes will update the URL slug and display name across all associated articles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    // Optionally auto-generate slug based on name if they type
                                    // setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                                }}
                                required placeholder="Mental Health"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug <span className="text-muted-foreground font-normal">(Auto-generated or custom)</span></Label>
                            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="mental-health" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Articles discussing mental health and wellness..." />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Update Category"}</Button>
                </div>
            </form>
        </div>
    );
}