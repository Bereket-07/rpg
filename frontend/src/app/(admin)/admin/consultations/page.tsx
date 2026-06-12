"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/api";
import {
    AlertCircle,
    CalendarCheck,
    CheckCircle2,
    ChevronRight,
    Clock,
    Mail,
    MessageSquare,
    Phone,
    Search,
    Send,
    UserRound,
    X,
    XCircle,
} from "lucide-react";

interface Inquiry {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    subject?: string;
    message: string;
    admin_notes?: string;
    status: string;
    submitted_at: string;
}

interface Booking {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    requested_date: string;
    requested_time: string;
    therapist_preference?: string;
    notes?: string;
    assigned_author_id?: number | null;
    admin_notes?: string;
    video_link?: string;
    status: string;
    submitted_at: string;
    confirmed_at?: string | null;
    declined_at?: string | null;
    last_notified_at?: string | null;
}

interface Author {
    id: number;
    name: string;
    role?: string;
}

type Tab = "inquiries" | "bookings";
type Selected = (Inquiry | Booking) & { type?: Tab };

const bookingStatusMap: Record<string, { label: string; className: string }> = {
    new: { label: "Needs triage", className: "bg-rose-50 text-rose-700" },
    reviewing: { label: "Reviewing", className: "bg-amber-50 text-amber-700" },
    assigned_to_clinician: { label: "Assigned", className: "bg-sky-50 text-sky-700" },
    awaiting_client: { label: "Awaiting client", className: "bg-violet-50 text-violet-700" },
    confirmed: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700" },
    declined: { label: "Declined", className: "bg-red-50 text-red-700" },
    waitlisted: { label: "Waitlisted", className: "bg-slate-100 text-slate-700" },
    completed: { label: "Completed", className: "bg-teal-50 text-teal-700" },
};

const inquiryStatusMap: Record<string, { label: string; className: string }> = {
    new: { label: "New", className: "bg-rose-50 text-rose-700" },
    read: { label: "Read", className: "bg-amber-50 text-amber-700" },
    responded: { label: "Responded", className: "bg-emerald-50 text-emerald-700" },
};

