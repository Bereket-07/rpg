"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Mail, Download, Search, Users, UserX, TrendingUp, Send, X, Loader2, CheckCircle2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface Subscriber { id: number; email: string; is_active: boolean; subscribed_at: string; }

export default function AdminNewsletterPage() {
    const { data: session } = useSession();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "unsubscribed">("all");
    const [broadcastOpen, setBroadcastOpen] = useState(false);
    const [broadcastSubject, setBroadcastSubject] = useState("");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);
    const token = (session as any)?.accessToken;

    useEffect(() => {
        if (!token) return;
        fetch(`${getApiUrl()}/api/v1/newsletter`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
            .then(r => r.ok ? r.json() : [])
            .then(setSubscribers)
            .finally(() => setLoading(false));
    }, [token]);

    const active = subscribers.filter(s => s.is_active);
    const inactive = subscribers.filter(s => !s.is_active);
    const thisMonth = subscribers.filter(s => {
        const d = new Date(s.subscribed_at);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const filtered = subscribers.filter(s => {
        const matchFilter = filter === "all" || (filter === "active" ? s.is_active : !s.is_active);
        const matchSearch = !search || s.email.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    function exportCSV() {
        const rows = [["Email", "Status", "Subscribed Date"],
            ...filtered.map(s => [s.email, s.is_active ? "Active" : "Unsubscribed",
                new Date(s.subscribed_at).toLocaleDateString()])];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click();
        URL.revokeObjectURL(url);
    }

    async function handleBroadcast(e: React.FormEvent) {
        e.preventDefault();
        if (!broadcastSubject.trim() || !broadcastMessage.trim()) return;
        setSending(true); setSendResult(null);
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/newsletter/broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ subject: broadcastSubject, message: broadcastMessage }),
            });
            const data = await res.json();
            if (res.ok) {
                setSendResult({ ok: true, msg: data.message || `Sent to ${data.sent} subscribers!` });
                setTimeout(() => { setBroadcastOpen(false); setBroadcastSubject(""); setBroadcastMessage(""); setSendResult(null); }, 2500);
            } else {
                setSendResult({ ok: false, msg: data.detail || "Failed to send broadcast." });
            }
        } catch {
            setSendResult({ ok: false, msg: "Server connection error." });
        } finally { setSending(false); }
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e2328] tracking-tight">Newsletter</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your mailing list and send broadcasts</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportCSV}
                        className="flex items-center gap-2 bg-white border border-black/[0.1] hover:border-[#7ebac8]/60 text-[#333a42] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button onClick={() => setBroadcastOpen(true)}
                        className="flex items-center gap-2 bg-[#7ebac8] hover:bg-[#6aaab8] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                        <Send className="w-4 h-4" /> Send Broadcast
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Active", value: active.length, icon: <Users className="w-4 h-4" />, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Unsubscribed", value: inactive.length, icon: <UserX className="w-4 h-4" />, color: "text-rose-500", bg: "bg-rose-50" },
                    { label: "Joined This Month", value: thisMonth, icon: <TrendingUp className="w-4 h-4" />, color: "text-[#7ebac8]", bg: "bg-[#7ebac8]/10" },
                ].map(card => (
                    <div key={card.label} className="bg-white rounded-xl border border-black/[0.06] px-5 py-4 flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>{card.icon}</div>
                        <div>
                            <p className={`text-2xl font-bold ${card.color} tabular-nums`}>{loading ? "…" : card.value}</p>
                            <p className="text-[12px] text-muted-foreground font-medium">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter + Search */}
            <div className="flex gap-3">
                <div className="flex items-center bg-white border border-black/[0.07] rounded-lg p-1 gap-0.5">
                    {(["all", "active", "unsubscribed"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-[12px] font-semibold capitalize transition-colors ${filter === f ? "bg-[#1e2328] text-white shadow-sm" : "text-muted-foreground hover:text-[#333a42]"}`}>
                            {f}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email…"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-black/[0.07] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40 placeholder:text-muted-foreground/60" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
                <div className="grid grid-cols-[1fr_140px_100px] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-5 py-3 border-b border-black/[0.04] bg-[#fafaf9]">
                    <span>Email Address</span><span>Joined</span><span className="text-right">Status</span>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">Loading subscribers…</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <Mail className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No subscribers match your filter</p>
                    </div>
                ) : (
                    <div className="divide-y divide-black/[0.04]">
                        {filtered.map(sub => (
                            <div key={sub.id} className="grid grid-cols-[1fr_140px_100px] items-center px-5 py-3 hover:bg-[#f7f5f2] transition-colors">
                                <span className="text-[13px] font-medium text-[#333a42]">{sub.email}</span>
                                <span className="text-[12px] text-muted-foreground">
                                    {new Date(sub.subscribed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                                <span className={`text-right text-[10px] font-bold ${sub.is_active ? "text-emerald-600" : "text-rose-500"}`}>
                                    {sub.is_active ? "● Active" : "● Unsubscribed"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Broadcast Drawer */}
            {broadcastOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => !sending && setBroadcastOpen(false)} />
                    <div className="w-[460px] bg-white shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-6 py-5 border-b">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Newsletter</p>
                                <h3 className="font-bold text-[16px] text-[#1e2328]">Send Broadcast</h3>
                            </div>
                            <button onClick={() => setBroadcastOpen(false)} className="w-8 h-8 rounded-full hover:bg-black/[0.06] flex items-center justify-center">
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleBroadcast} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                            {/* Recipients preview */}
                            <div className="bg-[#f0f9ff] border border-[#7ebac8]/30 rounded-lg px-4 py-3 flex items-center gap-3">
                                <Users className="w-4 h-4 text-[#7ebac8]" />
                                <p className="text-[13px] text-[#4a535e]">
                                    Sending to <strong className="text-[#1e2328]">{active.length} active subscribers</strong>
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#333a42] uppercase tracking-wider">Subject Line</label>
                                <input
                                    required
                                    value={broadcastSubject}
                                    onChange={e => setBroadcastSubject(e.target.value)}
                                    placeholder="e.g. Monthly Mental Health Insights"
                                    className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#333a42] uppercase tracking-wider">Message</label>
                                <textarea
                                    required
                                    value={broadcastMessage}
                                    onChange={e => setBroadcastMessage(e.target.value)}
                                    placeholder={"Write your message here...\n\nEach paragraph will be formatted automatically.\nKeep it warm and personal."}
                                    rows={10}
                                    className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40 resize-none"
                                />
                                <p className="text-[11px] text-muted-foreground">Each new line becomes a paragraph. An unsubscribe link is added automatically.</p>
                            </div>

                            {sendResult && (
                                <div className={`flex items-start gap-2 px-3 py-3 rounded-lg text-sm font-medium ${sendResult.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                                    {sendResult.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <X className="w-4 h-4 mt-0.5 shrink-0" />}
                                    {sendResult.msg}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={sending || !broadcastSubject.trim() || !broadcastMessage.trim()}
                                className="w-full bg-[#7ebac8] hover:bg-[#6aaab8] disabled:opacity-50 text-white rounded-lg py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {sending
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                                    : <><Send className="w-4 h-4" /> Send to {active.length} Subscribers</>
                                }
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}