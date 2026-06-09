"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";


export default function ChangePasswordPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // If they are not logged in or have already reset their password, kick them out
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && !session?.user?.must_change_password) {
            router.push("/admin");
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            return setError("New passwords do not match.");
        }
        if (newPassword.length < 8) {
            return setError("Password must be at least 8 characters long.");
        }

        setLoading(true);

        try {
            const res = await fetch(`${getApiUrl()}/api/v1/auth/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Failed to successfully reset password.");
            }

            // Successfully changed! Force them to log out and log back in with the new credentials
            // This cleanly flushes the JWT containing the old `must_change_password=True` flag
            await signOut({ callbackUrl: "/login?reset=success" });

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            setLoading(false);
        }
    };

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="max-w-md w-full border-primary/20 shadow-lg">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <ShieldAlert className="h-6 w-6" />
                        <CardTitle className="text-2xl">Action Required</CardTitle>
                    </div>
                    <CardDescription>
                        For your security, you must set a new permanent password before accessing the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="oldPassword">Current Temporary Password</Label>
                            <Input
                                id="oldPassword"
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password & Continue
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4 pb-2">
                    <Button variant="ghost" size="sm" onClick={() => signOut()}>
                        Cancel and Sign Out
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}