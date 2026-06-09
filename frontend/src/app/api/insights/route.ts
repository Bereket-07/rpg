import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getApiUrl } from "@/lib/api";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = (session as any)?.accessToken;
    const headers = { Authorization: `Bearer ${token}` };
    const api = `${getApiUrl()}/api/v1`;

    try {
        // Fetch all data in parallel
        const [consultRes, subscribersRes, authorsRes, articlesRes] = await Promise.allSettled([
            fetch(`${api}/consultations/`, { headers }),
            fetch(`${api}/newsletter/`, { headers }),
            fetch(`${api}/authors`),
            fetch(`${api}/articles`),
        ]);

        const consultations = consultRes.status === "fulfilled" && consultRes.value.ok
            ? await consultRes.value.json() : [];
        const subscribers = subscribersRes.status === "fulfilled" && subscribersRes.value.ok
            ? await subscribersRes.value.json() : [];
        const authors = authorsRes.status === "fulfilled" && authorsRes.value.ok
            ? await authorsRes.value.json() : [];
        const articles = articlesRes.status === "fulfilled" && articlesRes.value.ok
            ? await articlesRes.value.json() : [];

        // Build a concise data summary for Gemini
        const inquiries = consultations.filter((c: any) => c.type === "inquiry" || !c.type);
        const bookings = consultations.filter((c: any) => c.type === "booking");

        // Extract notes/messages for topic analysis
        const messages = consultations
            .map((c: any) => c.notes || c.message || c.subject || "")
            .filter(Boolean)
            .slice(0, 30); // cap at 30 for token limits

        const therapistCounts: Record<string, number> = {};
        bookings.forEach((b: any) => {
            const t = b.therapist_preference || "No preference";
            therapistCounts[t] = (therapistCounts[t] || 0) + 1;
        });

        const dataSummary = `
PRACTICE DATA SUMMARY for Reframe Psychology Group:

TEAM: ${authors.length} clinicians: ${authors.map((a: any) => `${a.name} (${(a.specialties_list || []).map((s: any) => s.title).slice(0, 3).join(", ")})`).join("; ")}

ARTICLES PUBLISHED: ${articles.length} articles

NEWSLETTER: ${subscribers.length} total subscribers

CONSULTATIONS OVERVIEW:
- Total inquiries: ${inquiries.length}
- Total bookings: ${bookings.length}
- Therapist booking distribution: ${JSON.stringify(therapistCounts)}

RECENT CLIENT MESSAGES/NOTES (anonymized):
${messages.map((m: string, i: number) => `${i + 1}. "${m.slice(0, 150)}"`).join("\n")}

Today's date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
`.trim();

        const prompt = `You are an analytics AI for Reframe Psychology Group admin dashboard.

Analyze this practice data and return a JSON object with exactly this structure:
{
  "summary": "2-sentence overview of the practice's current state",
  "faq": [
    {"question": "Most common question clients ask", "frequency": "High/Medium/Low", "suggestion": "Brief actionable suggestion"},
    {"question": "Second most common", "frequency": "...", "suggestion": "..."},
    {"question": "Third most common", "frequency": "...", "suggestion": "..."}
  ],
  "trends": [
    {"label": "Trend name", "insight": "What's happening", "action": "What to do"},
    {"label": "Trend name", "insight": "...", "action": "..."},
    {"label": "Trend name", "insight": "...", "action": "..."}
  ],
  "alerts": [
    {"type": "info|warning|success", "message": "Brief alert message"}
  ],
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "highlights": {
    "totalClients": ${consultations.length},
    "subscribers": ${subscribers.length},
    "articles": ${articles.length},
    "clinicians": ${authors.length}
  }
}

DATA:
${dataSummary}

Return ONLY valid JSON. No markdown, no explanation.`;

        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");

        const insights = JSON.parse(raw);
        return NextResponse.json(insights);
    } catch (err: any) {
        console.error("Insights API error:", err);
        return NextResponse.json({ error: "Failed to generate insights", detail: err?.message }, { status: 500 });
    }
}