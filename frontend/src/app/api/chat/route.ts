import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getApiUrl } from "@/lib/api";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SITE_LINKS = [
    { path: "/", label: "Home", description: "Welcome page" },
    { path: "/approach", label: "Our Approach", description: "How we work & our therapy philosophy" },
    { path: "/team", label: "Meet the Team", description: "Our clinicians and their specialties" },
    { path: "/specialties", label: "Specialties", description: "What we treat and specialize in" },
    { path: "/services", label: "Services & Fees", description: "Session types, pricing, and insurance" },
    { path: "/blog", label: "Blog & Articles", description: "Mental health resources and insights" },
    { path: "/book", label: "Book a Consultation", description: "Schedule your first session" },
    { path: "/contact", label: "Contact Us", description: "Get in touch with our team" },
];

async function getRPGContext(): Promise<string> {
    let authorsText = "";
    let settingsText = "";
    try {
        const [authorsRes, settingsRes] = await Promise.all([
            fetch(`${getApiUrl()}/api/v1/authors?team_only=true`, { next: { revalidate: 300 } }),
            fetch(`${getApiUrl()}/api/v1/settings/settings`, { next: { revalidate: 300 } }),
        ]);
        if (authorsRes.ok) {
            const authors = await authorsRes.json();
            authorsText = authors.map((a: any) => {
                const specialties = (a.specialties_list || []).map((s: any) => s.title).join(", ");
                return `- ${a.name} (${a.credentials || ""}, ${a.role || ""}): ${a.bio?.slice(0, 300) || ""}. Specialties: ${specialties}.`;
            }).join("\n");
        }
        if (settingsRes.ok) {
            const s = await settingsRes.json();
            settingsText = `Practice name: ${s.site_name || "Reframe Psychology Group"}. ${s.hero_subtitle || ""}`;
        }
    } catch { /* use defaults */ }

    return `
You are "Ask us anything", a warm and knowledgeable assistant for Reframe Psychology Group (RPG) — a premium psychological care practice based in California.

ABOUT THE PRACTICE:
${settingsText || "Reframe Psychology Group offers attuned, evidence-based psychological care for adults and couples across California."}

OUR CLINICIANS:
${authorsText || "We have a team of licensed psychologists and therapists specializing in anxiety, trauma, depression, relationships, and more."}

SITE NAVIGATION (use these exact paths when sharing links):
${SITE_LINKS.map(l => `- ${l.label}: ${l.path} — ${l.description}`).join("\n")}

YOUR ROLE:
- Answer questions about the practice, team, services, specialties, fees, booking, and approach
- Be warm, empathetic, and professional — like a helpful front desk receptionist
- When mentioning pages, ALWAYS use this exact format so links render beautifully:
  [[LINK:path|Label|Description]]
  Example: [[LINK:/book|Book a Consultation|Schedule your first session with us]]
- You can share multiple links when helpful
- Keep answers concise (2-4 sentences max) unless asked for detail
- If you don't know something specific (like exact fees), say "I'd recommend reaching out directly via [[LINK:/contact|Contact Us|Get in touch with our team]]"
- Never make up clinical claims or diagnoses
- Crisis situations: always direct to 988 Suicide & Crisis Lifeline or 911

TONE: Warm, clear, professional. Like a caring and knowledgeable intake coordinator.
`.trim();
}

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();
        if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "PASTE_YOUR_GEMINI_KEY_HERE") {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const systemPrompt = await getRPGContext();
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

        // Build chat history (all but last message) starting from the first user message
        const firstUserIndex = messages.findIndex((m: any) => m.role === "user");
        const history = firstUserIndex === -1
            ? []
            : messages.slice(firstUserIndex, -1).map((m: any) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
            }));

        const chat = model.startChat({
            history,
            systemInstruction: {
                parts: [{ text: systemPrompt }],
            },
            generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
        });

        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessageStream(lastMessage);

        // Stream response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) controller.enqueue(encoder.encode(text));
                    }
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
        });
    } catch (err: any) {
        console.error("Chat API error:", err);
        return NextResponse.json({ error: "Failed to get response", detail: err?.message }, { status: 500 });
    }
}
