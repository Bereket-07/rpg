"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const emotionPillars = [
    "Greater clarity",
    "More choice",
    "Less reactivity"
];

const relationshipPillars = [
    "Greater trust",
    "More responsiveness",
    "Genuine closeness"
];

const processSteps = [
    "Feel understood without having to overexplain",
    "Recognize automatic responses as they happen",
    "Understand what purpose they serve",
    "Shift them through new emotional experiences"
];

export function AttunementNarrative() {
    return (
        <section className="py-24 bg-white font-sans text-[#5c6670] border-b border-black/5">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Deep clinical statement */}
                <div className="max-w-3xl mx-auto text-center mb-20 space-y-6">
                    <motion.h3 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#5c6670] leading-snug tracking-tight"
                    >
                        Patterns learned earlier in life can quietly shape how we relate, react, and make decisions.
                    </motion.h3>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-primary font-serif italic text-xl font-light"
                    >
                        Change happens in connection.
                    </motion.p>
                </div>

                {/* Narrative Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                    
                    {/* Emotion card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="bg-[#FDF8F5] p-8 rounded-2xl border border-black/[0.03] shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
                    >
                        <div>
                            <h4 className="text-xl font-serif text-[#5c6670] mb-4">
                                Develop a different relationship with your emotions:
                            </h4>
                            <div className="w-12 h-[1px] bg-primary/40 mb-6" />
                            <ul className="space-y-3">
                                {emotionPillars.map((item, idx) => (
                                    <li key={idx} className="flex items-center space-x-3 text-sm font-medium">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-xs text-muted-foreground/70 mt-8">
                            Over time, what once felt automatic becomes flexible.
                        </p>
                    </motion.div>

                    {/* Relationship card */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="bg-[#FDF8F5] p-8 rounded-2xl border border-black/[0.03] shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
                    >
                        <div>
                            <h4 className="text-xl font-serif text-[#5c6670] mb-4">
                                Move out of familiar relationship cycles of disconnection:
                            </h4>
                            <div className="w-12 h-[1px] bg-primary/40 mb-6" />
                            <ul className="space-y-3">
                                {relationshipPillars.map((item, idx) => (
                                    <li key={idx} className="flex items-center space-x-3 text-sm font-medium">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-xs text-muted-foreground/70 mt-8">
                            Create new ways of responding, deepening closeness and trust.
                        </p>
                    </motion.div>

                </div>

                {/* Attunement process details */}
                <div className="bg-[#5c6670] text-white p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-lg">
                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <div className="space-y-4">
                            <h4 className="text-2xl md:text-3xl font-serif">
                                Attuned, Structured, and Grounded in Evidence-Based Approaches
                            </h4>
                            <p className="text-white/80 text-sm md:text-base leading-relaxed">
                                We help you move beyond just talking about your problems. Together, we create safe, structured experiences that foster actual emotional shifts:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {processSteps.map((step, idx) => (
                                <div key={idx} className="flex items-start space-x-3 text-sm text-white/90">
                                    <div className="w-2 h-2 rounded-full bg-[#7ebac8] mt-1.5 shrink-0" />
                                    <span>{step}</span>
                                </div>
                            ))}
                        </div>

                        <div className="w-full h-[1px] bg-white/10 my-6" />

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <p className="text-white/80 font-serif italic text-sm text-center sm:text-left">
                                This is what allows change to move from something you understand to something you feel and live.
                            </p>
                            <Button asChild className="bg-white text-[#5c6670] hover:bg-white/90 rounded-sm font-semibold h-12 px-6">
                                <Link href="/contact" className="flex items-center gap-2">
                                    <span>Book a Consultation</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Elegant graphical backdrop */}
                    <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
                </div>

            </div>
        </section>
    );
}
