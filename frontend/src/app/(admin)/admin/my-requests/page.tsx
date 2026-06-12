"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { CalendarCheck, Clock, Mail, Phone, UserRound } from "lucide-react";
import { getApiUrl } from "@/lib/api";

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
    admin_notes?: string;
    video_link?: string;
    status: string;
    submitted_at: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
    new: { label: "New", className: "bg-rose-50 text-rose-700" },
    reviewing: { label: "Reviewing", className: "bg-amber-50 text-amber-700" },
    assigned_to_clinician: { label: "Assigned", className: "bg-sky-50 text-sky-700" },
    awaiting_client: { label: "Awaiting client", className: "bg-violet-50 text-violet-700" },
    confirmed: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700" },
    declined: { label: "Declined", className: "bg-red-50 text-red-700" },
    waitlisted: { label: "Waitlisted", className: "bg-slate-100 text-slate-700" },
    completed: { label: "Completed", className: "bg-teal-50 text-teal-700" },
};

function StatusBadge({ status }: { status: string }) {
    const item = statusMap[status] || { label: status.replaceAll("_", " "), className: "bg-gray-100 text-gray-600" };
    return <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.className}`}>{item.label}</span>;
}

export default function MyRequestsPage() {
    const { data: session } = useSession();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const token = (session as any)?.accessToken;

    useEffect(() => {
        if (!token) return;
        async function loadRequests() {
            setLoading(true);
            try {
                const res = await fetch(`${getApiUrl()}/api/v1/consultations/bookings/my`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setBookings(await res.json());
            } finally {
                setLoading(false);
            }
        }
        loadRequests();
    }, [token]);

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-[#1e2328] tracking-tight">My Requests</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Consultation requests assigned to you or submitted with your name as the preferred clinician.
                </p>
            </div>

            {loading ? (
                <div className="bg-white border border-black/[0.06] rounded-xl p-8 text-center text-sm text-muted-foreground">
                    Loading requests...
                </div>
            ) : bookings.length === 0 ? (
                <div className="bg-white border border-black/[0.06] rounded-xl p-12 text-center">
                    <CalendarCheck className="w-9 h-9 mx-auto text-muted-foreground/25 mb-3" />
                    <p className="text-sm font-semibold text-[#1e2328]">No requests assigned yet</p>
                    <p className="text-xs text-muted-foreground mt-1">New assignments will appear here after the admin team routes them.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map((booking) => (
                        <article key={booking.id} className="bg-white border border-black/[0.06] rounded-xl p-5">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base font-bold text-[#1e2328]">{booking.first_name} {booking.last_name}</h2>
                                        <StatusBadge status={booking.status} />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Submitted {new Date(booking.submitted_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                                    </p>
                                </div>
                                <div className="text-sm font-semibold text-[#333a42]">
                                    {booking.requested_date} at {booking.requested_time}
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 mt-5">
                                <Info icon={<Mail className="w-4 h-4" />} label="Email" value={booking.email} />
                                <Info icon={<Phone className="w-4 h-4" />} label="Phone" value={booking.phone || "Not provided"} />
                                <Info icon={<UserRound className="w-4 h-4" />} label="Preference" value={booking.therapist_preference || "No preference"} />
                                <Info icon={<Clock className="w-4 h-4" />} label="Session link" value={booking.video_link || "Not added yet"} />
                            </div>

                            {booking.notes && (
                                <div className="mt-5">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Client notes</p>
                                    <p className="text-[13px] text-[#333a42] leading-relaxed bg-[#f7f5f2] rounded-lg p-4 whitespace-pre-wrap">{booking.notes}</p>
                                </div>
                            )}

                            {booking.admin_notes && (
                                <div className="mt-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Internal notes</p>
                                    <p className="text-[13px] text-[#333a42] leading-relaxed bg-[#edf6f8] rounded-lg p-4 whitespace-pre-wrap">{booking.admin_notes}</p>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="bg-[#f7f5f2] rounded-lg p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {icon} {label}
            </p>
            <p className="text-[13px] font-semibold text-[#333a42] break-words">{value}</p>
        </div>
    );
}
