"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Mail, Download, Search, Users, UserX, TrendingUp } from "lucide-react";
import { getApiUrl } from "@/lib/api";


interface Subscriber { id: number; email: string; is_active: boolean; subscribed_at: string; }

export default function AdminNewsletterPage() {
    const { data: session } = useSession();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "unsubscribed">("all");
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
        ...filtered.map(s => [s.email, s.is_active ? "Active" : "Unsubscribed", new Date(s.subscribed_at).toLocaleDateString()])];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e2328] tracking-tight">Newsletter</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your mailing list and subscriber activity</p>
                </div>
                <button onClick={exportCSV}
                    className="flex items-center gap-2 bg-white border border-black/[0.1] hover:border-[#7ebac8]/60 text-[#333a42] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Summary banner */}
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
        </div>
    );
}