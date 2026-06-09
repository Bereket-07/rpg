"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";


export default function NewAuthorPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const payload = {
            name,
            email,
            password
        };

        try {
            const res = await fetch(`${getApiUrl()}/api/v1/users/author`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/admin/authors");
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.detail || "Failed to create author account.");
            }
        } catch (error) {
            setError("Error connecting to server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Provision New Author</h1>
                    <p className="text-muted-foreground mt-1">Create an account for a clinical team member.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                        <CardDescription>
                            Provide a temporary password. The Author will be forced to map their own security credentials and biography upon first login.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. Sarah Johnson" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Login Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="s.johnson@reframe.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Temporary Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading ? "Provisioning..." : "Create Account"}</Button>
                </div>
            </form>
        </div>
    );
}