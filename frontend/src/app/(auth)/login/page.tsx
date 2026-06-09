"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";

function LoginInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/admin";
    const urlError = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(
        urlError === "AccessDenied" ? "Your Google account is not authorized to access this portal." : null
    );
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    async function handleCredentials(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError(null);
        const res = await signIn("credentials", { redirect: false, username: email, password });
        setLoading(false);
        if (res?.error) setError("Incorrect email or password. Please try again.");
        else { router.push(callbackUrl); router.refresh(); }
    }

    async function handleGoogle() {
        setGoogleLoading(true);
        await signIn("google", { callbackUrl });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f1ed] px-4">
            {/* Background subtle pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#7ebac820_0%,_transparent_60%)] pointer-events-none" />

            <div className="w-full max-w-[400px] relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#1e2328] flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-[#7ebac8] font-bold text-xl">R</span>
                    </div>
                    <h1 className="text-xl font-bold text-[#1e2328] tracking-tight">Reframe Admin</h1>
                    <p className="text-sm text-[#6b7a87] mt-1">Authorized personnel only</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-black/[0.06] overflow-hidden">
                    {/* Header strip */}
                    <div className="h-1 bg-gradient-to-r from-[#7ebac8] via-[#5fa8b8] to-[#7ebac8]" />

                    <div className="px-7 pt-7 pb-8 space-y-5">
                        {/* Google Sign-in */}
                        <button
                            onClick={handleGoogle}
                            disabled={googleLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-black/[0.12] rounded-xl px-4 py-3 text-sm font-semibold text-[#333a42] transition-all shadow-sm hover:shadow-md disabled:opacity-60"
                        >
                            {googleLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            )}
                            {googleLoading ? "Redirecting…" : "Continue with Google"}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-black/[0.07]" />
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">or</span>
                            <div className="flex-1 h-px bg-black/[0.07]" />
                        </div>

                        {/* Credentials form */}
                        <form onSubmit={handleCredentials} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7a87]">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@reframepsychology.com"
                                        required
                                        className="w-full pl-9 pr-4 py-3 bg-[#f7f5f2] border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40 focus:bg-white transition-colors placeholder:text-muted-foreground/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7a87]">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-9 pr-4 py-3 bg-[#f7f5f2] border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40 focus:bg-white transition-colors placeholder:text-muted-foreground/50"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-3">
                                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-rose-600 font-medium leading-snug">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1e2328] hover:bg-[#2a3038] text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                            >
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating…</> : "Sign In with Password"}
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-[11px] text-muted-foreground mt-5">
                    All access is logged · Authorized personnel only
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f4f1ed]" />}>
            <LoginInner />
        </Suspense>
    );
}
