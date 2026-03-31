"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TEMPLATES,
  CATEGORY_LABELS,
  type TemplateCategory,
  type Template,
} from "@/lib/templates";
import { Sparkles, ArrowRight, ArrowLeft, Eye } from "lucide-react";

function TemplateCard({
  template,
  onPreview,
}: {
  template: Template;
  onPreview: (t: Template) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div
        className={`h-40 bg-gradient-to-br ${template.color} relative flex items-center justify-center`}
      >
        <span className="text-white/80 text-5xl font-bold opacity-20">
          {template.name[0]}
        </span>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onPreview(template)}
            className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-900 shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          {CATEGORY_LABELS[template.category]}
        </span>
        <h3 className="font-semibold text-gray-900 mt-2">{template.name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {template.previewDescription}
        </p>
        <Link
          href={`/signup?template=${template.id}`}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
        >
          Use Template
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function PreviewModal({
  template,
  onClose,
}: {
  template: Template;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl">
        <div
          className={`h-48 bg-gradient-to-br ${template.color} rounded-t-2xl flex items-center justify-center`}
        >
          <span className="text-white text-6xl font-bold opacity-30">
            {template.name[0]}
          </span>
        </div>
        <div className="p-6">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {CATEGORY_LABELS[template.category]}
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-3">
            {template.name}
          </h2>
          <p className="text-gray-600 mt-2 leading-relaxed">
            {template.description}
          </p>
          <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded">
              Tone: {template.tone}
            </span>
          </div>
          <div className="mt-6 flex gap-3">
            <Link
              href={`/signup?template=${template.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
            >
              <Sparkles className="w-4 h-4" />
              Use This Template
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | "all"
  >("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const categories = Object.entries(CATEGORY_LABELS);
  const filtered =
    selectedCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="glass fixed top-0 w-full z-40 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">
                PageCraft
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Template Gallery
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Start with a professionally designed template. AI fills in your
              content and customizes the design to match your brand.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({TEMPLATES.length})
            </button>
            {categories.map(([key, label]) => {
              const count = TEMPLATES.filter(
                (t) => t.category === key
              ).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() =>
                    setSelectedCategory(key as TemplateCategory)
                  }
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${
                    selectedCategory === key
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={setPreviewTemplate}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500">
                No templates in this category yet.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}
