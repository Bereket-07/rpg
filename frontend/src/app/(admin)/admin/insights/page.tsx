"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { TrendingUp, CheckCircle2, XCircle, Clock, Users, BarChart2, RefreshCw } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface ClinicianStats {
    clinician_name: string;
    author_id: number | null;
    total_bookings: number;
    confirmed: number;
    declined: number;
    pending: number;
    acceptance_rate: number;
    this_period_bookings: number;
    period: string;
    by_concern: Record<string, number>;
    by_status: Record<string, number>;
}

interface AdminStats {
    aggregate: ClinicianStats;
    clinicians: ClinicianStats[];
}

type Period = "week" | "month" | "year";

const PERIOD_LABELS: Record<Period, string> = {
    week: "This Week",
    month: "This Month",
    year: "This Year",
};

function StatCard({ label, value, sub, icon, color, bg }: {
    label: string; value: string | number; sub?: string;
    icon: React.ReactNode; color: string; bg: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-black/[0.06] p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
                {icon}
            </div>
            <div>
                <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                <p className="text-[13px] font-semibold text-[#1e2328] mt-0.5">{label}</p>
                {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function MiniBarChart({ data }: { data: Record<string, number> }) {
    const entries = Object.entries(data);
    if (!entries.length) return <p className="text-sm text-muted-foreground">No data yet.</p>;
    const max = Math.max(...entries.map(([, v]) => v));
    return (
        <div className="space-y-2.5 mt-2">
            {entries.map(([label, count]) => (
                <div key={label} className="flex items-center gap-3">
                    <p className="text-[12px] text-[#4a535e] w-36 shrink-0 truncate" title={label}>{label}</p>
                    <div className="flex-1 h-2.5 bg-[#f0f0ef] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#7ebac8] rounded-full transition-all duration-500"
                            style={{ width: `${(count / max) * 100}%` }}
                        />
                    </div>
                    <p className="text-[12px] font-bold text-[#1e2328] w-6 text-right tabular-nums">{count}</p>
                </div>
            ))}
        </div>
    );
}

function AcceptanceRing({ rate }: { rate: number }) {
    const r = 36;
    const circ = 2 * Math.PI * r;
    const dash = (rate / 100) * circ;
    const color = rate >= 75 ? "#22c55e" : rate >= 50 ? "#f59e0b" : "#ef4444";
    return (
        <div className="flex flex-col items-center justify-center gap-1">
            <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r={r} fill="none" stroke="#f0f0ef" strokeWidth="8" />
                <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeDashoffset={circ / 4}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.6s ease" }} />
                <text x="48" y="53" textAnchor="middle" fontSize="15" fontWeight="700" fill={color}>{rate}%</text>
            </svg>
            <p className="text-[11px] text-muted-foreground font-medium">Acceptance Rate</p>
        </div>
    );
}

export default function InsightsPage() {
    const { data: session } = useSession();
    const [period, setPeriod] = useState<Period>("month");
    const [loading, setLoading] = useState(true);
    const [adminData, setAdminData] = useState<AdminStats | null>(null);
    const [clinicianData, setClinicianData] = useState<ClinicianStats | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const token = (session as any)?.accessToken;
    const role = (session as any)?.user?.role;

    useEffect(() => {
        if (!token) return;
        const admin = role === "ADMIN";
        setIsAdmin(admin);
        fetchStats(admin);
    }, [token, period]);

    async function fetchStats(admin: boolean) {
        setLoading(true);
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/consultations/stats?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });
            if (!res.ok) return;
            const data = await res.json();
            if (admin) setAdminData(data as AdminStats);
            else setClinicianData(data as ClinicianStats);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const stats = isAdmin ? adminData?.aggregate : clinicianData;

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e2328] tracking-tight">Insights</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {isAdmin ? "Practice-wide consultation analytics" : "Your personal consultation metrics"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => fetchStats(isAdmin)}
                        className="w-9 h-9 rounded-lg border border-black/[0.08] flex items-center justify-center hover:bg-black/[0.03] transition-colors">
                        <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <div className="flex bg-white border border-black/[0.08] rounded-lg p-1 gap-0.5">
                        {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors ${period === p ? "bg-[#1e2328] text-white" : "text-muted-foreground hover:text-[#333a42]"}`}>
                                {PERIOD_LABELS[p]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-black/[0.06] p-5 animate-pulse h-24" />
                    ))}
                </div>
            ) : stats ? (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total Bookings" value={stats.total_bookings}
                            sub={`${stats.this_period_bookings} this ${period}`}
                            icon={<BarChart2 className="w-5 h-5" />}
                            color="text-[#7ebac8]" bg="bg-[#7ebac8]/10" />
                        <StatCard label="Confirmed" value={stats.confirmed}
                            icon={<CheckCircle2 className="w-5 h-5" />}
                            color="text-emerald-600" bg="bg-emerald-50" />
                        <StatCard label="Declined" value={stats.declined}
                            icon={<XCircle className="w-5 h-5" />}
                            color="text-rose-500" bg="bg-rose-50" />
                        <StatCard label="Pending Response" value={stats.pending}
                            icon={<Clock className="w-5 h-5" />}
                            color="text-amber-600" bg="bg-amber-50" />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Acceptance Rate Ring */}
                        <div className="bg-white rounded-xl border border-black/[0.06] p-6 flex flex-col items-center justify-center">
                            <AcceptanceRing rate={stats.acceptance_rate} />
                            <p className="text-[12px] text-muted-foreground text-center mt-2">
                                Based on {stats.confirmed + stats.declined} resolved requests
                            </p>
                        </div>

                        {/* By Concern Bar Chart */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-black/[0.06] p-6">
                            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Top Concerns</p>
                            <p className="text-[15px] font-bold text-[#1e2328] mb-4">Bookings by Presenting Concern</p>
                            <MiniBarChart data={stats.by_concern} />
                        </div>
                    </div>

                    {/* Admin: All Clinicians Table */}
                    {isAdmin && adminData?.clinicians && adminData.clinicians.length > 0 && (
                        <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
                            <div className="px-6 py-4 border-b border-black/[0.04]">
                                <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Team View</p>
                                <p className="text-[15px] font-bold text-[#1e2328]">Clinician Breakdown</p>
                            </div>
                            <div className="divide-y divide-black/[0.04]">
                                <div className="grid grid-cols-[1fr_80px_80px_80px_100px_90px] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-[#fafaf9]">
                                    <span>Clinician</span>
                                    <span className="text-center">Total</span>
                                    <span className="text-center">Confirmed</span>
                                    <span className="text-center">Declined</span>
                                    <span className="text-center">Pending</span>
                                    <span className="text-right">Acceptance</span>
                                </div>
                                {adminData.clinicians.map((c, i) => (
                                    <div key={i} className="grid grid-cols-[1fr_80px_80px_80px_100px_90px] px-6 py-3 items-center hover:bg-[#f7f5f2] transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-[#7ebac8]/15 flex items-center justify-center">
                                                <span className="text-[11px] font-bold text-[#7ebac8]">{c.clinician_name.charAt(0)}</span>
                                            </div>
                                            <span className="text-[13px] font-semibold text-[#1e2328]">{c.clinician_name}</span>
                                        </div>
                                        <span className="text-center text-[13px] font-bold text-[#333a42] tabular-nums">{c.total_bookings}</span>
                                        <span className="text-center text-[13px] font-bold text-emerald-600 tabular-nums">{c.confirmed}</span>
                                        <span className="text-center text-[13px] font-bold text-rose-500 tabular-nums">{c.declined}</span>
                                        <span className="text-center text-[13px] font-bold text-amber-600 tabular-nums">{c.pending}</span>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <div className="w-16 h-1.5 bg-[#f0f0ef] rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${c.acceptance_rate}%` }} />
                                            </div>
                                            <span className="text-[12px] font-bold text-[#333a42] tabular-nums">{c.acceptance_rate}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-xl border border-black/[0.06] p-16 text-center">
                    <TrendingUp className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm font-medium text-[#333a42]">No data yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Stats will appear once bookings are confirmed</p>
                </div>
            )}
        </div>
    );
}
