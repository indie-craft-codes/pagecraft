"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/types/database";
import {
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
  Globe,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    productName: "",
    productDescription: "",
    targetAudience: "",
    tone: "professional" as const,
  });

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const supabase = createClient();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Generation failed");

      const project = await res.json();
      setProjects([project, ...projects]);
      setShowCreate(false);
      setForm({
        productName: "",
        productDescription: "",
        targetAudience: "",
        tone: "professional",
      });
    } catch {
      alert("Failed to generate page. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;

    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", id);
    setProjects(projects.filter((p) => p.id !== id));
  }

  async function handlePublish(id: string, published: boolean) {
    const supabase = createClient();
    await supabase.from("projects").update({ published }).eq("id", id);
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, published } : p))
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Pages</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage your landing pages
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Page
        </Button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold">Create a New Page</h2>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <Input
                  value={form.productName}
                  onChange={(e) =>
                    setForm({ ...form, productName: e.target.value })
                  }
                  placeholder="e.g., TaskFlow"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Description *
                </label>
                <Textarea
                  value={form.productDescription}
                  onChange={(e) =>
                    setForm({ ...form, productDescription: e.target.value })
                  }
                  placeholder="Describe what your product does, who it's for, and what makes it unique..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <Input
                  value={form.targetAudience}
                  onChange={(e) =>
                    setForm({ ...form, targetAudience: e.target.value })
                  }
                  placeholder="e.g., Freelance designers, SaaS founders"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tone
                </label>
                <select
                  value={form.tone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tone: e.target.value as typeof form.tone,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="bold">Bold</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreate(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="flex-1">
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Page
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No pages yet</h3>
          <p className="text-gray-500 mt-1 mb-6">
            Create your first AI-powered landing page
          </p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Page
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition group"
            >
              <div className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 relative">
                {project.thumbnail_url ? (
                  <img
                    src={project.thumbnail_url}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Globe className="w-8 h-8 text-indigo-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {project.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {project.description}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {formatDate(project.created_at)}
                </p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <Link
                    href={`/editor/${project.id}`}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  {project.published && (
                    <a
                      href={`/p/${project.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </a>
                  )}
                  <button
                    onClick={() =>
                      handlePublish(project.id, !project.published)
                    }
                    className="text-sm text-gray-600 hover:text-indigo-600 transition ml-auto cursor-pointer"
                  >
                    {project.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-sm text-gray-400 hover:text-red-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
