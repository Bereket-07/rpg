"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { getApiUrl } from "@/lib/api";

// SimplePractice practice-wide widget constants
const SP_SCOPE_ID = "64787fd5-84f6-42ba-9955-816d91404e11";
const SP_APP_ID   = "7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b";
const SP_BASE_URL = "https://reframe.clientsecure.me";

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


    return (
        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#4a535e]">

            {/* ── Hero ───────────────────────────────────────────────────── */}
            <section className="bg-white border-b border-black/[0.05] pt-20 pb-16 px-6 text-center">
                <p className="text-[11px] tracking-[0.28em] uppercase font-bold text-[#7ebac8] mb-4">{intakeTagline}</p>
                <h1 className="text-[24px] sm:text-[30px] lg:text-[38px] sm:text-[52px] font-serif text-[#333a42] font-normal tracking-tight leading-tight">
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
                        <h2 className="text-[21px] sm:text-[23px] lg:text-[26px] sm:text-[30px] font-serif text-[#333a42] font-normal leading-snug">
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

                {/* ── Right: SimplePractice Widget ───────────────────────── */}
                <div className="lg:col-span-7">
                    <div className="bg-white border border-black/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.05)] p-8 sm:p-10 space-y-8">

                        {/* Header */}
                        <div className="space-y-2 pb-6 border-b border-black/[0.05]">
                            <h2 className="text-[19px] sm:text-[22px] lg:text-[24px] sm:text-[28px] font-serif text-[#333a42] font-normal">
                                {formTitle}
                            </h2>
                            <p className="text-[13px] text-[#5c6670]/75 leading-relaxed">
                                {formDesc}
                            </p>
                        </div>

                        {/* SimplePractice contact widget — HIPAA-compliant */}
                        <div className="space-y-4">
                            <p className="text-[13px] text-[#5c6670] leading-relaxed">
                                Our intake form is securely managed through SimplePractice, our HIPAA-compliant client portal. Click below to submit your inquiry safely.
                            </p>

                            {/* Contact form button */}
                            <a
                                href={SP_BASE_URL}
                                data-spwidget-scope-id={SP_SCOPE_ID}
                                data-spwidget-scope-uri="reframe"
                                data-spwidget-application-id={SP_APP_ID}
                                data-spwidget-channel="embedded_widget"
                                data-spwidget-type="Contact form"
                                data-spwidget-contact
                                data-spwidget-scope-global
                                data-spwidget-autobind
                                className="w-full flex items-center justify-center gap-2.5 bg-[#333a42] hover:bg-[#4a535e] text-white font-sans font-semibold text-[14px] tracking-wide py-4 transition-all duration-200 cursor-pointer"
                            >
                                <Mail className="w-4 h-4" />
                                Send a Secure Inquiry
                            </a>

                            {/* Appointment request button */}
                            <a
                                href={SP_BASE_URL}
                                data-spwidget-scope-id={SP_SCOPE_ID}
                                data-spwidget-scope-uri="reframe"
                                data-spwidget-application-id={SP_APP_ID}
                                data-spwidget-type="OAR"
                                data-spwidget-scope-global
                                data-spwidget-autobind
                                className="w-full flex items-center justify-center gap-2.5 bg-[#7ebac8] hover:bg-[#5aabb8] text-white font-sans font-semibold text-[14px] tracking-wide py-4 transition-all duration-200 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                                Request an Appointment
                            </a>

                            <p className="text-[11px] text-[#5c6670]/50 text-center leading-relaxed pt-2">
                                All submissions are encrypted and handled directly through SimplePractice. Your information is never stored on this website.
                            </p>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
}
