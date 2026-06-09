"use client";

import { useState, useEffect } from "react";
import {
    Sparkles, TrendingUp, HelpCircle, Bell, Lightbulb,
    Users, Mail, FileText, Calendar, RefreshCw, AlertTriangle,
    CheckCircle2, Info, ChevronRight, Loader2
} from "lucide-react";

interface Insight {
    summary: string;
    faq: { question: string; frequency: string; suggestion: string }[];
    trends: { label: string; insight: string; action: string }[];
    alerts: { type: "info" | "warning" | "success"; message: string }[];
    recommendations: string[];
    highlights: { totalClients: number; subscribers: number; articles: number; clinicians: number };
}

const ALERT_ICONS = {
    info: <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
};
const ALERT_BG = { info: "bg-blue-50 border-blue-200", warning: "bg-amber-50 border-amber-200", success: "bg-emerald-50 border-emerald-200" };
const ALERT_TEXT = { info: "text-blue-700", warning: "text-amber-700", success: "text-emerald-700" };
const FREQ_COLOR: Record<string, string> = { High: "bg-rose-100 text-rose-600", Medium: "bg-amber-100 text-amber-600", Low: "bg-emerald-100 text-emerald-600" };

export default function InsightsPage() {
    const [data, setData] = useState<Insight | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    async function fetchInsights() {
        setLoading(true); setError("");
        try {
            const res = await fetch("/api/insights");
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const json = await res.json();
            setData(json); setLastRefresh(new Date());
        } catch (e: any) {
            setError(e.message || "Failed to load insights");
        } finally { setLoading(false); }
    }

    useEffect(() => { fetchInsights(); }, []);

    const highlights = [
        { icon: <Users className="w-5 h-5" />, label: "Total Clients", value: data?.highlights.totalClients ?? "—", color: "text-[#7ebac8]" },
        { icon: <Mail className="w-5 h-5" />, label: "Subscribers", value: data?.highlights.subscribers ?? "—", color: "text-violet-500" },
        { icon: <FileText className="w-5 h-5" />, label: "Articles", value: data?.highlights.articles ?? "—", color: "text-emerald-500" },
        { icon: <Calendar className="w-5 h-5" />, label: "Clinicians", value: data?.highlights.clinicians ?? "—", color: "text-amber-500" },
    ];

    return (
        <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
            {/* Page header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-[#7ebac8]/15 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-[#7ebac8]" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#1e2328]">AI Insights</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Gemini analyzes your practice data and surfaces what matters most.
                        {lastRefresh && <span className="ml-2 text-[11px] text-muted-foreground/60">Last updated {lastRefresh.toLocaleTimeString()}</span>}
                    </p>
                </div>
                <button onClick={fetchInsights} disabled={loading}
                    className="flex items-center gap-2 text-sm font-semibold text-[#7ebac8] hover:text-[#5fa0af] bg-[#7ebac8]/10 hover:bg-[#7ebac8]/15 px-4 py-2 rounded-xl transition-all disabled:opacity-50">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-[#7ebac8]/10 flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-[#7ebac8] animate-pulse" />
                        </div>
                        <Loader2 className="absolute inset-0 w-16 h-16 text-[#7ebac8]/30 animate-spin" />
                    </div>
                    <p className="text-sm font-medium">Gemini is analyzing your practice data…</p>
                    <p className="text-xs">This takes 5–10 seconds</p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl p-5">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                    <div>
                        <p className="font-semibold text-rose-700 text-sm">Could not load insights</p>
                        <p className="text-xs text-rose-500 mt-0.5">{error} — make sure the backend is running and your Gemini API key is valid.</p>
                    </div>
                </div>
            )}

            {!loading && data && (
                <div className="space-y-6">
                    {/* AI Summary Banner */}
                    <div className="bg-gradient-to-r from-[#1e2328] to-[#2a3540] rounded-2xl p-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#7ebac8]/20 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-[#7ebac8]" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-[#7ebac8] mb-1.5">AI Summary</p>
                            <p className="text-white/90 text-[15px] leading-relaxed">{data.summary}</p>
                        </div>
                    </div>

                    {/* Highlights row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {highlights.map((h, i) => (
                            <div key={i} className="bg-white rounded-xl border border-black/[0.07] p-4 space-y-2 shadow-sm">
                                <div className={`${h.color}`}>{h.icon}</div>
                                <p className="text-2xl font-bold text-[#1e2328]">{h.value}</p>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{h.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Alerts */}
                    {data.alerts.length > 0 && (
                        <div className="space-y-2.5">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Bell className="w-3.5 h-3.5" /> Alerts
                            </p>
                            {data.alerts.map((alert, i) => (
                                <div key={i} className={`flex items-start gap-3 border rounded-xl px-4 py-3 ${ALERT_BG[alert.type]}`}>
                                    {ALERT_ICONS[alert.type]}
                                    <p className={`text-sm font-medium ${ALERT_TEXT[alert.type]}`}>{alert.message}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* FAQ + Trends side by side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* FAQ Patterns */}
                        <div className="bg-white rounded-2xl border border-black/[0.07] p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                                    <HelpCircle className="w-4 h-4 text-violet-500" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-[#1e2328]">FAQ Patterns</p>
                                    <p className="text-[11px] text-muted-foreground">What clients ask most</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {data.faq.map((item, i) => (
                                    <div key={i} className="rounded-xl bg-[#f9f7f4] p-3.5 space-y-1.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-[13px] font-semibold text-[#1e2328] leading-snug">{item.question}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${FREQ_COLOR[item.frequency] || "bg-gray-100 text-gray-600"}`}>
                                                {item.frequency}
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-muted-foreground leading-relaxed">{item.suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trends */}
                        <div className="bg-white rounded-2xl border border-black/[0.07] p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#7ebac8]/10 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-[#7ebac8]" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-[#1e2328]">Trends</p>
                                    <p className="text-[11px] text-muted-foreground">What's happening in your practice</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {data.trends.map((t, i) => (
                                    <div key={i} className="rounded-xl bg-[#f9f7f4] p-3.5 space-y-1.5">
                                        <p className="text-[12px] font-bold text-[#7ebac8] uppercase tracking-wide">{t.label}</p>
                                        <p className="text-[13px] font-semibold text-[#1e2328] leading-snug">{t.insight}</p>
                                        <div className="flex items-start gap-1.5">
                                            <ChevronRight className="w-3 h-3 text-[#7ebac8] shrink-0 mt-0.5" />
                                            <p className="text-[12px] text-muted-foreground">{t.action}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white rounded-2xl border border-black/[0.07] p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Lightbulb className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-[#1e2328]">AI Recommendations</p>
                                <p className="text-[11px] text-muted-foreground">Specific actions to grow and improve</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {data.recommendations.map((rec, i) => (
                                <div key={i} className="flex items-start gap-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
                                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    <p className="text-[13px] text-[#333a42] leading-relaxed">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-[11px] text-muted-foreground/50 pb-4">
                        Analysis powered by Gemini 1.5 Flash · Based on your live practice data
                    </p>
                </div>
            )}
        </div>
    );
}
