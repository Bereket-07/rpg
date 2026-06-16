"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, Plus, X, Loader2, CalendarDays, Ban } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface BlockedSlot {
    id: number;
    author_id: number;
    blocked_date: string;
    start_time: string | null;
    end_time: string | null;
    is_full_day: boolean;
    reason: string | null;
}

interface Booking {
    id: number;
    requested_date: string;
    requested_time: string;
    first_name: string;
    last_name: string;
    status: string;
}

const TIME_OPTIONS = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM",
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MyCalendarPage() {
    const { data: session } = useSession();
    const [today] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockForm, setBlockForm] = useState({
        blocked_date: "",
        is_full_day: true,
        start_time: "09:00 AM",
        end_time: "05:00 PM",
        reason: "",
    });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const token = (session as any)?.accessToken;
    const authorId = (session as any)?.user?.author_id;
    const isAdmin = (session as any)?.user?.role === "ADMIN";

    const monthKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`;

    const loadData = useCallback(async () => {
        if (!token || !authorId) return;
        setLoading(true);
        try {
            const [slotsRes, bookRes] = await Promise.all([
                fetch(`${getApiUrl()}/api/v1/availability/${authorId}/blocked-slots?month=${monthKey}`,
                    { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${getApiUrl()}/api/v1/consultations/bookings`,
                    { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            if (slotsRes.ok) setBlockedSlots(await slotsRes.json());
            if (bookRes.ok) {
                const all: Booking[] = await bookRes.json();
                setBookings(all.filter(b =>
                    (b.status === "confirmed" || b.status === "completed") &&
                    b.requested_date?.startsWith(monthKey)
                ));
            }
        } finally { setLoading(false); }
    }, [token, authorId, monthKey]);

    useEffect(() => { loadData(); }, [loadData]);

    function prevMonth() {
        setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    }
    function nextMonth() {
        setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    }

    function getCalendarDays() {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (number | null)[] = Array(firstDay).fill(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        while (days.length % 7 !== 0) days.push(null);
        return days;
    }

    function dateStr(day: number) {
        return `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    function blocksForDay(day: number) {
        return blockedSlots.filter(b => b.blocked_date === dateStr(day));
    }

    function bookingsForDay(day: number) {
        return bookings.filter(b => b.requested_date === dateStr(day));
    }

    function openBlockModal(day: number) {
        setBlockForm(f => ({ ...f, blocked_date: dateStr(day) }));
        setSaveError("");
        setShowBlockModal(true);
    }

    async function handleBlock(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true); setSaveError("");
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/availability/${authorId}/blocked-slots`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    blocked_date: blockForm.blocked_date,
                    is_full_day: blockForm.is_full_day,
                    start_time: blockForm.is_full_day ? null : blockForm.start_time,
                    end_time: blockForm.is_full_day ? null : blockForm.end_time,
                    reason: blockForm.reason || null,
                }),
            });
            if (res.ok) {
                setShowBlockModal(false);
                await loadData();
            } else {
                const d = await res.json();
                setSaveError(d.detail || "Failed to save block");
            }
        } catch { setSaveError("Connection error"); }
        finally { setSaving(false); }
    }

    async function deleteBlock(slotId: number) {
        if (!confirm("Remove this block?")) return;
        await fetch(`${getApiUrl()}/api/v1/availability/${authorId}/blocked-slots/${slotId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        await loadData();
    }

    const calDays = getCalendarDays();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e2328] tracking-tight">My Calendar</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your schedule and block unavailable times</p>
                </div>
                <button
                    onClick={() => { setBlockForm(f => ({ ...f, blocked_date: todayStr })); setSaveError(""); setShowBlockModal(true); }}
                    className="flex items-center gap-2 bg-[#7ebac8] hover:bg-[#6aaab8] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Block Time
                </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 text-[12px] text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#7ebac8]" /><span>Confirmed session</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-rose-400" /><span>Blocked / Unavailable</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-[#1e2328]" /><span>Today</span></div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
                {/* Month nav */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.05]">
                    <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] flex items-center justify-center transition-colors">
                        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <h2 className="text-[15px] font-bold text-[#1e2328]">
                        {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </h2>
                    <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-black/[0.04]">
                    {DAY_NAMES.map(d => (
                        <div key={d} className="text-center py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">Loading calendar…</div>
                ) : (
                    <div className="grid grid-cols-7">
                        {calDays.map((day, idx) => {
                            if (!day) return <div key={idx} className="min-h-[90px] border-b border-r border-black/[0.03] bg-[#fafaf9]" />;
                            const ds = dateStr(day);
                            const isToday = ds === todayStr;
                            const dayBlocks = blocksForDay(day);
                            const dayBookings = bookingsForDay(day);
                            const hasFullDayBlock = dayBlocks.some(b => b.is_full_day);

                            return (
                                <div key={idx}
                                    className={`min-h-[90px] border-b border-r border-black/[0.03] p-1.5 relative group transition-colors cursor-pointer
                                        ${hasFullDayBlock ? "bg-rose-50" : "hover:bg-[#f7f5f2]"}`}
                                    onClick={() => setSelectedDay(ds === selectedDay ? null : ds)}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold mb-1
                                        ${isToday ? "bg-[#1e2328] text-white" : "text-[#333a42]"}`}>
                                        {day}
                                    </div>

                                    {/* Booking pills */}
                                    {dayBookings.slice(0, 2).map(b => (
                                        <div key={b.id} className="text-[10px] bg-[#7ebac8] text-white rounded px-1 py-0.5 mb-0.5 truncate font-medium">
                                            {b.requested_time} · {b.first_name}
                                        </div>
                                    ))}
                                    {dayBookings.length > 2 && (
                                        <div className="text-[10px] text-[#7ebac8] font-semibold">+{dayBookings.length - 2} more</div>
                                    )}

                                    {/* Block pills */}
                                    {dayBlocks.slice(0, 1).map(b => (
                                        <div key={b.id} className="flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 rounded px-1 py-0.5 mb-0.5 font-medium">
                                            <Ban className="w-2.5 h-2.5" />
                                            <span className="truncate">{b.is_full_day ? "Full day" : `${b.start_time}–${b.end_time}`}</span>
                                        </div>
                                    ))}

                                    {/* Quick add button */}
                                    <button
                                        onClick={e => { e.stopPropagation(); openBlockModal(day); }}
                                        className="absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/[0.06] hover:bg-black/[0.12]"
                                    >
                                        <Plus className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Day detail panel */}
            {selectedDay && (() => {
                const dayBlocks = blockedSlots.filter(b => b.blocked_date === selectedDay);
                const dayBookings = bookings.filter(b => b.requested_date === selectedDay);
                const label = new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
                return (
                    <div className="bg-white rounded-xl border border-black/[0.06] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-[15px] text-[#1e2328]">{label}</h3>
                            <button onClick={() => setSelectedDay(null)} className="w-7 h-7 rounded-full hover:bg-black/[0.06] flex items-center justify-center">
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        {dayBookings.length === 0 && dayBlocks.length === 0 && (
                            <p className="text-sm text-muted-foreground">No sessions or blocks on this day.</p>
                        )}

                        {dayBookings.map(b => (
                            <div key={b.id} className="flex items-center gap-3 py-2.5 border-b border-black/[0.04] last:border-0">
                                <div className="w-2 h-2 rounded-full bg-[#7ebac8] shrink-0" />
                                <div>
                                    <p className="text-[13px] font-semibold text-[#1e2328]">{b.requested_time} — {b.first_name} {b.last_name}</p>
                                    <p className="text-[11px] text-emerald-600 font-medium capitalize">{b.status}</p>
                                </div>
                            </div>
                        ))}

                        {dayBlocks.map(b => (
                            <div key={b.id} className="flex items-center justify-between py-2.5 border-b border-black/[0.04] last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                                    <div>
                                        <p className="text-[13px] font-semibold text-[#1e2328]">
                                            {b.is_full_day ? "Full Day Block" : `${b.start_time} – ${b.end_time}`}
                                        </p>
                                        {b.reason && <p className="text-[11px] text-muted-foreground">{b.reason}</p>}
                                    </div>
                                </div>
                                <button onClick={() => deleteBlock(b.id)}
                                    className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold transition-colors">
                                    Remove
                                </button>
                            </div>
                        ))}

                        <button onClick={() => openBlockModal(parseInt(selectedDay.split("-")[2]))}
                            className="mt-3 text-[12px] text-[#7ebac8] hover:text-[#5a9aaa] font-semibold flex items-center gap-1 transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Add block for this day
                        </button>
                    </div>
                );
            })()}

            {/* Block Time Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !saving && setShowBlockModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Availability</p>
                                <h3 className="font-bold text-[16px] text-[#1e2328]">Block Time Off</h3>
                            </div>
                            <button onClick={() => setShowBlockModal(false)} className="w-8 h-8 rounded-full hover:bg-black/[0.06] flex items-center justify-center">
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleBlock} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#333a42] uppercase tracking-wider">Date</label>
                                <input type="date" required value={blockForm.blocked_date}
                                    onChange={e => setBlockForm(f => ({ ...f, blocked_date: e.target.value }))}
                                    className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                            </div>

                            <div className="flex items-center gap-3 bg-[#f7f5f2] rounded-lg px-4 py-3">
                                <input type="checkbox" id="full_day" checked={blockForm.is_full_day}
                                    onChange={e => setBlockForm(f => ({ ...f, is_full_day: e.target.checked }))}
                                    className="w-4 h-4 accent-[#7ebac8]" />
                                <label htmlFor="full_day" className="text-[13px] font-semibold text-[#333a42] cursor-pointer">
                                    Full day — block all time slots
                                </label>
                            </div>

                            {!blockForm.is_full_day && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#333a42] uppercase tracking-wider">From</label>
                                        <select value={blockForm.start_time}
                                            onChange={e => setBlockForm(f => ({ ...f, start_time: e.target.value }))}
                                            className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40 bg-white">
                                            {TIME_OPTIONS.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#333a42] uppercase tracking-wider">To</label>
                                        <select value={blockForm.end_time}
                                            onChange={e => setBlockForm(f => ({ ...f, end_time: e.target.value }))}
                                            className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40 bg-white">
                                            {TIME_OPTIONS.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#333a42] uppercase tracking-wider">Reason (optional)</label>
                                <input value={blockForm.reason}
                                    onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))}
                                    placeholder="e.g. Conference, Personal leave, Training…"
                                    className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                            </div>

                            {saveError && <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}

                            <button type="submit" disabled={saving}
                                className="w-full bg-[#1e2328] hover:bg-[#2a3038] text-white rounded-lg py-3 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><CalendarDays className="w-4 h-4" /> Block This Time</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
