import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getApiUrl } from "@/lib/api";


// ── Type extensions ─────────────────────────────────────────────────────────
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "ADMIN" | "AUTHOR";
            must_change_password?: boolean;
        } & DefaultSession["user"];
        accessToken?: string;
    }
    interface User {
        id: string;
        role: "ADMIN" | "AUTHOR";
        accessToken?: string;
        must_change_password?: boolean;
    }
}
declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "ADMIN" | "AUTHOR";
        accessToken?: string;
        must_change_password?: boolean;
        provider?: string;
    }
}

// ── Allowlist helpers ────────────────────────────────────────────────────────
function getAllowedEmails(): string[] {
    return (process.env.AUTHORIZED_EMAILS || "")
        .split(",")
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
}
function getSuperAdminEmails(): string[] {
    return (process.env.SUPER_ADMIN_EMAILS || "")
        .split(",")
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
}
function getRoleForEmail(email: string): "ADMIN" | "AUTHOR" {
    const e = email.toLowerCase();
    return getSuperAdminEmails().includes(e) ? "ADMIN" : "AUTHOR";
}

// ── Try to get a backend JWT for a Google-authed user ───────────────────────
async function getBackendTokenForGoogleUser(email: string, name: string): Promise<string | null> {
    try {
        // Attempt to find the user by email; if they don't exist yet this will 404
        const res = await fetch(`${getApiUrl()}/api/v1/auth/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name }),
        });
        if (res.ok) {
            const data = await res.json();
            return data.access_token || null;
        }
        return null;
    } catch {
        return null;
    }
}

// ── NextAuth config ──────────────────────────────────────────────────────────
// ── Build provider list ─────────────────────────────────────────────────────
const providers: NextAuthOptions["providers"] = [];

// Only enable Google if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "select_account",
                    access_type: "offline",
                    scope: "openid email profile",
                },
            },
        })
    );
}

export const authOptions: NextAuthOptions = {
    providers: [

        // ── Email / Password ────────────────────────────────────────────────
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;
                try {
                    const res = await fetch(`${getApiUrl()}/api/v1/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            username: credentials.username,
                            password: credentials.password,
                        }),
                    });
                    const data = await res.json();
                    if (res.ok && data.access_token) {
                        return {
                            id: data.user_info.id.toString(),
                            name: data.user_info.name || data.user_info.email.split("@")[0],
                            email: data.user_info.email,
                            role: data.user_info.role as "ADMIN" | "AUTHOR",
                            accessToken: data.access_token,
                            must_change_password: data.user_info.must_change_password,
                        };
                    }
                    return null;
                } catch {
                    return null;
                }
            },
        }),
        ...providers,
    ],

    callbacks: {
        // ── Block non-allowed Google emails ─────────────────────────────────
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                const allowed = getAllowedEmails();
                if (!user.email || !allowed.includes(user.email.toLowerCase())) {
                    return false; // Reject — not on allowlist
                }
            }
            return true;
        },

        // ── Build JWT token ──────────────────────────────────────────────────
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id || token.sub || "";
                token.role = user.role || getRoleForEmail(user.email || "");
                token.accessToken = user.accessToken;
                token.must_change_password = user.must_change_password || false;
                token.provider = account?.provider || "credentials";
            }
            // For Google sign-in, exchange email for a backend JWT
            if (account?.provider === "google" && token.email && !token.accessToken) {
                const backendToken = await getBackendTokenForGoogleUser(
                    token.email as string,
                    token.name as string
                );
                if (backendToken) token.accessToken = backendToken;
                token.role = getRoleForEmail(token.email as string);
            }
            return token;
        },

        // ── Expose session fields ────────────────────────────────────────────
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as "ADMIN" | "AUTHOR";
                session.user.must_change_password = token.must_change_password as boolean;
            }
            session.accessToken = token.accessToken;
            return session;
        },
    },

    session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
    pages: { signIn: "/login", error: "/login" },
};