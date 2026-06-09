"use client";

import AuthProvider from "@/components/admin/AuthProvider";

export default function ChangePasswordLayout({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}
