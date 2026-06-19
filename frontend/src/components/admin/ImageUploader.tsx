"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, ImageIcon, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/api";

interface ImageUploaderProps {
    /** Existing image URL (e.g. when editing an article) */
    currentImageUrl?: string | null;
    /** Called with the new public URL after a successful upload */
    onUpload: (url: string) => void;
    /** Aspect ratio class — default is wide cover (16:9) */
    aspectRatio?: "video" | "square" | "portrait";
}

export default function ImageUploader({
    currentImageUrl,
    onUpload,
    aspectRatio = "video",
}: ImageUploaderProps) {
    const { data: session } = useSession();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const aspectCls =
        aspectRatio === "square"
            ? "aspect-square"
            : aspectRatio === "portrait"
            ? "aspect-[3/4]"
            : "aspect-[16/6]";

    async function handleFile(file: File) {
        if (!file.type.startsWith("image/")) {
            setError("Only image files are allowed (JPEG, PNG, WEBP, GIF).");
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            setError("Image must be under 8 MB.");
            return;
        }
        setError("");
        setIsUploading(true);

        // Instant local preview
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${getApiUrl()}/api/v1/upload/`, {
                method: "POST",
                headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
                body: formData,
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.detail || `Upload failed (${res.status})`);
            }

            const data = await res.json();
            setPreview(data.url);
            onUpload(data.url);
        } catch (err: any) {
            setError(err.message || "Upload failed. Please try again.");
            setPreview(currentImageUrl || null);
        } finally {
            setIsUploading(false);
        }
    }

    function handleRemove() {
        setPreview(null);
        onUpload("");
        setError("");
        if (inputRef.current) inputRef.current.value = "";
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }
    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
    }
    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }

    return (
        <div className="space-y-2">
            {preview ? (
                /* ── Preview state ── */
                <div className={`relative w-full ${aspectCls} rounded-xl overflow-hidden border border-black/[0.08] bg-[#f4f1ed] group`}>
                    <img
                        src={preview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                    />

                    {/* Upload spinner overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 z-10">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                            <span className="text-white text-[12px] font-semibold">Uploading…</span>
                        </div>
                    )}

                    {/* Hover controls */}
                    {!isUploading && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 z-10">
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="flex items-center gap-1.5 bg-white text-[#333a42] text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f4f1ed] transition-colors shadow-sm"
                            >
                                <RefreshCw className="w-3.5 h-3.5" /> Replace
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="flex items-center gap-1.5 bg-red-500 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                            >
                                <X className="w-3.5 h-3.5" /> Remove
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* ── Drop zone ── */
                <div
                    className={`relative w-full ${aspectCls} rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center cursor-pointer
                        ${isDragging
                            ? "border-[#7ebac8] bg-[#f0f9ff]"
                            : "border-black/[0.1] bg-[#fafaf9] hover:border-[#7ebac8]/60 hover:bg-[#f0f9ff]/60"
                        }
                        ${isUploading ? "pointer-events-none opacity-60" : ""}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-7 h-7 text-[#7ebac8] animate-spin mb-2" />
                            <p className="text-[13px] font-semibold text-[#4a535e]">Uploading…</p>
                        </>
                    ) : (
                        <>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${isDragging ? "bg-[#7ebac8]/20" : "bg-[#f2ede4]"}`}>
                                {isDragging
                                    ? <UploadCloud className="w-5 h-5 text-[#7ebac8]" />
                                    : <ImageIcon className="w-5 h-5 text-[#7ebac8]" />
                                }
                            </div>
                            <p className="text-[13px] font-semibold text-[#333a42]">
                                {isDragging ? "Drop to upload" : "Click or drag & drop"}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                PNG, JPG, WEBP — max 8 MB
                            </p>
                        </>
                    )}
                </div>
            )}

            {error && (
                <p className="text-[12px] text-red-500 font-medium">{error}</p>
            )}

            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleChange}
            />
        </div>
    );
}
