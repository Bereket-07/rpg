"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/admin/ImageUploader";
import { Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";


export default function EditAuthorPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [credentials, setCredentials] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    
    // Extended Clinical Bio CMS Fields
    const [role, setRole] = useState("");
    const [beyondTherapy, setBeyondTherapy] = useState("");
    const [approachText, setApproachText] = useState("");
    const [backgroundText, setBackgroundText] = useState("");
    const [specialtiesText, setSpecialtiesText] = useState("");
    const [acceptingNewClients, setAcceptingNewClients] = useState(true);
    const [availabilityTimezone, setAvailabilityTimezone] = useState("America/Los_Angeles");
    const [availableWeekdays, setAvailableWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [consultationModes, setConsultationModes] = useState<string[]>(["Telehealth"]);
    const [intakeNote, setIntakeNote] = useState("");

    const weekdays = [
        { value: 1, label: "Mon" },
        { value: 2, label: "Tue" },
        { value: 3, label: "Wed" },
        { value: 4, label: "Thu" },
        { value: 5, label: "Fri" },
        { value: 6, label: "Sat" },
        { value: 7, label: "Sun" },
    ];
    const consultationModeOptions = ["Telehealth", "In-person", "Hybrid"];

    useEffect(() => {
        let isMounted = true;

        async function fetchAuthor() {
            try {
                const res = await fetch(`${getApiUrl()}/api/v1/authors/${params.id}`);
                if (!res.ok) {
                    throw new Error("Author not found");
                }
                const data = await res.json();

                if (isMounted) {
                    setName(data.name || "");
                    setBio(data.bio || "");
                    setCredentials(data.credentials || "");
                    setProfileImageUrl(data.profile_image_url || "");
                    setRole(data.role || "");
                    setBeyondTherapy(data.beyond_therapy || "");
                    setApproachText(data.approach_paragraphs ? data.approach_paragraphs.join("\n\n") : "");
                    setBackgroundText(data.background_paragraphs ? data.background_paragraphs.join("\n\n") : "");
                    setSpecialtiesText(data.specialties_list ? data.specialties_list.map((s: any) => `${s.title}: ${s.desc}`).join("\n") : "");
                    setAcceptingNewClients(data.accepting_new_clients ?? true);
                    setAvailabilityTimezone(data.availability_timezone || "America/Los_Angeles");
                    setAvailableWeekdays(data.available_weekdays?.length ? data.available_weekdays : [1, 2, 3, 4, 5]);
                    setConsultationModes(data.consultation_modes?.length ? data.consultation_modes : ["Telehealth"]);
                    setIntakeNote(data.intake_note || "");
                }
            } catch (error) {
                console.error(error);
                if (isMounted) {
                    alert("Author not found");
                    router.push("/admin/authors");
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchAuthor();
        return () => { isMounted = false; };
    }, [params.id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const payload = {
            name,
            bio,
            credentials,
            profile_image_url: profileImageUrl || null,
            role: role || null,
            beyond_therapy: beyondTherapy || null,
            approach_paragraphs: approachText ? approachText.split("\n\n").map(p => p.trim()).filter(Boolean) : [],
            background_paragraphs: backgroundText ? backgroundText.split("\n\n").map(p => p.trim()).filter(Boolean) : [],
            specialties_list: specialtiesText ? specialtiesText.split("\n").map(line => {
                const colonIdx = line.indexOf(":");
                if (colonIdx === -1) return { title: line.trim(), desc: "" };
                return {
                    title: line.substring(0, colonIdx).trim(),
                    desc: line.substring(colonIdx + 1).trim()
                };
            }).filter(s => s.title) : [],
            accepting_new_clients: acceptingNewClients,
            availability_timezone: availabilityTimezone,
            available_weekdays: availableWeekdays,
            consultation_modes: consultationModes,
            intake_note: intakeNote || null,
        };

        try {
            const res = await fetch(`${getApiUrl()}/api/v1/authors/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/admin/authors");
                router.refresh();
            } else {
                alert("Failed to update author.");
            }
        } catch (error) {
            alert("Error connecting to server.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Author & Clinician Profile</h1>
                    <p className="text-muted-foreground mt-1">Configure full clinical expertise and custom pages biographies.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Section 1: Standard Author Meta */}
                <Card>
                    <CardHeader>
                        <CardTitle>Core Details</CardTitle>
                        <CardDescription>Primary profile metadata used for blog articles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. Tamara Eromo, Psy.D." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="credentials">Credentials Tagline</Label>
                            <Input id="credentials" value={credentials} onChange={(e) => setCredentials(e.target.value)} placeholder="PEPPERDINE PSY.D. | LICENSED CLINICAL PSYCHOLOGIST (PSY31798)" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Short Biography</Label>
                            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Brief bio snippet for article footer cards..." />
                        </div>
                        <div className="space-y-4">
                            <ImageUploader
                                value={profileImageUrl}
                                onChange={(url) => setProfileImageUrl(url)}
                                label="Profile Portrait Image (Optional)"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Clinical Details for Team Page */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team Profile Settings (Meet the Team Page)</CardTitle>
                        <CardDescription>These options configure the detailed presentation displayed on `/team` page.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Clinical Role</Label>
                            <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Clinical Psychologist, Co-Founder" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="beyondTherapy">Beyond Therapy Description</Label>
                            <Textarea 
                                id="beyondTherapy" 
                                value={beyondTherapy} 
                                onChange={(e) => setBeyondTherapy(e.target.value)} 
                                rows={4} 
                                placeholder="Describe personal insights, family life, hobbies or other details outside clinical practices..." 
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="approachText">Therapeutic Approach</Label>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Separate paragraphs with double Enter</span>
                            </div>
                            <Textarea 
                                id="approachText" 
                                value={approachText} 
                                onChange={(e) => setApproachText(e.target.value)} 
                                rows={8} 
                                placeholder="Enter paragraphs describing your clinical lens, modality, and how you work with patients..." 
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="backgroundText">Background and Education</Label>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Separate paragraphs with double Enter</span>
                            </div>
                            <Textarea 
                                id="backgroundText" 
                                value={backgroundText} 
                                onChange={(e) => setBackgroundText(e.target.value)} 
                                rows={8} 
                                placeholder="Enter paragraphs detailing clinical credentials, university degrees, or teaching roles..." 
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="specialtiesText">Specialty Practice Areas</Label>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">One specialty per line (Format: Title: Description)</span>
                            </div>
                            <Textarea 
                                id="specialtiesText" 
                                value={specialtiesText} 
                                onChange={(e) => setSpecialtiesText(e.target.value)} 
                                rows={8} 
                                placeholder="Couples Therapy: Breaking recurring conflict cycles.&#10;Functional Anxiety: Overthinking and career stress." 
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Availability and Booking</CardTitle>
                        <CardDescription>Controls how this clinician appears in the public booking flow.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <label className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 p-4">
                            <div>
                                <p className="text-sm font-semibold">Accepting new consultation requests</p>
                                <p className="text-xs text-muted-foreground">If off, clients can still view the profile but cannot choose this clinician.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={acceptingNewClients}
                                onChange={(e) => setAcceptingNewClients(e.target.checked)}
                                className="h-5 w-5 accent-[#7ebac8]"
                            />
                        </label>

                        <div className="space-y-2">
                            <Label htmlFor="availabilityTimezone">Timezone</Label>
                            <Input
                                id="availabilityTimezone"
                                value={availabilityTimezone}
                                onChange={(e) => setAvailabilityTimezone(e.target.value)}
                                placeholder="America/Los_Angeles"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Available request days</Label>
                            <div className="flex flex-wrap gap-2">
                                {weekdays.map(day => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => setAvailableWeekdays(days => days.includes(day.value) ? days.filter(d => d !== day.value) : [...days, day.value].sort((a, b) => a - b))}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${availableWeekdays.includes(day.value) ? "bg-[#7ebac8] text-white border-[#7ebac8]" : "bg-white text-muted-foreground border-black/[0.08]"}`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Consultation modes</Label>
                            <div className="flex flex-wrap gap-2">
                                {consultationModeOptions.map(mode => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setConsultationModes(modes => modes.includes(mode) ? modes.filter(m => m !== mode) : [...modes, mode])}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${consultationModes.includes(mode) ? "bg-[#1e2328] text-white border-[#1e2328]" : "bg-white text-muted-foreground border-black/[0.08]"}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="intakeNote">Public intake note</Label>
                            <Textarea
                                id="intakeNote"
                                value={intakeNote}
                                onChange={(e) => setIntakeNote(e.target.value)}
                                rows={3}
                                placeholder="Example: Currently offering telehealth consultations on weekday afternoons."
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Update Clinician Profile"}</Button>
                </div>
            </form>
        </div>
    );
}
