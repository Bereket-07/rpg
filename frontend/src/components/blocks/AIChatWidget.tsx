"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, ExternalLink, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface Message { role: "user" | "assistant"; content: string; id: string; }

// Parsed link card
interface LinkCard { path: string; label: string; description: string; }

const SUGGESTIONS = [
    "Who can help with anxiety?",
    "How do I book a session?",
    "What are your fees?",
    "Meet the team",
];

// ── Parse [[LINK:/path|Label|Description]] out of text ──────────────────────
function parseLinks(text: string): { segments: Array<{ type: "text" | "link"; content: string; card?: LinkCard }> } {
    const regex = /\[\[LINK:([^|]+)\|([^|]+)\|([^\]]+)\]\]/g;
    const segments: Array<{ type: "text" | "link"; content: string; card?: LinkCard }> = [];
    let last = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) segments.push({ type: "text", content: text.slice(last, match.index) });
        segments.push({ type: "link", content: match[2], card: { path: match[1], label: match[2], description: match[3] } });
        last = match.index + match[0].length;
    }
    if (last < text.length) segments.push({ type: "text", content: text.slice(last) });
    return { segments };
}

// ── Beautiful link card component ────────────────────────────────────────────
function LinkCardChip({ card }: { card: LinkCard }) {
    return (
        <Link href={card.path}
            className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-[#7ebac8]/15 to-[#7ebac8]/8 hover:from-[#7ebac8]/25 hover:to-[#7ebac8]/15 border border-[#7ebac8]/30 hover:border-[#7ebac8]/60 rounded-xl px-3.5 py-2.5 my-1.5 transition-all duration-200 w-full max-w-[280px] shadow-sm hover:shadow-md">
            <div className="w-8 h-8 rounded-lg bg-[#7ebac8]/20 group-hover:bg-[#7ebac8]/30 flex items-center justify-center shrink-0 transition-colors">
                <ExternalLink className="w-3.5 h-3.5 text-[#7ebac8]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1e2328] group-hover:text-[#7ebac8] transition-colors leading-tight">{card.label}</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">{card.description}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#7ebac8]/50 group-hover:text-[#7ebac8] group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
    );
}

// ── Render message with embedded link cards ──────────────────────────────────
function MessageContent({ content }: { content: string }) {
    const { segments } = parseLinks(content);
    const linkCards = segments.filter(s => s.type === "link");
    const textOnly = segments.filter(s => s.type === "text").map(s => s.content).join("").trim();

    return (
        <div className="space-y-1.5">
            {textOnly && (
                <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{textOnly}</p>
            )}
            {linkCards.length > 0 && (
                <div className="flex flex-col gap-1 pt-1">
                    {linkCards.map((s, i) => s.card && <LinkCardChip key={i} card={s.card} />)}
                </div>
            )}
        </div>
    );
}

// ── Typing animation dots ────────────────────────────────────────────────────
function TypingDots() {
    return (
        <div className="flex gap-1 items-center h-5 px-1">
            {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#7ebac8]/60 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }} />
            ))}
        </div>
    );
}

