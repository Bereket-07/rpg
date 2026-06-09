"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Pencil, Trash2, Loader2, Check, X } from "lucide-react";
import DeleteAction from "@/components/admin/DeleteAction";
import { getApiUrl } from "@/lib/api";


interface Category { id: number; name: string; slug: string; description?: string; }

function toSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugManual, setSlugManual] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editSlug, setEditSlug] = useState("");

    async function load() {
        const res = await fetch(`${getApiUrl()}/api/v1/categories`, { cache: "no-store" });
        if (res.ok) setCategories(await res.json());
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    // Auto-slug from name
    useEffect(() => { if (!slugManual) setSlug(toSlug(name)); }, [name]);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug })
            });
            if (res.ok) { setName(""); setSlug(""); setSlugManual(false); await load(); }
        } finally { setSaving(false); }
    }

    async function handleEdit(cat: Category) {
        const res = await fetch(`${getApiUrl()}/api/v1/categories/${cat.slug}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: editName, slug: editSlug })
        });
        if (res.ok) { setEditId(null); await load(); }
    }

    // Article count per category (derived from loaded data if available)
    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-[#1e2328] tracking-tight">Topics</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage the clinical topics articles are grouped under</p>
            </div>

            {/* Inline add form */}
            <div className="bg-white rounded-xl border border-black/[0.06] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Add New Topic</p>
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-semibold text-[#333a42]">Topic Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Anxiety & Stress"
                            className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40"
                            required
                        />
                        {name && (
                            <p className="text-[10px] text-muted-foreground">
                                Slug: <span className="font-mono text-[#7ebac8]">{slug || "—"}</span>
                            </p>
                        )}
                    </div>
                    <button type="submit" disabled={saving || !name.trim()}
                        className="flex items-center gap-2 bg-[#7ebac8] hover:bg-[#6aaab8] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shrink-0">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add Topic
                    </button>
                </form>
            </div>

            {/* Pill grid */}
            {loading ? (
                <div className="flex flex-wrap gap-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-9 w-28 bg-white rounded-full border border-black/[0.06] animate-pulse" />
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="bg-white rounded-xl border border-black/[0.06] p-12 text-center">
                    <Tag className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No topics yet — add your first one above</p>
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {categories.length} {categories.length === 1 ? "Topic" : "Topics"}
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                        {categories.map(cat => (
                            editId === cat.id ? (
                                // Inline edit mode
                                <div key={cat.id} className="flex items-center gap-1.5 bg-white border-2 border-[#7ebac8]/40 rounded-full px-3 py-1.5 shadow-sm">
                                    <input
                                        autoFocus
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="text-sm font-semibold text-[#1e2328] bg-transparent border-none outline-none w-28"
                                    />
                                    <button onClick={() => handleEdit(cat)} className="text-emerald-500 hover:text-emerald-600">
                                        <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setEditId(null)} className="text-muted-foreground hover:text-red-400">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div key={cat.id}
                                    className="group flex items-center gap-2 bg-white border border-black/[0.07] hover:border-[#7ebac8]/40 rounded-full px-4 py-1.5 shadow-sm transition-all">
                                    <span className="text-sm font-semibold text-[#333a42]">{cat.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-mono hidden group-hover:inline">/{cat.slug}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                        <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditSlug(cat.slug); }}
                                            className="text-muted-foreground hover:text-[#7ebac8] transition-colors">
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                        <DeleteAction endpoint={`categories/${cat.slug}`} itemName={cat.name} />
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}