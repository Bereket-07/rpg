"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MailCheck } from "lucide-react";
import { getApiUrl } from "@/lib/api";


// Input validation schema using Zod
const newsletterSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function NewsletterOptIn() {
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const form = useForm<z.infer<typeof newsletterSchema>>({
        resolver: zodResolver(newsletterSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: z.infer<typeof newsletterSchema>) {
        setStatus("submitting");
        setErrorMessage("");

        try {
            const response = await fetch(`${getApiUrl()}/api/v1/newsletter/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to subscribe.");
            }

            // Success state
            setStatus("success");
            form.reset();

            // Revert back to normal after 5 seconds
            setTimeout(() => {
                setStatus("idle");
            }, 5000);

        } catch (error: any) {
            console.error("Newsletter submission error:", error);
            setStatus("error");
            setErrorMessage(error.message || "An unexpected error occurred. Please try again.");
        }
    }

    return (
        <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
            {/* Visual background element */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl opacity-50 pointer-events-none" />

            <CardHeader>
                <CardTitle className="lg:text-2xl">Join our clinical newsletter</CardTitle>
                <CardDescription className="text-base text-foreground/80">
                    Get evidence-based insights and mental wellness strategies delivered directly to your inbox.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {status === "success" ? (
                    <div className="bg-green-500/10 text-green-700 dark:text-green-400 p-4 rounded-lg flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                        <MailCheck className="h-5 w-5" />
                        <p className="font-medium">Thank you for subscribing! Check your inbox soon.</p>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your email address..."
                                                type="email"
                                                disabled={status === "submitting"}
                                                className="bg-background/50 backdrop-blur-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        {status === "error" && (
                                            <p className="text-sm font-medium text-destructive mt-1">
                                                {errorMessage}
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                disabled={status === "submitting"}
                                className="sm:w-[140px] transition-all"
                            >
                                {status === "submitting" ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subscribing</>
                                ) : (
                                    "Subscribe"
                                )}
                            </Button>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}