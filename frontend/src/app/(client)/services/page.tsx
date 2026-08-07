import { getApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

async function getServicesPageData() {
    try {
        const res = await fetch(`${getApiUrl()}/api/v1/settings/pages/services`, {
            cache: "no-store",
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error("Failed to load dynamic services content from database:", err);
        return null;
    }
}

export default async function ServicesPage() {
    const pageData = await getServicesPageData();

    const heroTitle = pageData?.hero_title || "Telehealth Services";
    const heroImg = pageData?.hero_image_url || "/assets/RPG_Images for UI/asian-senior-older-woman-video-call-with-doctor-in-2026-03-16-04-23-55-utc.jpg";

    const feesTitle = pageData?.content?.fees_title || "Fees";
    const feesSubtitle = pageData?.content?.fees_subtitle || "Please review our team members and the standard fee for their services.\nLimited sliding scale fees when available.";
    const oonPara1 = pageData?.content?.oon_para1 || "Reframe Psychology Group is an out-of-network provider. This means that our therapists cannot bill your insurance company directly.";
    const oonPara2 = pageData?.content?.oon_para2 || "We have chosen to practice independently of insurance companies in order to provide you with care that is based on your specific therapy goals and not on the limitations imposed by insurance companies. However, at your request, we will gladly generate a “superbill” that will include an itemized list of services and their insurance codes so that you can submit to your insurance company for out-of-network reimbursement.";
    const reimbursementInfo = pageData?.content?.reimbursement_info || "Your insurance company and your particular coverage determine if and how you can be reimbursed. At your request, we will do our best to provide information that will support your claim.";

    return (
        <div className="min-h-screen bg-[#F0EAE2] font-sans text-[#3E4753]">

            {/* Hero — photo layer washed back over the #D6CFC2 veil */}
            <section className="relative isolate overflow-hidden bg-[#D6CFC2]">
                <img
                    src={heroImg}
                    alt="Older woman in a bright kitchen having a telehealth video session with her doctor"
                    width={1920}
                    height={1088}
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.6]"
                />
                <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(90deg, #D6CFC2 0%, rgba(214,207,194,0) 100%)",
                    }}
                />
                <div className="relative mx-auto flex min-h-[34.5vw] max-w-[1600px] items-center px-8 py-24 md:px-[9vw]">
                    {/* measure is 60% of the content box — matches the design's ~61 chars per line */}
                    <div className="w-full max-w-[60%]">
                        {/* H1 — Merriweather Semibold, 3.21vw */}
                        <h1 className="font-serif text-[clamp(2rem,3.21vw,60px)] font-semibold leading-[1.15]">
                            {heroTitle}
                        </h1>
                        {/* B2.2 — Raleway Regular, 1.6vw / 1.33 */}
                        <p className="mt-[30px] text-justify font-normal text-[clamp(1rem,1.6vw,30px)] leading-[1.33]">
                            Reframe Psychology Group provides all services online via our HIPAA compliant,
                            encrypted video platform called <strong className="font-semibold">SimplePractice</strong>.
                            All you will need is a private place to meet, an internet connection, and a computer
                            or mobile device. Online sessions are secure, confidential, and allow for more ease
                            and flexibility in scheduling.
                        </p>
                    </div>
                </div>
            </section>

            {/* Fees */}
            <section className="bg-[#F0EAE2]">
                {/* measure is ~79% of viewport (px-[10.5vw]) — matches the design's ~104 chars per line */}
                <div className="mx-auto w-full max-w-[1600px] px-8 pt-[58px] pb-[150px] text-center md:px-[10.5vw]">
                    {/* H1 — Merriweather Semibold, 3.21vw */}
                    <h2 className="font-serif text-[clamp(2rem,3.21vw,60px)] font-semibold leading-none">
                        {feesTitle}
                    </h2>
                    {/* B2.2 — Raleway Regular, 1.6vw / 1.33 */}
                    <div className="mt-[44px] space-y-[26px] font-normal text-[clamp(1rem,1.6vw,30px)] leading-[1.33]">
                        <p className="whitespace-pre-line">{feesSubtitle}</p>
                        <p>{oonPara1}</p>
                        <p>{oonPara2}</p>
                        <p>{reimbursementInfo}</p>
                    </div>
                </div>
            </section>

        </div>
    );
}
