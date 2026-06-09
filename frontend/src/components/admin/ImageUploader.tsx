"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/api";


interface ImageUploaderProps {
    value?: string | null;
    onChange: (url: string) => void;
    label?: string;
}

export default function ImageUploader({ value, onChange, label = "Profile Image" }: ImageUploaderProps) {
    const { data: session } = useSession();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file (jpeg, png, webp, gif)");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${getApiUrl()}/api/v1/upload/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();

            // Assuming the backend returns something like { "url": `${getApiUrl()}/static/uploads/image.jpg` }
            setPreviewUrl(data.url);
            onChange(data.url);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await handleFile(e.target.files[0]);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
            </span>

            {previewUrl ? (
                <div className="relative rounded-md overflow-hidden border border-input shadow-sm max-w-[250px]">
                    <img
                        src={previewUrl}
                        alt="Uploaded preview"
                        className="w-full h-auto object-cover aspect-video"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemove}
                            className="flex items-center gap-2 shadow-lg"
                        >
                            <X className="w-4 h-4" /> Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    className={`
                        relative flex flex-col items-center justify-center w-full max-w-[350px]
                        h-32 border-2 border-dashed rounded-lg transition-colors
                        ${isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"}
                        ${isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        ) : (
                            <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                        )}
                        <p className="mb-1 text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground/75">
                            PNG, JPG, or WEBP (Max 5MB)
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/jpeg, image/png, image/webp, image/gif"
                        onChange={handleFileChange}
                    />
                </div>
            )}
        </div>
    );
}