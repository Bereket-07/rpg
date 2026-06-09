import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const team = [
    {
        id: 1,
        name: "Dr. Sarah Jenkins",
        role: "Clinical Psychologist, Founder",
        bio: "Dr. Jenkins specializes in cognitive behavioral therapy (CBT) and has over 15 years of experience helping adults manage anxiety and depression.",
    },
    {
        id: 2,
        name: "Marcus Thorne, LMFT",
        role: "Licensed Marriage and Family Therapist",
        bio: "Marcus focuses on couples counseling and family dynamics, utilizing emotionally focused therapy to rebuild connection and trust.",
    },
    {
        id: 3,
        name: "Dr. Emily Chen",
        role: "Trauma Specialist",
        bio: "Certified in EMDR, Dr. Chen helps individuals process deeply rooted trauma and PTSD symptoms in a clinically safe environment.",
    },
];

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mb-16 space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Our Team</h1>
                <p className="text-xl text-muted-foreground">
                    Meet the exceptional clinicians dedicated to providing personalized, evidence-based care.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {team.map((member) => (
                    <Card key={member.id} className="flex flex-col h-full border-none shadow-md bg-secondary/5">
                        <CardHeader>
                            <div className="w-full h-48 bg-muted rounded-md mb-4 flex items-center justify-center text-muted-foreground/50">
                                [Photo Placeholder]
                            </div>
                            <CardTitle className="text-xl">{member.name}</CardTitle>
                            <CardDescription className="font-medium text-primary">{member.role}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-sm text-foreground/80 leading-relaxed">{member.bio}</p>
                            <Button variant="outline" className="w-full mt-auto">Read Full Bio</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
