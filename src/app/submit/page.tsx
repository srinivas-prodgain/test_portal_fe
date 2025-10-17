"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function SubmitPageContent() {
    const search_params = useSearchParams();
    const status = search_params.get("status") || "submitted";


    const get_status_info = () => {
        switch (status) {
            case "terminated":
                return {
                    title: "Exam Terminated",
                    titleColor: "text-destructive",
                    description: "Your exam was terminated due to policy violations.",
                    content: [
                        "Your responses up to the point of termination have been saved.",
                        "Please contact support if you believe this was an error.",
                    ],
                };
            case "expired":
                return {
                    title: "Time Expired",
                    titleColor: "text-chart-3",
                    description: "The exam time limit has been reached.",
                    content: [
                        "Your responses have been automatically saved.",
                        "All answers provided within the time limit have been recorded.",
                    ],
                };
            default:
                return {
                    title: "Exam Submitted Successfully",
                    titleColor: "text-chart-2",
                    description: "Your exam has been submitted and saved. Thank you for completing the assessment.",
                    content: [
                        "Your responses have been recorded and will be reviewed by our team.",
                        "You will be contacted regarding the next steps in the process.",
                    ],
                };
        }
    };

    const status_info = get_status_info();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className={status_info.titleColor}>{status_info.title}</CardTitle>
                    <CardDescription>{status_info.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm text-muted-foreground">
                        {status_info.content.map((text, index) => (
                            <p key={index}>{text}</p>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function SubmitPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Loading...</CardTitle>
                        <CardDescription>Please wait while we process your submission.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        }>
            <SubmitPageContent />
        </Suspense>
    );
}