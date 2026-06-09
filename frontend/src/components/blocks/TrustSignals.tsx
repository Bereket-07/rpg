"use client";

import { motion } from "framer-motion";

const signals = [
    { id: 1, text: "HIPAA Compliant" },
    { id: 2, text: "Licensed Therapists" },
    { id: 3, text: "Evidence-Based" },
    { id: 4, text: "Secure Portal" },
];

export function TrustSignals() {
    return (
        <section className="border-y bg-secondary/5 py-12">
            <div className="container mx-auto px-4">
                <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-widest">
                    The highest standards in clinical care
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 lg:gap-24">
                    {signals.map((signal, index) => (
                        <motion.div
                            key={signal.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="flex items-center text-lg font-semibold text-foreground/80"
                        >
                            <div className="h-2 w-2 rounded-full bg-primary mr-3" />
                            {signal.text}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
