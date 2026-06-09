"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, HelpCircle } from "lucide-react";
import { getApiUrl } from "@/lib/api";


export default function ContactPage() {
    const [pageTitle, setPageTitle] = useState("Request a Consultation");
    const [pageDesc, setPageDesc] = useState("Ready to start your journey? Fill out our secure contact form to request a consultation with one of our licensed clinical specialists.");
    const [intakeTagline, setIntakeTagline] = useState("Intake & Inquiry");
    
    const [email, setEmail] = useState("care@reframepsychology.com");
    const [phone, setPhone] = useState("(555) 123-4567");
    const [address, setAddress] = useState("Online across California");
    const [hours, setHours] = useState("Mon - Fri, 9:00 AM - 5:00 PM PST.");

    const [emailLabel, setEmailLabel] = useState("Secure Direct Email");
    const [emailSub, setEmailSub] = useState("Encrypted communications portal.");
    const [phoneLabel, setPhoneLabel] = useState("Practice Phone Line");
    const [phoneSub, setPhoneSub] = useState("Mon - Fri, 9:00 AM - 5:00 PM PST.");
    const [addressLabel, setAddressLabel] = useState("Online Operations");
    const [addressSub, setAddressSub] = useState("Serving clients digitally throughout all cities in California.");

    const [qaTitle, setQaTitle] = useState("Is it secure?");
    const [qaDesc, setQaDesc] = useState("Yes! All clinical data and intake document transmissions are handled directly through SimplePractice—our secure, fully encrypted, HIPAA-compliant patient dashboard.");
    const [formTitle, setFormTitle] = useState("Send a Secure Inquiry");
    const [formDesc, setFormDesc] = useState("Please avoid including highly confidential Protected Health Information (PHI) in this public form. Full intakes are managed privately inside SimplePractice.");
    const [formButton, setFormButton] = useState("Send Message");
    const [infoTitle, setInfoTitle] = useState("Get in Touch");
    const [infoDesc, setInfoDesc] = useState("We offer secure, encrypted virtual care across all of California. If you have questions about billing, SimplePractice portals, scheduling, or specific therapists, feel free to drop us a line.");

    useEffect(() => {
        async function fetchContactPageData() {
            try {
                const res = await fetch(`${getApiUrl()}/api/v1/settings/pages/contact`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.hero_title) setPageTitle(data.hero_title);
                    if (data.hero_description) setPageDesc(data.hero_description);
                    
                    const content = data.content || {};
                    if (content.email) setEmail(content.email);
                    if (content.phone) setPhone(content.phone);
                    if (content.address) setAddress(content.address);
                    if (content.hours) setHours(content.hours);

                    if (content.intake_tagline) setIntakeTagline(content.intake_tagline);
                    if (content.email_label) setEmailLabel(content.email_label);
                    if (content.email_sub) setEmailSub(content.email_sub);
                    if (content.phone_label) setPhoneLabel(content.phone_label);
                    if (content.phone_sub) setPhoneSub(content.phone_sub);
                    if (content.address_label) setAddressLabel(content.address_label);
                    if (content.address_sub) setAddressSub(content.address_sub);

                    if (content.qa_title) setQaTitle(content.qa_title);
                    if (content.qa_desc) setQaDesc(content.qa_desc);
                    if (content.form_title) setFormTitle(content.form_title);
                    if (content.form_desc) setFormDesc(content.form_desc);
                    if (content.form_button) setFormButton(content.form_button);
                    if (content.info_title) setInfoTitle(content.info_title);
                    if (content.info_desc) setInfoDesc(content.info_desc);
                }
            } catch (err) {
                console.error("Failed to load contact settings:", err);
            }
        }
        fetchContactPageData();
    }, []);

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const subjectRef = useRef<HTMLInputElement>(null);
    const messageRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true); setSubmitError("");
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/consultations/inquiries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstNameRef.current?.value || "",
                    last_name: lastNameRef.current?.value || "",
                    email: emailRef.current?.value || "",
                    subject: subjectRef.current?.value || "",
                    message: messageRef.current?.value || "",
                })
            });
            if (res.ok) { setSubmitted(true); }
            else { setSubmitError("Something went wrong. Please try again or email us directly."); }
        } catch { setSubmitError("Could not reach the server. Please email us directly."); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#5c6670] pb-24">
            
            {/* Header banner */}
            <section className="bg-white border-b border-black/5 py-16">
                <div className="container mx-auto px-4 max-w-4xl text-center space-y-4">
                    <p className="text-xs tracking-widest uppercase font-semibold text-primary">{intakeTagline}</p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#5c6670] tracking-tight">{pageTitle}</h1>
                    <p className="text-[#5c6670]/80 text-base max-w-xl mx-auto">
                        {pageDesc}
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 max-w-5xl py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Info Block */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-serif text-[#5c6670]">{infoTitle}</h2>
                        <p className="text-sm leading-relaxed text-[#5c6670]/80 text-left">
                            {infoDesc}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4 bg-white p-5 rounded-2xl border border-black/[0.02] shadow-sm text-left">
                            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base text-[#5c6670]">{addressLabel}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{address}</p>
                                {addressSub && <p className="text-[10px] text-muted-foreground mt-0.5">{addressSub}</p>}
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 bg-white p-5 rounded-2xl border border-black/[0.02] shadow-sm text-left">
                            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base text-[#5c6670]">{emailLabel}</h3>
                                <p className="text-sm text-primary font-medium mt-0.5">{email}</p>
                                {emailSub && <p className="text-[10px] text-muted-foreground mt-0.5">{emailSub}</p>}
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 bg-white p-5 rounded-2xl border border-black/[0.02] shadow-sm text-left">
                            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base text-[#5c6670]">{phoneLabel}</h3>
                                <p className="text-sm text-[#5c6670] mt-0.5">{phone}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{hours}</p>
                                {phoneSub && <p className="text-[10px] text-muted-foreground mt-0.5">{phoneSub}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Simple Q&A card */}
                    <div className="bg-[#5c6670] text-white p-6 rounded-3xl space-y-3 relative overflow-hidden text-left">
                        <HelpCircle className="w-6 h-6 text-[#7ebac8] relative z-10" />
                        <h4 className="font-semibold text-sm relative z-10 uppercase tracking-widest text-[#7ebac8]">{qaTitle}</h4>
                        <p className="text-xs leading-relaxed text-white/90 relative z-10">
                            {qaDesc}
                        </p>
                        <div className="absolute right-0 bottom-0 top-0 w-1/4 bg-white/5 skew-x-12 pointer-events-none" />
                    </div>
                </div>

                {/* Form Card Column */}
                <div className="lg:col-span-7">
                    <Card className="border-t-4 border-t-primary rounded-3xl shadow-sm bg-white border-black/[0.02] p-2 sm:p-4">
                        <CardHeader className="text-left">
                            <CardTitle className="text-2xl font-serif text-[#5c6670]">{formTitle}</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                {formDesc}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {submitted ? (
                                <div className="py-10 text-center space-y-3">
                                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                                        <Send className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <p className="font-semibold text-[#5c6670] text-lg">Message Sent!</p>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">Thank you for reaching out. A member of our team will follow up within 24 business hours.</p>
                                </div>
                            ) : (
                            <form className="space-y-5 pt-2" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2 text-left">
                                        <Label htmlFor="first-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First name</Label>
                                        <Input id="first-name" ref={firstNameRef} placeholder="Jane" required className="rounded-md border-black/[0.08] focus-visible:ring-primary focus-visible:ring-1" />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <Label htmlFor="last-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last name</Label>
                                        <Input id="last-name" ref={lastNameRef} placeholder="Doe" required className="rounded-md border-black/[0.08] focus-visible:ring-primary focus-visible:ring-1" />
                                    </div>
                                </div>
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                    <Input id="email" ref={emailRef} type="email" placeholder="jane@example.com" required className="rounded-md border-black/[0.08] focus-visible:ring-primary focus-visible:ring-1" />
                                </div>
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</Label>
                                    <Input id="subject" ref={subjectRef} placeholder="e.g. Schedule Intake, Billing Question..." required className="rounded-md border-black/[0.08] focus-visible:ring-primary focus-visible:ring-1" />
                                </div>
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Inquiry</Label>
                                    <textarea id="message" ref={messageRef}
                                        className="flex min-h-[140px] w-full rounded-md border border-black/[0.08] bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Tell us a little bit about what you are seeking..." required />
                                </div>
                                {submitError && <p className="text-sm text-red-500 font-medium">{submitError}</p>}
                                <Button type="submit" disabled={submitting} className="w-full h-12 text-base font-semibold rounded-sm bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" />
                                    <span>{submitting ? "Sending…" : formButton}</span>
                                </Button>
                            </form>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </section>

        </div>
    );
}