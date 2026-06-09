"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Users, PlusCircle, RefreshCw, ShieldOff, Shield, Trash2, X, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { BlockUserAction, ResetPasswordAction } from "@/components/admin/AccountActions";
import DeleteAction from "@/components/admin/DeleteAction";
import { getApiUrl } from "@/lib/api";


interface Author {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    must_change_password: boolean;
    profile_image_url?: string;
    role?: string;
}

interface NewAccountForm { name: string; email: string; password: string; }

export default function AdminAuthorsPage() {
    const { data: session } = useSession();
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [form, setForm] = useState<NewAccountForm>({ name: "", email: "", password: "" });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const token = (session as any)?.accessToken;

    async function loadAuthors() {
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/users/authors`, {
                cache: "no-store",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setAuthors(await res.json());
        } finally { setLoading(false); }
    }

    useEffect(() => { if (token) loadAuthors(); }, [token]);

    async function handleProvision(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true); setError("");
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/users/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: "AUTHOR" })
            });
            if (res.ok) {
                setSuccess(true);
                setForm({ name: "", email: "", password: "" });
                await loadAuthors();
                setTimeout(() => { setSuccess(false); setDrawerOpen(false); }, 2000);
            } else {
                const d = await res.json();
                setError(d.detail || "Failed to provision account");
            }
        } catch { setError("Server connection error"); }
        finally { setSaving(false); }
    }

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e2328] tracking-tight">Clinicians</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage login accounts for your clinical team</p>
                </div>
                <button onClick={() => setDrawerOpen(true)}
                    className="flex items-center gap-2 bg-[#7ebac8] hover:bg-[#6aaab8] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                    <PlusCircle className="w-4 h-4" /> Provision Account
                </button>
            </div>

            {/* Cards grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-black/[0.06] p-5 animate-pulse space-y-3">
                            <div className="w-14 h-14 rounded-full bg-gray-100 mx-auto" />
                            <div className="h-3 bg-gray-100 rounded w-2/3 mx-auto" />
                            <div className="h-2 bg-gray-100 rounded w-1/2 mx-auto" />
                        </div>
                    ))}
                </div>
            ) : authors.length === 0 ? (
                <div className="bg-white rounded-xl border border-black/[0.06] p-16 text-center">
                    <Users className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm font-medium text-[#333a42]">No clinician accounts yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Provision an account for each clinical team member</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {authors.map(author => (
                        <div key={author.id}
                            className="bg-white rounded-xl border border-black/[0.06] p-5 hover:shadow-md transition-all flex flex-col items-center text-center gap-3">
                            {/* Avatar */}
                            <div className="relative">
                                {author.profile_image_url ? (
                                    <img src={author.profile_image_url} alt={author.name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-[#7ebac8]/15 flex items-center justify-center border-2 border-white shadow-md">
                                        <span className="text-xl font-bold text-[#7ebac8]">{author.name?.charAt(0)}</span>
                                    </div>
                                )}
                                <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${author.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                            </div>

                            {/* Info */}
                            <div>
                                <p className="font-bold text-[14px] text-[#1e2328]">{author.name}</p>
                                <p className="text-[11px] text-muted-foreground">{author.email}</p>
                                <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${author.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                        {author.is_active ? "Active" : "Blocked"}
                                    </span>
                                    {author.must_change_password && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                                            Pending Reset
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t border-black/[0.04] w-full justify-center">
                                <ResetPasswordAction userId={author.id} userName={author.name} />
                                <BlockUserAction userId={author.id} isBlocked={!author.is_active} userName={author.name} />
                                <DeleteAction endpoint={`users/${author.id}`} itemName={author.name} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Slide-over Drawer */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                    <div className="w-[360px] bg-white shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">New Account</p>
                                <h3 className="font-bold text-[15px] text-[#1e2328]">Provision Clinician</h3>
                            </div>
                            <button onClick={() => setDrawerOpen(false)} className="w-7 h-7 rounded-full hover:bg-black/[0.06] flex items-center justify-center">
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                        <form onSubmit={handleProvision} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#333a42] uppercase tracking-wider">Display Name</label>
                                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Dr. Sarah Johnson" className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#333a42] uppercase tracking-wider">Login Email</label>
                                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="sarah@reframepsychology.com" className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#333a42] uppercase tracking-wider">Temporary Password</label>
                                <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="Min 8 characters" className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                <p className="text-[10px] text-muted-foreground">The clinician will be required to change this on first login.</p>
                            </div>
                            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                            {success && (
                                <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                                    <CheckCircle2 className="w-4 h-4" /> Account provisioned!
                                </div>
                            )}
                            <button type="submit" disabled={saving}
                                className="w-full bg-[#1e2328] hover:bg-[#2a3038] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Provisioning…</> : "Create Account"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}