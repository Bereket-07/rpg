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
    const heroDesc = pageData?.hero_description || "Reframe Psychology Group provides all services online via our HIPAA compliant, encrypted video platform called SimplePractice. All you will need is a private place to meet, an internet connection, and a computer or mobile device. Online sessions are secure, confidential, and allow for more ease and flexibility in scheduling.";
    const heroImg = pageData?.hero_image_url || "/assets/RPG_Images for UI/asian-senior-older-woman-video-call-with-doctor-in-2026-03-16-04-23-55-utc.jpg";

    const feesTitle = pageData?.content?.fees_title || "Fees";
    const feesSubtitle = pageData?.content?.fees_subtitle || "Please review our team members and the standard fee for their services. \n Limited sliding scale fees when available.";
    const oonTitle = pageData?.content?.out_of_network_title || "Out-of-Network Policy";
    const oonDesc = pageData?.content?.out_of_network_desc || "Reframe Psychology Group is an out-of-network provider. This means that our therapists cannot bill your insurance company directly. We have chosen to practice independently of insurance companies in order to provide you with care that is based on your specific therapy goals and not on the limitations imposed by insurance companies. However, at your request, we will gladly generate a \"superbill\" that will include an itemized list of services and their insurance codes so that you can submit to your insurance company for out-of-network reimbursement.";
    const reimbursementInfo = pageData?.content?.reimbursement_info || "Your insurance company and your particular coverage determine if and how you can be reimbursed. At your request, we will do our best to provide information that will support your claim.";

    return (
        <div className="bg-[#f2ede4] min-h-screen font-sans text-[#4a535e] pb-0">
            
            {/* Section 1: Telehealth Services Hero Banner */}
            <section 
                className="relative w-full min-h-[45vh] lg:min-h-[50vh] flex items-center bg-cover bg-center" 
                style={{ backgroundImage: `url('${heroImg}')` }}
            >
                {/* Light warm gradient overlay for maximum readability & aesthetic */}
                <div className="absolute inset-0 bg-white/40 lg:bg-gradient-to-r lg:from-white/80 lg:via-white/50 lg:to-transparent" />
                
                {/* Left-Aligned Text Content */}
                <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative z-10 max-w-6xl w-full text-left py-24">
                    <div className="max-w-2xl space-y-4">
                        <h1 className="text-[36px] sm:text-[44px] font-serif text-[#333a42] font-normal leading-tight tracking-tight">
                            {heroTitle}
                        </h1>
                        <p className="text-[15px] sm:text-[17px] text-[#4a535e] leading-relaxed font-normal">
                            {heroDesc}
                        </p>
                    </div>
                </div>
            </section>
 
            {/* Section 2: Fees Centered Content */}
            <section className="bg-[#f2ede4] py-24 sm:py-28 px-6">
                <div className="container mx-auto max-w-4xl text-center space-y-8 sm:space-y-10 text-[#4a535e]">
                    
                    <h2 className="text-[34px] sm:text-[42px] font-serif text-[#333a42] font-normal tracking-tight">
                        {feesTitle}
                    </h2>
                    
                    <div className="text-[15px] sm:text-[16px] md:text-[17px] leading-relaxed space-y-8 font-normal max-w-3xl mx-auto">
                        <p className="whitespace-pre-line">
                            {feesSubtitle}
                        </p>
                        
                        <p className="font-medium text-[#333a42]">
                            {oonTitle}
                        </p>
                        
                        <p>
                            {oonDesc}
                        </p>
                        
                        <p>
                            {reimbursementInfo}
                        </p>
                    </div>
                    
                </div>
            </section>

        </div>
    );
}
