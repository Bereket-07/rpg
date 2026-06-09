import { Hero } from "@/components/blocks/Hero";
import { CaliforniaBanner } from "@/components/blocks/CaliforniaBanner";
import { TherapistShowcase } from "@/components/blocks/TherapistShowcase";
import { getApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

async function getPageData(slug: string) {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/settings/pages/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch homepage data from FastAPI:", err);
    return null;
  }
}

export default async function Home() {
  const homeData = await getPageData("home");

  return (
    <div className="w-full bg-[#FCF9F6]">
      <Hero data={homeData} />
      <CaliforniaBanner data={homeData} />
      <TherapistShowcase title={homeData?.content?.showcase_title} />
    </div>
  );
}
