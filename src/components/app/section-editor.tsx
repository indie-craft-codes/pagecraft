"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  GripVertical,
  Trash2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Loader2,
  X,
} from "lucide-react";

export interface Section {
  id: string;
  label: string;
  html: string;
}

// Parse HTML into sections based on top-level tags in <body>
export function parseSections(html: string): Section[] {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;

  // Split by top-level elements (sections, header, footer, main, nav, div)
  const sectionRegex =
    /(<(?:section|header|footer|main|nav|div)[^>]*>[\s\S]*?<\/(?:section|header|footer|main|nav|div)>)/gi;
  const matches = bodyContent.match(sectionRegex);

  if (!matches || matches.length === 0) {
    return [{ id: "full", label: "Full Page", html: bodyContent.trim() }];
  }

  return matches.map((match, i) => {
    // Try to determine label from tag name or id/class
    const tagMatch = match.match(/^<(\w+)/);
    const idMatch = match.match(/id="([^"]+)"/);
    const tag = tagMatch?.[1] || "section";
    const id = idMatch?.[1] || `section-${i}`;

    let label = tag.charAt(0).toUpperCase() + tag.slice(1);
    if (idMatch) {
      label = idMatch[1]
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (tag === "header" || tag === "nav") {
      label = "Navigation";
    } else if (tag === "footer") {
      label = "Footer";
    } else {
      label = `Section ${i + 1}`;
    }

    return { id, label, html: match };
  });
}

// Reconstruct HTML from sections
export function rebuildHtml(
  originalHtml: string,
  sections: Section[]
): string {
  const bodyMatch = originalHtml.match(
    /([\s\S]*<body[^>]*>)([\s\S]*)(<\/body>[\s\S]*)/i
  );

  if (!bodyMatch) {
    return sections.map((s) => s.html).join("\n\n");
  }

  const beforeBody = bodyMatch[1];
  const afterBody = bodyMatch[3];
  const newBody = sections.map((s) => s.html).join("\n\n");

  return `${beforeBody}\n${newBody}\n${afterBody}`;
}

interface SectionEditorProps {
  sections: Section[];
  fullHtml: string;
  onSectionsChange: (sections: Section[]) => void;
  onHtmlChange: (html: string) => void;
}

export function SectionEditor({
  sections,
  fullHtml,
  onSectionsChange,
  onHtmlChange,
}: SectionEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegenerate(sectionId: string) {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || !instruction.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionHtml: section.html,
          instruction: instruction.trim(),
          fullPageContext: fullHtml,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const { html } = await res.json();
      const updated = sections.map((s) =>
        s.id === sectionId ? { ...s, html } : s
      );
      onSectionsChange(updated);
      onHtmlChange(rebuildHtml(fullHtml, updated));
      setEditingSection(null);
      setInstruction("");
    } catch {
      alert("Failed to regenerate section. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function moveSection(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onSectionsChange(updated);
    onHtmlChange(rebuildHtml(fullHtml, updated));
  }

  function deleteSection(index: number) {
    if (sections.length <= 1) return;
    const updated = sections.filter((_, i) => i !== index);
    onSectionsChange(updated);
    onHtmlChange(rebuildHtml(fullHtml, updated));
  }

  return (
    <div className="h-full overflow-auto p-3 space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1 mb-3">
        Page Sections
      </p>
      {sections.map((section, index) => (
        <div
          key={section.id}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 py-2">
            <GripVertical className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 flex-1 truncate">
              {section.label}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => moveSection(index, "up")}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveSection(index, "down")}
                disabled={index === sections.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  setEditingSection(
                    editingSection === section.id ? null : section.id
                  )
                }
                className="p-1 text-gray-400 hover:text-indigo-600 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteSection(index)}
                disabled={sections.length <= 1}
                className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI Editing Panel */}
          {editingSection === section.id && (
            <div className="border-t border-gray-100 p-3 bg-gray-50">
              <div className="flex gap-2">
                <input
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="e.g., Make it more bold, add testimonials..."
                  className="flex-1 text-sm px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleRegenerate(section.id);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => handleRegenerate(section.id)}
                  disabled={loading || !instruction.trim()}
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                </Button>
                <button
                  onClick={() => {
                    setEditingSection(null);
                    setInstruction("");
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {[
                  "Make it more bold",
                  "Shorten the copy",
                  "Add social proof",
                  "Change to dark theme",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInstruction(suggestion)}
                    className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
