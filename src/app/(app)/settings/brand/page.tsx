"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Palette, Save } from "lucide-react";

interface BrandKit {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  tone: string;
  tagline: string | null;
}

export default function BrandKitPage() {
  const [kit, setKit] = useState<BrandKit>({
    id: "",
    name: "Default",
    logo_url: null,
    primary_color: "#4f46e5",
    secondary_color: "#7c3aed",
    accent_color: "#06b6d4",
    font_heading: "Inter",
    font_body: "Inter",
    tone: "professional",
    tagline: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBrandKit();
  }, []);

  async function loadBrandKit() {
    const res = await fetch("/api/brand-kit");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      setKit(data[0]);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/brand-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: kit.name,
          logoUrl: kit.logo_url,
          primaryColor: kit.primary_color,
          secondaryColor: kit.secondary_color,
          accentColor: kit.accent_color,
          fontHeading: kit.font_heading,
          fontBody: kit.font_body,
          tone: kit.tone,
          tagline: kit.tagline,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch {
      alert("Failed to save brand kit. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Brand Kit</h1>
      <p className="text-gray-500 text-sm mb-8">
        Define your brand identity. AI will use these settings when generating
        pages.
      </p>

      <div className="space-y-6">
        {/* Colors */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" />
            Brand Colors
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                key: "primary_color" as const,
                label: "Primary",
              },
              {
                key: "secondary_color" as const,
                label: "Secondary",
              },
              {
                key: "accent_color" as const,
                label: "Accent",
              },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={kit[key]}
                    onChange={(e) => setKit({ ...kit, [key]: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={kit[key]}
                    onChange={(e) => setKit({ ...kit, [key]: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="mt-4 flex gap-2">
            <div
              className="h-12 flex-1 rounded-lg"
              style={{ backgroundColor: kit.primary_color }}
            />
            <div
              className="h-12 flex-1 rounded-lg"
              style={{ backgroundColor: kit.secondary_color }}
            />
            <div
              className="h-12 flex-1 rounded-lg"
              style={{ backgroundColor: kit.accent_color }}
            />
          </div>
        </section>

        {/* Typography */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Typography</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heading Font
              </label>
              <select
                value={kit.font_heading}
                onChange={(e) =>
                  setKit({ ...kit, font_heading: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {[
                  "Inter",
                  "Poppins",
                  "Montserrat",
                  "Playfair Display",
                  "Roboto",
                  "Open Sans",
                  "Lato",
                  "Raleway",
                ].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Font
              </label>
              <select
                value={kit.font_body}
                onChange={(e) => setKit({ ...kit, font_body: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {[
                  "Inter",
                  "Poppins",
                  "Roboto",
                  "Open Sans",
                  "Lato",
                  "Source Sans Pro",
                  "Nunito",
                ].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Brand Voice */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Brand Voice</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <Input
                value={kit.tagline || ""}
                onChange={(e) => setKit({ ...kit, tagline: e.target.value })}
                placeholder="e.g., Build better, ship faster"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Tone
              </label>
              <select
                value={kit.tone}
                onChange={(e) => setKit({ ...kit, tone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="bold">Bold</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
        </section>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save Brand Kit"}
        </Button>
      </div>
    </div>
  );
}
