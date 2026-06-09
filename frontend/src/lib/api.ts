function normalizeApiOrigin(url?: string) {
    if (!url) return "";
    return url
        .trim()
        .replace(/\/+$/, "")
        .replace(/\/api\/v1$/, "")
        .replace(/\/api$/, "");
}

export const getApiUrl = (isServer = typeof window === "undefined") => {
    if (isServer) {
        return (
            normalizeApiOrigin(process.env.API_INTERNAL_URL) ||
            normalizeApiOrigin(process.env.NEXT_PUBLIC_API_URL) ||
            "http://127.0.0.1:8000"
        );
    }

    const publicUrl = normalizeApiOrigin(process.env.NEXT_PUBLIC_API_URL);
    if (publicUrl && !publicUrl.includes("backend")) {
        return publicUrl;
    }

    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return `${window.location.protocol}//${hostname}:8000`;
    }

    return "";
};