function StatusBadge({ status, type }: { status: string; type: Tab }) {
    const map = type === "bookings" ? bookingStatusMap : inquiryStatusMap;
    const item = map[status] || { label: status.replaceAll("_", " "), className: "bg-gray-100 text-gray-600" };
    return (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.className}`}>
            {item.label}
        </span>
    );
}

function daysWaiting(date: string) {
    const created = new Date(date).getTime();
    if (Number.isNaN(created)) return 0;
    return Math.max(0, Math.floor((Date.now() - created) / 86400000));
}

function clientName(item: Inquiry | Booking) {
    return `${item.first_name} ${item.last_name}`;
}

export default function AdminConsultationsPage() {
    const { data: session } = useSession();
    const [tab, setTab] = useState<Tab>("bookings");
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Selected | null>(null);
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);
    const token = (session as any)?.accessToken;

    const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    async function loadAll() {
        if (!token) return;
        setLoading(true);
        try {
            const [inqRes, bookRes, authorRes] = await Promise.all([
                fetch(`${getApiUrl()}/api/v1/consultations/inquiries`, { headers }),
                fetch(`${getApiUrl()}/api/v1/consultations/bookings`, { headers }),
                fetch(`${getApiUrl()}/api/v1/authors/?team_only=true`),
            ]);
            if (inqRes.ok) setInquiries(await inqRes.json());
            if (bookRes.ok) setBookings(await bookRes.json());
            if (authorRes.ok) setAuthors(await authorRes.json());
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAll();
    }, [token]);

    async function patchRecord(type: Tab, id: number, body: Record<string, unknown>, closeAfter = false) {
        setSaving(true);
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/consultations/${type}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...headers },
                body: JSON.stringify(body),
            });
            const updated = res.ok ? await res.json() : null;
            await loadAll();
            setSelected(closeAfter ? null : updated ? { ...updated, type } : selected);
        } finally {
            setSaving(false);
        }
    }

    const waitingBookings = bookings.filter((b) => !["confirmed", "declined", "completed"].includes(b.status));
    const overdueBookings = waitingBookings.filter((b) => daysWaiting(b.submitted_at) >= 2).length;
    const newInquiries = inquiries.filter((i) => i.status === "new").length;
    const newBookings = bookings.filter((b) => b.status === "new").length;
    const oldestBooking = waitingBookings.reduce<Booking | null>((oldest, current) => {
        if (!oldest) return current;
        return new Date(current.submitted_at) < new Date(oldest.submitted_at) ? current : oldest;
    }, null);

    const filteredInquiries = inquiries.filter((i) =>
        !search || `${i.first_name} ${i.last_name} ${i.email} ${i.subject}`.toLowerCase().includes(search.toLowerCase())
    );
    const filteredBookings = bookings.filter((b) =>
        !search || `${b.first_name} ${b.last_name} ${b.email} ${b.therapist_preference}`.toLowerCase().includes(search.toLowerCase())
    );

    const selectedType = selected?.type || tab;
    const selectedBooking = selectedType === "bookings" ? (selected as Booking) : null;
    const selectedInquiry = selectedType === "inquiries" ? (selected as Inquiry) : null;
    const assignedAuthorName = selectedBooking?.assigned_author_id
        ? authors.find((author) => author.id === selectedBooking.assigned_author_id)?.name
        : null;

    return (
        <div className="space-y-6 max-w-6xl">
            <div>
                <h1 className="text-2xl font-bold text-[#1e2328] tracking-tight">Consultation Workflow</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Triage requests, assign clinicians, confirm clients, and keep internal notes in one place.
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <div className="bg-white border border-black/[0.06] rounded-lg p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Needs triage</p>
                    <p className="mt-2 text-2xl font-bold text-[#1e2328]">{newBookings}</p>
                    <p className="text-xs text-muted-foreground">New booking requests waiting for first action</p>
                </div>
                <div className="bg-white border border-black/[0.06] rounded-lg p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Follow-up risk</p>
                    <p className="mt-2 text-2xl font-bold text-[#1e2328]">{overdueBookings}</p>
                    <p className="text-xs text-muted-foreground">Open requests waiting 2+ days</p>
                </div>
                <div className="bg-white border border-black/[0.06] rounded-lg p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Oldest open request</p>
                    <p className="mt-2 text-base font-bold text-[#1e2328] truncate">
                        {oldestBooking ? clientName(oldestBooking) : "All clear"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {oldestBooking ? `${daysWaiting(oldestBooking.submitted_at)} day(s) waiting` : "No active booking backlog"}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1 bg-white border border-black/[0.07] rounded-lg p-1 w-fit">
                    <button
                        onClick={() => setTab("bookings")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold transition-colors ${tab === "bookings" ? "bg-[#1e2328] text-white shadow-sm" : "text-muted-foreground hover:text-[#333a42]"}`}
                    >
                        <CalendarCheck className="w-3.5 h-3.5" /> Booking Requests
                        {newBookings > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newBookings}</span>}
                    </button>
                    <button
                        onClick={() => setTab("inquiries")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold transition-colors ${tab === "inquiries" ? "bg-[#1e2328] text-white shadow-sm" : "text-muted-foreground hover:text-[#333a42]"}`}
                    >
                        <MessageSquare className="w-3.5 h-3.5" /> Contact Inquiries
                        {newInquiries > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newInquiries}</span>}
                    </button>
                </div>

                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or clinician..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-black/[0.07] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40 placeholder:text-muted-foreground/60"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
                ) : tab === "bookings" ? (
                    filteredBookings.length === 0 ? (
                        <EmptyState icon={<CalendarCheck className="w-8 h-8" />} text="No booking requests yet" />
                    ) : (
                        <div className="divide-y divide-black/[0.04]">
                            {filteredBookings.map((book) => (
                                <button
                                    key={book.id}
                                    onClick={() => setSelected({ ...book, type: "bookings" })}
                                    className="w-full grid grid-cols-[auto_1fr_auto] gap-4 px-5 py-4 hover:bg-[#f7f5f2] transition-colors text-left group"
                                >
                                    <div className={`mt-1 w-2 h-2 rounded-full ${book.status === "new" ? "bg-rose-500" : book.status === "confirmed" ? "bg-emerald-500" : "bg-sky-400"}`} />
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-[13px] font-bold text-[#1e2328] truncate">{clientName(book)}</p>
                                            {daysWaiting(book.submitted_at) >= 2 && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                                    <AlertCircle className="w-3 h-3" /> {daysWaiting(book.submitted_at)}d
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                            {book.requested_date} at {book.requested_time}
                                            {book.therapist_preference && ` - ${book.therapist_preference}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <StatusBadge status={book.status} type="bookings" />
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-[#7ebac8] transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )
                ) : filteredInquiries.length === 0 ? (
                    <EmptyState icon={<MessageSquare className="w-8 h-8" />} text="No inquiries yet" />
                ) : (
                    <div className="divide-y divide-black/[0.04]">
                        {filteredInquiries.map((inq) => (
                            <button
                                key={inq.id}
                                onClick={() => setSelected({ ...inq, type: "inquiries" })}
                                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#f7f5f2] transition-colors text-left group"
                            >
                                <div className={`w-2 h-2 rounded-full shrink-0 ${inq.status === "new" ? "bg-rose-500" : inq.status === "read" ? "bg-amber-400" : "bg-emerald-400"}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-[#1e2328] truncate">{clientName(inq)}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{inq.subject || "General Inquiry"} - {inq.email}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <StatusBadge status={inq.status} type="inquiries" />
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-[#7ebac8] transition-colors" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 flex">
                    <button className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} aria-label="Close details" />
                    <div className="w-full max-w-[460px] bg-white shadow-2xl flex flex-col overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    {selectedType === "bookings" ? "Booking Request" : "Contact Inquiry"}
                                </p>
                                <h3 className="font-bold text-[15px] text-[#1e2328]">{clientName(selected)}</h3>
                            </div>
                            <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full hover:bg-black/[0.06] flex items-center justify-center">
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="flex-1 px-6 py-5 space-y-5">
                            <div className="space-y-2">
                                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-[13px] text-[#7ebac8] font-medium hover:underline">
                                    <Mail className="w-3.5 h-3.5" /> {selected.email}
                                </a>
                                {selectedBooking?.phone && (
                                    <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                                        <Phone className="w-3.5 h-3.5" /> {selectedBooking.phone}
                                    </p>
                                )}
                                <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    Submitted {new Date(selected.submitted_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                                </p>
                            </div>

                            <StatusBadge status={selected.status} type={selectedType} />

                            {selectedInquiry && (
                                <>
                                    {selectedInquiry.subject && <Field label="Subject" value={selectedInquiry.subject} />}
                                    <TextBlock label="Message" value={selectedInquiry.message} />
                                </>
                            )}

                            {selectedBooking && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Date" value={selectedBooking.requested_date} framed />
                                        <Field label="Time" value={selectedBooking.requested_time} framed />
                                    </div>
                                    <Field label="Requested clinician" value={selectedBooking.therapist_preference || "No preference"} />
                                    <Field label="Assigned clinician" value={assignedAuthorName || "Not assigned yet"} />
                                    {selectedBooking.notes && <TextBlock label="Client notes" value={selectedBooking.notes} />}

                                    <div>
                                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                            Assign clinician
                                        </label>
                                        <select
                                            value={selectedBooking.assigned_author_id || ""}
                                            onChange={(e) => setSelected({ ...selectedBooking, type: "bookings", assigned_author_id: e.target.value ? Number(e.target.value) : null })}
                                            className="w-full bg-white border border-black/[0.08] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40"
                                        >
                                            <option value="">Choose clinician</option>
                                            {authors.map((author) => (
                                                <option key={author.id} value={author.id}>{author.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                            Session link
                                        </label>
                                        <input
                                            value={selectedBooking.video_link || ""}
                                            onChange={(e) => setSelected({ ...selectedBooking, type: "bookings", video_link: e.target.value })}
                                            placeholder="Optional Zoom, Meet, or intake link"
                                            className="w-full bg-white border border-black/[0.08] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                    Internal notes
                                </label>
                                <textarea
                                    value={selected.admin_notes || ""}
                                    onChange={(e) => setSelected({ ...selected, admin_notes: e.target.value })}
                                    rows={4}
                                    placeholder="Private team notes. These are not emailed to the client."
                                    className="w-full bg-[#f7f5f2] border border-black/[0.05] rounded-lg px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t shrink-0 space-y-2">
                            <button
                                disabled={saving}
                                onClick={() => patchRecord(selectedType, selected.id, {
                                    admin_notes: selected.admin_notes || "",
                                    ...(selectedBooking ? {
                                        assigned_author_id: selectedBooking.assigned_author_id || null,
                                        video_link: selectedBooking.video_link || null,
                                    } : {}),
                                })}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-black/[0.1] hover:bg-gray-50 text-[#333a42] rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Save Internal Details
                            </button>

                            {selectedType === "inquiries" ? (
                                <>
                                    <a
                                        href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selectedInquiry?.subject || "Your Inquiry")}`}
                                        onClick={() => patchRecord("inquiries", selected.id, { status: "responded" }, true)}
                                        className="w-full flex items-center justify-center gap-2 bg-[#7ebac8] hover:bg-[#6aaab8] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
                                    >
                                        <Mail className="w-4 h-4" /> Reply and Mark Responded
                                    </a>
                                    {selected.status === "new" && (
                                        <button
                                            disabled={saving}
                                            onClick={() => patchRecord("inquiries", selected.id, { status: "read" })}
                                            className="w-full flex items-center justify-center gap-2 bg-white border border-black/[0.1] hover:bg-gray-50 text-[#333a42] rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Mark as Read
                                        </button>
                                    )}
                                </>
                            ) : selectedBooking && (
                                <div className="grid grid-cols-2 gap-2">
                                    <WorkflowButton label="Reviewing" onClick={() => patchRecord("bookings", selected.id, { status: "reviewing" })} disabled={saving} />
                                    <WorkflowButton
                                        label="Assign & Notify"
                                        icon={<Send className="w-4 h-4" />}
                                        onClick={() => patchRecord("bookings", selected.id, {
                                            status: "assigned_to_clinician",
                                            assigned_author_id: selectedBooking.assigned_author_id || null,
                                            video_link: selectedBooking.video_link || null,
                                            admin_notes: selectedBooking.admin_notes || "",
                                        })}
                                        disabled={saving || !selectedBooking.assigned_author_id}
                                    />
                                    <WorkflowButton label="Awaiting Client" onClick={() => patchRecord("bookings", selected.id, { status: "awaiting_client" })} disabled={saving} />
                                    <WorkflowButton label="Waitlist" onClick={() => patchRecord("bookings", selected.id, { status: "waitlisted" })} disabled={saving} />
                                    <button
                                        disabled={saving}
                                        onClick={() => patchRecord("bookings", selected.id, {
                                            status: "confirmed",
                                            assigned_author_id: selectedBooking.assigned_author_id || null,
                                            video_link: selectedBooking.video_link || null,
                                            admin_notes: selectedBooking.admin_notes || "",
                                        })}
                                        className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Confirm & Notify
                                    </button>
                                    <button
                                        disabled={saving}
                                        onClick={() => patchRecord("bookings", selected.id, { status: "declined", admin_notes: selectedBooking.admin_notes || "" })}
                                        className="flex items-center justify-center gap-2 bg-white border border-black/[0.1] hover:bg-red-50 text-red-600 rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" /> Decline & Notify
                                    </button>
                                    <WorkflowButton label="Completed" onClick={() => patchRecord("bookings", selected.id, { status: "completed" })} disabled={saving} className="col-span-2" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
    return (
        <div className="p-12 text-center">
            <div className="text-muted-foreground/20 mx-auto mb-2 flex justify-center">{icon}</div>
            <p className="text-sm text-muted-foreground">{text}</p>
        </div>
    );
}

function Field({ label, value, framed = false }: { label: string; value: string; framed?: boolean }) {
    return (
        <div className={framed ? "bg-[#f7f5f2] rounded-lg p-3" : ""}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
            <p className="text-[13px] font-semibold text-[#333a42]">{value}</p>
        </div>
    );
}

function TextBlock({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</p>
            <p className="text-[13px] text-[#333a42] leading-relaxed bg-[#f7f5f2] rounded-lg p-4 whitespace-pre-wrap">{value}</p>
        </div>
    );
}

function WorkflowButton({
    label,
    onClick,
    disabled,
    icon = <UserRound className="w-4 h-4" />,
    className = "",
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    icon?: ReactNode;
    className?: string;
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`flex items-center justify-center gap-2 bg-white border border-black/[0.1] hover:bg-gray-50 text-[#333a42] rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${className}`}
        >
            {icon} {label}
        </button>
    );
}