// ── Main chat widget ─────────────────────────────────────────────────────────
export function AIChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([{
        role: "assistant",
        id: "welcome",
        content: "Hi! I'm here to help you learn about Reframe Psychology Group — our team, specialties, services, and how to get started. What would you like to know? [[LINK:/book|Book a Consultation|Schedule your first session]] [[LINK:/team|Meet the Team|Our clinicians and their specialties]]",
    }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const [hasUnread, setHasUnread] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingContent]);

    useEffect(() => {
        if (open) { setHasUnread(false); inputRef.current?.focus(); }
    }, [open]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || loading) return;
        const userMsg: Message = { role: "user", content: text.trim(), id: Date.now().toString() };
        setMessages(prev => [...prev, userMsg]);
        setInput(""); setLoading(true); setStreamingContent("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });
            if (!res.ok || !res.body) throw new Error("Failed");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let full = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                full += decoder.decode(value, { stream: true });
                setStreamingContent(full);
            }
            setMessages(prev => [...prev, { role: "assistant", content: full, id: Date.now().toString() }]);
        } catch {
            setMessages(prev => [...prev, {
                role: "assistant", id: Date.now().toString(),
                content: "Sorry, I'm having trouble connecting right now. Please try [[LINK:/contact|Contact Us|Get in touch with our team]] directly.",
            }]);
        } finally {
            setLoading(false); setStreamingContent("");
        }
    }, [messages, loading]);

    return (
        <>
            {/* ── Floating bubble ─────────────────────────────────────── */}
            <button onClick={() => setOpen(o => !o)} aria-label="Open chat"
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1e2328] hover:bg-[#2a3038] shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group">
                {open
                    ? <X className="w-5 h-5 text-white" />
                    : <MessageCircle className="w-5 h-5 text-white" />
                }
                {hasUnread && !open && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#7ebac8] rounded-full border-2 border-white animate-pulse" />
                )}
            </button>

            {/* ── Chat panel ──────────────────────────────────────────── */}
            <div className={`fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-black/[0.07] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${open ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none"}`}
                style={{ maxHeight: "min(600px, calc(100vh - 120px))" }}>

                {/* Header */}
                <div className="bg-[#1e2328] px-5 py-4 flex items-center gap-3 shrink-0">
                    <div className="w-9 h-9 rounded-full bg-[#7ebac8]/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-[#7ebac8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-[13px] font-bold leading-tight">Ask us anything</p>
                        <p className="text-[#7ebac8]/70 text-[11px]">Reframe Psychology · Always here</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors p-1">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#faf8f5]">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "assistant" && (
                                <div className="w-6 h-6 rounded-full bg-[#7ebac8]/15 flex items-center justify-center shrink-0 mt-1 mr-2">
                                    <Sparkles className="w-3 h-3 text-[#7ebac8]" />
                                </div>
                            )}
                            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                                msg.role === "user"
                                    ? "bg-[#1e2328] text-white rounded-br-sm"
                                    : "bg-white border border-black/[0.07] text-[#333a42] rounded-bl-sm shadow-sm"
                            }`}>
                                {msg.role === "user"
                                    ? <p className="text-[13.5px] leading-relaxed">{msg.content}</p>
                                    : <MessageContent content={msg.content} />
                                }
                            </div>
                        </div>
                    ))}

                    {/* Streaming */}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="w-6 h-6 rounded-full bg-[#7ebac8]/15 flex items-center justify-center shrink-0 mt-1 mr-2">
                                <Sparkles className="w-3 h-3 text-[#7ebac8]" />
                            </div>
                            <div className="max-w-[85%] bg-white border border-black/[0.07] rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
                                {streamingContent
                                    ? <MessageContent content={streamingContent} />
                                    : <TypingDots />
                                }
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick suggestions — only shown when 1 message (welcome) */}
                {messages.length === 1 && !loading && (
                    <div className="px-4 pb-2 flex flex-wrap gap-1.5 bg-[#faf8f5]">
                        {SUGGESTIONS.map(s => (
                            <button key={s} onClick={() => sendMessage(s)}
                                className="text-[11px] font-semibold bg-white border border-black/[0.08] hover:border-[#7ebac8]/50 hover:bg-[#7ebac8]/5 text-[#4a535e] rounded-full px-3 py-1.5 transition-all">
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="px-4 py-3 border-t border-black/[0.06] bg-white flex gap-2 items-center shrink-0">
                    <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                        placeholder="Ask anything…"
                        disabled={loading}
                        className="flex-1 text-[13px] bg-[#f7f5f2] border border-black/[0.08] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/30 focus:bg-white transition-all placeholder:text-muted-foreground/50 disabled:opacity-50" />
                    <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                        className="w-9 h-9 rounded-xl bg-[#1e2328] hover:bg-[#2a3038] disabled:opacity-40 flex items-center justify-center transition-all active:scale-95 shrink-0">
                        {loading
                            ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                            : <Send className="w-3.5 h-3.5 text-white" />
                        }
                    </button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground/50 pb-2 bg-white">
                    Powered by Gemini · Not a substitute for professional advice
                </p>
            </div>
        </>
    );
}
