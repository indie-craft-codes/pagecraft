"use client";

import { useState, useEffect, useRef, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SectionEditor,
  parseSections,
  type Section,
} from "@/components/app/section-editor";
import { ChatEditor } from "@/components/app/chat-editor";
import type { Project } from "@/types/database";
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Tablet,
  Download,
  Globe,
  Save,
  Loader2,
  Code,
  Eye,
  Layers,
  MessageSquare,
} from "lucide-react";

export default function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [showSections, setShowSections] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [deviceWidth, setDeviceWidth] = useState("100%");
  const [htmlContent, setHtmlContent] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadProject();
  }, [id]);

  // Parse sections when HTML changes (but not from section editor itself)
  const parsedSections = useMemo(
    () => parseSections(htmlContent),
    [htmlContent]
  );

  // Sync parsed sections only when HTML is loaded or changed externally
  useEffect(() => {
    if (parsedSections.length > 0 && sections.length === 0) {
      setSections(parsedSections);
    }
  }, [parsedSections]);

  async function loadProject() {
    const supabase = createClient();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (!data) {
      router.push("/dashboard");
      return;
    }

    setProject(data);
    setHtmlContent(data.html_content);
    setSections(parseSections(data.html_content));
    setLoading(false);
  }

  async function handleSave() {
    if (!project) return;
    setSaving(true);

    const supabase = createClient();
    await supabase
      .from("projects")
      .update({
        html_content: htmlContent,
        name: project.name,
        meta_title: project.meta_title,
        meta_description: project.meta_description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    setSaving(false);
  }

  async function handlePublish() {
    if (!project) return;

    const supabase = createClient();
    const newPublished = !project.published;
    await supabase
      .from("projects")
      .update({ published: newPublished })
      .eq("id", project.id);

    setProject({ ...project, published: newPublished });
  }

  function handleExport() {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name || "page"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Keyboard shortcut: Cmd+S to save
  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveRef.current();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="-m-8 flex flex-col h-screen">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-500 hover:text-gray-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <Input
          value={project.name}
          onChange={(e) => setProject({ ...project, name: e.target.value })}
          className="max-w-xs text-sm font-medium border-0 bg-transparent focus:bg-white focus:border-gray-300"
        />

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 ml-auto">
          <button
            onClick={() => setViewMode("preview")}
            className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === "preview" ? "bg-white shadow-sm" : "text-gray-500"}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("code")}
            className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === "code" ? "bg-white shadow-sm" : "text-gray-500"}`}
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {viewMode === "preview" && (
          <>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDeviceWidth("100%")}
                className={`p-1.5 rounded-md transition cursor-pointer ${deviceWidth === "100%" ? "bg-white shadow-sm" : "text-gray-500"}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceWidth("768px")}
                className={`p-1.5 rounded-md transition cursor-pointer ${deviceWidth === "768px" ? "bg-white shadow-sm" : "text-gray-500"}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceWidth("375px")}
                className={`p-1.5 rounded-md transition cursor-pointer ${deviceWidth === "375px" ? "bg-white shadow-sm" : "text-gray-500"}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowSections(!showSections)}
              className={`p-1.5 rounded-md transition cursor-pointer ${showSections ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}
              title="Toggle section editor"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-1.5 rounded-md transition cursor-pointer ${showChat ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}
              title="AI Chat Editor"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </>
        )}

        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>

        <Button variant="secondary" size="sm" onClick={handlePublish}>
          <Globe className="w-3.5 h-3.5 mr-1.5" />
          {project.published ? "Unpublish" : "Publish"}
        </Button>

        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          )}
          Save
        </Button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-gray-100 overflow-hidden flex">
        {/* Section Panel */}
        {viewMode === "preview" && showSections && (
          <div className="w-72 bg-gray-50 border-r border-gray-200 flex-shrink-0">
            <SectionEditor
              sections={sections}
              fullHtml={htmlContent}
              onSectionsChange={(newSections) => {
                setSections(newSections);
              }}
              onHtmlChange={(newHtml) => {
                setHtmlContent(newHtml);
                setSections(parseSections(newHtml));
              }}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "preview" ? (
            <div className="h-full flex items-start justify-center p-4 overflow-auto">
              <div
                style={{ width: deviceWidth, maxWidth: "100%" }}
                className="h-full bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
              >
                <iframe
                  ref={iframeRef}
                  srcDoc={htmlContent}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title="Page Preview"
                />
              </div>
            </div>
          ) : (
            <div className="h-full p-4">
              <textarea
                value={htmlContent}
                onChange={(e) => {
                  setHtmlContent(e.target.value);
                  setSections(parseSections(e.target.value));
                }}
                className="w-full h-full bg-gray-900 text-gray-100 font-mono text-sm p-4 rounded-lg border-0 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* AI Chat Panel */}
        {viewMode === "preview" && showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0">
            <ChatEditor
              currentHtml={htmlContent}
              onHtmlChange={(newHtml) => {
                setHtmlContent(newHtml);
                setSections(parseSections(newHtml));
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
