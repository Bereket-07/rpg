"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";


export default function NewCategoryPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");

    // Auto-generate slug from name
    useEffect(() => {
        if (!slug && name) {
            setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [name]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            name,
            slug,
            description
        };

        try {
            const res = await fetch(`${getApiUrl()}/api/v1/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/admin/categories");
                router.refresh();
            } else {
                alert("Failed to create category.");
            }
        } catch (error) {
            alert("Error connecting to server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">New Category</h1>
                    <p className="text-muted-foreground mt-1">Create a new clinical topic for your articles.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                        <CardDescription>Group related articles under a unified topic.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Anxiety" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug</Label>
                            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="anxiety" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Articles dealing with various forms of anxiety." />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Create Category"}</Button>
                </div>
            </form>
        </div>
    );
}