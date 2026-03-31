"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface Submission {
  id: string;
  project_id: string;
  email: string;
  data: Record<string, unknown>;
  source: string;
  created_at: string;
  project?: { name: string };
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    const supabase = createClient();
    const { data } = await supabase
      .from("submissions")
      .select("*, project:projects(name)")
      .order("created_at", { ascending: false })
      .limit(100);

    setSubmissions((data as Submission[]) || []);
    setLoading(false);
  }

  function exportCsv() {
    const headers = ["Email", "Project", "Source", "Date"];
    const rows = submissions.map((s) => [
      s.email,
      s.project?.name || s.project_id,
      s.source || "",
      new Date(s.created_at).toISOString(),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "submissions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Submissions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {submissions.length} total submissions
          </p>
        </div>
        {submissions.length > 0 && (
          <Button variant="secondary" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            No submissions yet
          </h3>
          <p className="text-gray-500 mt-1">
            Submissions from your published pages will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Project
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Source
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {sub.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {sub.project?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {sub.source || "form"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(sub.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
