"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Lock, Unlock, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function BlockUserAction({ userId, isBlocked, userName }: { userId: number, isBlocked: boolean, userName: string }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${getApiUrl()}/api/v1/users/${userId}/toggle-active`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert("Failed to toggle user status.");
            }
        } catch (error) {
            alert("Error connecting to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant={isBlocked ? "outline" : "secondary"} size="sm">
                    {isBlocked ? <><Unlock className="mr-2 h-4 w-4" /> Unblock</> : <><Lock className="mr-2 h-4 w-4" /> Block</>}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will {isBlocked ? "restore login access for" : "immediately revoke login access for"} <strong>{userName}</strong>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleToggle}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function ResetPasswordAction({ userId, userName }: { userId: number, userName: string }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");

    const handleReset = async (e: React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${getApiUrl()}/api/v1/users/${userId}/reset-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({ new_password: password })
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert("Failed to reset password.");
            }
        } catch (error) {
            alert("Error connecting to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reset Password for {userName}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter a new temporary password for this author. They will be forced to change it upon their next login.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <input
                        type="text"
                        placeholder="New temporary password..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} disabled={!password || loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Execute Reset
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}