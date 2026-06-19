"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, Phone, MapPin, Send, ShieldCheck, ArrowRight } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function ContactPage() {
    const [pageTitle, setPageTitle]       = useState("Get in Touch");
    const [pageDesc, setPageDesc]         = useState("Contact our team to request a clinical consultation.");
    const [intakeTagline, setIntakeTagline] = useState("Intake & Inquiry");

    const [email, setEmail]     = useState("info@reframepsychology.com");
    const [phone, setPhone]     = useState("(123) 456-7890");
    const [address, setAddress] = useState("Online across California");
    const [hours, setHours]     = useState("Monday – Friday, 9:00 AM – 5:00 PM PST");

    const [emailLabel,   setEmailLabel]   = useState("Secure Direct Email");
    const [emailSub,     setEmailSub]     = useState("Encrypted communications portal.");
    const [phoneLabel,   setPhoneLabel]   = useState("Practice Phone Line");
    const [addressLabel, setAddressLabel] = useState("Online Operations");
    const [addressSub,   setAddressSub]   = useState("Serving clients digitally throughout all cities in California.");

    const [qaTitle,   setQaTitle]   = useState("Is it secure?");
    const [qaDesc,    setQaDesc]    = useState("Yes. All clinical data and intake document transmissions are handled directly through SimplePractice — our secure, fully encrypted, HIPAA-compliant patient dashboard.");
    const [formTitle, setFormTitle] = useState("Send a Secure Inquiry");
    const [formDesc,  setFormDesc]  = useState("Please avoid including highly confidential Protected Health Information (PHI) in this public form. Full intakes are managed privately inside SimplePractice.");
    const [formButton, setFormButton] = useState("Send Message");
    const [infoTitle, setInfoTitle] = useState("Get in Touch");
    const [infoDesc,  setInfoDesc]  = useState("We offer secure, encrypted virtual care across all of California. If you have questions about billing, SimplePractice portals, scheduling, or specific therapists, feel free to drop us a line.");

    useEffect(() => {
        async function fetchContactPageData() {
            try {
                const res = await fetch(`${getApiUrl()}/api/v1/settings/pages/contact`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.hero_title)       setPageTitle(data.hero_title);
                    if (data.hero_description) setPageDesc(data.hero_description);
                    const c = data.content || {};
                    if (c.email)         setEmail(c.email);
                    if (c.phone)         setPhone(c.phone);
                    if (c.address)       setAddress(c.address);
                    if (c.hours)         setHours(c.hours);
                    if (c.intake_tagline) setIntakeTagline(c.intake_tagline);
                    if (c.email_label)   setEmailLabel(c.email_label);
                    if (c.email_sub)     setEmailSub(c.email_sub);
                    if (c.phone_label)   setPhoneLabel(c.phone_label);
                    if (c.address_label) setAddressLabel(c.address_label);
                    if (c.address_sub)   setAddressSub(c.address_sub);
                    if (c.qa_title)      setQaTitle(c.qa_title);
                    if (c.qa_desc)       setQaDesc(c.qa_desc);
                    if (c.form_title)    setFormTitle(c.form_title);
                    if (c.form_desc)     setFormDesc(c.form_desc);
                    if (c.form_button)   setFormButton(c.form_button);
                    if (c.info_title)    setInfoTitle(c.info_title);
                    if (c.info_desc)     setInfoDesc(c.info_desc);
                }
            } catch (err) {
                console.error("Failed to load contact settings:", err);
            }
        }
        fetchContactPageData();
    }, []);

    const [newsletterOptIn, setNewsletterOptIn] = useState(false);

    const [submitting,   setSubmitting]   = useState(false);
    const [submitted,    setSubmitted]    = useState(false);
    const [submitError,  setSubmitError]  = useState("");
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef  = useRef<HTMLInputElement>(null);
    const emailRef     = useRef<HTMLInputElement>(null);
    const subjectRef   = useRef<HTMLInputElement>(null);
    const messageRef   = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true); setSubmitError("");
        const clientEmail = emailRef.current?.value || "";
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/consultations/inquiries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstNameRef.current?.value || "",
                    last_name:  lastNameRef.current?.value  || "",
                    email:      clientEmail,
                    subject:    subjectRef.current?.value   || "",
                    message:    messageRef.current?.value   || "",
                }),
            });
            if (res.ok) {
                // Subscribe to newsletter if opted in
                if (newsletterOptIn && clientEmail) {
                    try {
                        await fetch(`${getApiUrl()}/api/v1/newsletter/`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: clientEmail }),
                        });
                    } catch { /* newsletter subscription failure is non-blocking */ }
                }
                setSubmitted(true);
            } else {
                setSubmitError("Something went wrong. Please try again or email us directly.");
            }
        } catch {
            setSubmitError("Could not reach the server. Please email us directly.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = "w-full bg-[#faf8f5] border border-[#e2ddd6] text-[#333a42] placeholder:text-[#9aa0a8] text-[14px] px-4 py-3 outline-none focus:border-[#7ebac8] focus:bg-white transition-all duration-200 rounded-none font-sans";
    const labelClass = "block text-[11px] font-bold uppercase tracking-[0.16em] text-[#5c6670] mb-2";

    return (
        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#4a535e]">

            {/* ── Hero ───────────────────────────────────────────────────── */}
            <section className="bg-white border-b border-black/[0.05] pt-20 pb-16 px-6 text-center">
                <p className="text-[11px] tracking-[0.28em] uppercase font-bold text-[#7ebac8] mb-4">{intakeTagline}</p>
                <h1 className="text-[38px] sm:text-[52px] font-serif text-[#333a42] font-normal tracking-tight leading-tight">
                    {pageTitle}
                </h1>
                <p className="text-[15px] sm:text-[17px] text-[#5c6670]/80 mt-4 max-w-md mx-auto leading-relaxed">
                    {pageDesc}
                </p>
            </section>

            {/* ── Main content ───────────────────────────────────────────── */}
            <section className="container mx-auto px-6 max-w-6xl py-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                {/* ── Left: Info panel ───────────────────────────────────── */}
                <div className="lg:col-span-5 space-y-10">

                    {/* Description */}
                    <div className="space-y-3">
                        <h2 className="text-[26px] sm:text-[30px] font-serif text-[#333a42] font-normal leading-snug">
                            {infoTitle}
                        </h2>
                        <div className="w-10 h-[1.5px] bg-[#7ebac8]" />
                        <p className="text-[15px] text-[#5c6670] leading-relaxed">
                            {infoDesc}
                        </p>
                    </div>

                    {/* Contact info rows */}
                    <div className="space-y-0 divide-y divide-black/[0.05]">

                        {/* Address */}
                        <div className="flex items-start gap-5 py-5">
                            <div className="w-10 h-10 rounded-full bg-[#f2ede4] flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin className="w-4 h-4 text-[#5c6670]" />
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-[#333a42] tracking-wide">{addressLabel}</p>
                                <p className="text-[14px] text-[#5c6670] mt-0.5">{address}</p>
                                {addressSub && <p className="text-[12px] text-[#5c6670]/60 mt-0.5">{addressSub}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-5 py-5">
                            <div className="w-10 h-10 rounded-full bg-[#f2ede4] flex items-center justify-center shrink-0 mt-0.5">
                                <Mail className="w-4 h-4 text-[#5c6670]" />
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-[#333a42] tracking-wide">{emailLabel}</p>
                                <a href={`mailto:${email}`} className="text-[14px] text-[#7ebac8] hover:text-[#5aabb8] transition-colors mt-0.5 block">
                                    {email}
                                </a>
                                {emailSub && <p className="text-[12px] text-[#5c6670]/60 mt-0.5">{emailSub}</p>}
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-5 py-5">
                            <div className="w-10 h-10 rounded-full bg-[#f2ede4] flex items-center justify-center shrink-0 mt-0.5">
                                <Phone className="w-4 h-4 text-[#5c6670]" />
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-[#333a42] tracking-wide">{phoneLabel}</p>
                                <p className="text-[14px] text-[#5c6670] mt-0.5">{phone}</p>
                                <p className="text-[12px] text-[#5c6670]/60 mt-0.5">{hours}</p>
                            </div>
                        </div>

                    </div>

                    {/* Security note */}
                    <div className="bg-[#333a42] text-white p-7 space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-[#7ebac8] shrink-0" />
                            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#7ebac8]">{qaTitle}</p>
                        </div>
                        <p className="text-[13px] sm:text-[14px] text-white/80 leading-relaxed">
                            {qaDesc}
                        </p>
                    </div>
                </div>

                {/* ── Right: Form ────────────────────────────────────────── */}
                <div className="lg:col-span-7">
                    <div className="bg-white border border-black/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.05)] p-8 sm:p-10 space-y-8">

                        {/* Form header */}
                        <div className="space-y-2 pb-6 border-b border-black/[0.05]">
                            <h2 className="text-[24px] sm:text-[28px] font-serif text-[#333a42] font-normal">
                                {formTitle}
                            </h2>
                            <p className="text-[13px] text-[#5c6670]/75 leading-relaxed">
                                {formDesc}
                            </p>
                        </div>

                        {submitted ? (
                            <div className="py-14 text-center space-y-5">
                                <div className="w-16 h-16 rounded-full bg-[#f2ede4] flex items-center justify-center mx-auto">
                                    <Send className="w-6 h-6 text-[#7ebac8]" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[20px] font-serif text-[#333a42]">Message Sent</p>
                                    <p className="text-[14px] text-[#5c6670] max-w-xs mx-auto leading-relaxed">
                                        Thank you for reaching out. A member of our team will follow up within 24 business hours.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form className="space-y-6" onSubmit={handleSubmit}>

                                {/* Name row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass} htmlFor="first-name">First Name</label>
                                        <input id="first-name" ref={firstNameRef} type="text" placeholder="Jane" required className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass} htmlFor="last-name">Last Name</label>
                                        <input id="last-name" ref={lastNameRef} type="text" placeholder="Doe" required className={inputClass} />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={labelClass} htmlFor="email-field">Email Address</label>
                                    <input id="email-field" ref={emailRef} type="email" placeholder="jane@example.com" required className={inputClass} />
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className={labelClass} htmlFor="subject">Subject</label>
                                    <input id="subject" ref={subjectRef} type="text" placeholder="e.g. Schedule Intake, Billing Question..." required className={inputClass} />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className={labelClass} htmlFor="message">Your Inquiry</label>
                                    <textarea
                                        id="message"
                                        ref={messageRef}
                                        rows={5}
                                        placeholder="Tell us a little bit about what you are seeking..."
                                        required
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>

                                {/* Newsletter opt-in */}
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative mt-0.5 shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={newsletterOptIn}
                                            onChange={e => setNewsletterOptIn(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-4 h-4 border border-[#e2ddd6] bg-[#faf8f5] peer-checked:bg-[#333a42] peer-checked:border-[#333a42] transition-all duration-150 flex items-center justify-center">
                                            {newsletterOptIn && (
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8" stroke="currentColor" strokeWidth={2}>
                                                    <path d="M1 4l2.5 2.5L9 1" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[13px] text-[#5c6670] leading-snug select-none group-hover:text-[#333a42] transition-colors duration-150">
                                        Subscribe me to the Reframe Psychology newsletter — clinical insights and mental health resources, no spam.
                                    </span>
                                </label>

                                {submitError && (
                                    <p className="text-[13px] text-red-500">{submitError}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[#333a42] hover:bg-[#4a535e] text-white font-semibold text-[14px] tracking-wide h-13 py-4 flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <span className="opacity-70">Sending…</span>
                                    ) : (
                                        <>
                                            <span>{formButton}</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                <p className="text-[11px] text-[#5c6670]/50 text-center leading-relaxed">
                                    By submitting this form you agree to our privacy policy. We will never share your information.
                                </p>
                            </form>
                        )}
                    </div>
                </div>

            </section>
        </div>
    );
}
