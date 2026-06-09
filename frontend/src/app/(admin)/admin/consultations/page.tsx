"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/api";
import {
    CalendarCheck, MessageSquare, X, Mail, Phone,
    Clock, CheckCircle2, XCircle, Circle, ChevronRight, Search
} from "lucide-react";

interface Inquiry {
    id: number; first_name: string; last_name: string; email: string;
    subject?: string; message: string; status: string; submitted_at: string;
}
interface Booking {
    id: number; first_name: string; last_name: string; email: string;
    phone?: string; requested_date: string; requested_time: string;
    therapist_preference?: string; notes?: string; status: string; submitted_at: string;
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; class: string }> = {
        new: { label: "New", class: "bg-rose-50 text-rose-600" },
        read: { label: "Read", class: "bg-amber-50 text-amber-600" },
        responded: { label: "Responded", class: "bg-emerald-50 text-emerald-600" },
        confirmed: { label: "Confirmed", class: "bg-emerald-50 text-emerald-600" },
        declined: { label: "Declined", class: "bg-red-50 text-red-600" },
    };
    const s = map[status] || { label: status, class: "bg-gray-100 text-gray-600" };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.class}`}>{s.label}</span>;
}

export default function AdminConsultationsPage() {
    const { data: session } = useSession();
    const [tab, setTab] = useState<"inquiries" | "bookings">("inquiries");
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Inquiry | Booking | null>(null);
    const [search, setSearch] = useState("");
    const token = (session as any)?.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    async function loadAll() {
        setLoading(true);
        try {
            const [inqRes, bookRes] = await Promise.all([
                fetch(`${getApiUrl()}/api/v1/consultations/inquiries`, { headers }),
                fetch(`${getApiUrl()}/api/v1/consultations/bookings`, { headers }),
            ]);
            if (inqRes.ok) setInquiries(await inqRes.json());
            if (bookRes.ok) setBookings(await bookRes.json());
        } finally { setLoading(false); }
    }

    useEffect(() => { if (token) loadAll(); }, [token]);

    async function updateStatus(type: "inquiries" | "bookings", id: number, status: string) {
        await fetch(`${getApiUrl()}/api/v1/consultations/${type}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify({ status })
        });
        await loadAll();
        setSelected(null);
    }

    const newInquiries = inquiries.filter(i => i.status === "new").length;
    const newBookings = bookings.filter(b => b.status === "new").length;

    const filteredInquiries = inquiries.filter(i =>
        !search || `${i.first_name} ${i.last_name} ${i.email} ${i.subject}`.toLowerCase().includes(search.toLowerCase())
    );
    const filteredBookings = bookings.filter(b =>
        !search || `${b.first_name} ${b.last_name} ${b.email}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#1e2328] tracking-tight">Consultations</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Incoming client contact inquiries and booking requests</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white border border-black/[0.07] rounded-lg p-1 w-fit">
                <button onClick={() => setTab("inquiries")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold transition-colors ${tab === "inquiries" ? "bg-[#1e2328] text-white shadow-sm" : "text-muted-foreground hover:text-[#333a42]"}`}>
                    <MessageSquare className="w-3.5 h-3.5" /> Contact Inquiries
                    {newInquiries > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newInquiries}</span>}
                </button>
                <button onClick={() => setTab("bookings")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold transition-colors ${tab === "bookings" ? "bg-[#1e2328] text-white shadow-sm" : "text-muted-foreground hover:text-[#333a42]"}`}>
                    <CalendarCheck className="w-3.5 h-3.5" /> Booking Requests
                    {newBookings > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newBookings}</span>}
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-black/[0.07] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40 placeholder:text-muted-foreground/60" />
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
                ) : tab === "inquiries" ? (
                    filteredInquiries.length === 0 ? (
                        <div className="p-12 text-center">
                            <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No inquiries yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-black/[0.04]">
                            {filteredInquiries.map(inq => (
                                <button key={inq.id} onClick={() => setSelected(inq)}
                                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#f7f5f2] transition-colors text-left group">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${inq.status === "new" ? "bg-rose-500" : inq.status === "read" ? "bg-amber-400" : "bg-emerald-400"}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-[#1e2328] truncate">{inq.first_name} {inq.last_name}</p>
                                        <p className="text-[11px] text-muted-foreground truncate">{inq.subject || "General Inquiry"} · {inq.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <StatusBadge status={inq.status} />
                                        <span className="text-[11px] text-muted-foreground">
                                            {new Date(inq.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-[#7ebac8] transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )
                ) : (
                    filteredBookings.length === 0 ? (
                        <div className="p-12 text-center">
                            <CalendarCheck className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No booking requests yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-black/[0.04]">
                            {filteredBookings.map(book => (
                                <button key={book.id} onClick={() => setSelected(book)}
                                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#f7f5f2] transition-colors text-left group">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${book.status === "new" ? "bg-rose-500" : book.status === "confirmed" ? "bg-emerald-400" : "bg-gray-300"}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-[#1e2328] truncate">{book.first_name} {book.last_name}</p>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                            {book.requested_date} at {book.requested_time}
                                            {book.therapist_preference && ` · ${book.therapist_preference}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <StatusBadge status={book.status} />
                                        <span className="text-[11px] text-muted-foreground">
                                            {new Date(book.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-[#7ebac8] transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Detail Drawer */}
            {selected && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <div className="w-[420px] bg-white shadow-2xl flex flex-col overflow-y-auto">
                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    {tab === "inquiries" ? "Contact Inquiry" : "Booking Request"}
                                </p>
                                <h3 className="font-bold text-[15px] text-[#1e2328]">
                                    {(selected as Inquiry).first_name} {(selected as Inquiry).last_name}
                                </h3>
                            </div>
                            <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full hover:bg-black/[0.06] flex items-center justify-center">
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="flex-1 px-6 py-5 space-y-5">
                            {/* Contact info */}
                            <div className="space-y-2">
                                <a href={`mailto:${(selected as any).email}`}
                                    className="flex items-center gap-2 text-[13px] text-[#7ebac8] font-medium hover:underline">
                                    <Mail className="w-3.5 h-3.5" /> {(selected as any).email}
                                </a>
                                {(selected as Booking).phone && (
                                    <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                                        <Phone className="w-3.5 h-3.5" /> {(selected as Booking).phone}
                                    </p>
                                )}
                                <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    Submitted {new Date((selected as any).submitted_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <StatusBadge status={(selected as any).status} />
                            </div>

                            {/* Inquiry-specific */}
                            {tab === "inquiries" && (
                                <>
                                    {(selected as Inquiry).subject && (
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Subject</p>
                                            <p className="text-[13px] font-semibold text-[#333a42]">{(selected as Inquiry).subject}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Message</p>
                                        <p className="text-[13px] text-[#333a42] leading-relaxed bg-[#f7f5f2] rounded-lg p-4 whitespace-pre-wrap">
                                            {(selected as Inquiry).message}
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Booking-specific */}
                            {tab === "bookings" && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-[#f7f5f2] rounded-lg p-3">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Date</p>
                                            <p className="text-[13px] font-bold text-[#333a42]">{(selected as Booking).requested_date}</p>
                                        </div>
                                        <div className="bg-[#f7f5f2] rounded-lg p-3">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Time</p>
                                            <p className="text-[13px] font-bold text-[#333a42]">{(selected as Booking).requested_time}</p>
                                        </div>
                                    </div>
                                    {(selected as Booking).therapist_preference && (
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Therapist Preference</p>
                                            <p className="text-[13px] text-[#333a42]">{(selected as Booking).therapist_preference}</p>
                                        </div>
                                    )}
                                    {(selected as Booking).notes && (
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Notes</p>
                                            <p className="text-[13px] text-[#333a42] leading-relaxed bg-[#f7f5f2] rounded-lg p-4">
                                                {(selected as Booking).notes}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-4 border-t shrink-0 space-y-2">
                            {tab === "inquiries" ? (
                                <>
                                    <a href={`mailto:${(selected as any).email}?subject=Re: ${encodeURIComponent((selected as Inquiry).subject || "Your Inquiry")}`}
                                        onClick={() => updateStatus("inquiries", (selected as any).id, "responded")}
                                        className="w-full flex items-center justify-center gap-2 bg-[#7ebac8] hover:bg-[#6aaab8] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors">
                                        <Mail className="w-4 h-4" /> Reply via Email
                                    </a>
                                    {(selected as Inquiry).status === "new" && (
                                        <button onClick={() => updateStatus("inquiries", (selected as any).id, "read")}
                                            className="w-full flex items-center justify-center gap-2 bg-white border border-black/[0.1] hover:bg-gray-50 text-[#333a42] rounded-lg py-2.5 text-sm font-semibold transition-colors">
                                            <CheckCircle2 className="w-4 h-4" /> Mark as Read
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => updateStatus("bookings", (selected as any).id, "confirmed")}
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors">
                                        <CheckCircle2 className="w-4 h-4" /> Confirm
                                    </button>
                                    <button onClick={() => updateStatus("bookings", (selected as any).id, "declined")}
                                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-black/[0.1] hover:bg-red-50 text-red-500 rounded-lg py-2.5 text-sm font-semibold transition-colors">
                                        <XCircle className="w-4 h-4" /> Decline
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}