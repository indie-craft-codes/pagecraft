"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Check, AlertCircle, Loader2, Copy } from "lucide-react";

interface DomainSettingsProps {
  projectId: string;
  currentDomain: string | null;
  onDomainChange: (domain: string | null) => void;
}

export function DomainSettings({
  projectId,
  currentDomain,
  onDomainChange,
}: DomainSettingsProps) {
  const [domain, setDomain] = useState(currentDomain || "");
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "verified" | "failed" | "error"
  >(currentDomain ? "verified" : "idle");
  const [message, setMessage] = useState("");

  const appDomain = typeof window !== "undefined"
    ? new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pagecraft.ai").hostname
    : "pagecraft.ai";

  async function handleVerify() {
    if (!domain.trim()) return;
    setVerifying(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim(), projectId }),
      });

      const data = await res.json();

      if (data.verified) {
        setStatus("verified");
        setMessage("Domain verified and connected!");
        onDomainChange(domain.trim());
      } else if (data.error) {
        setStatus("error");
        setMessage(data.error);
      } else {
        setStatus("failed");
        setMessage(data.message);
      }
    } catch {
      setStatus("error");
      setMessage("Failed to verify domain");
    } finally {
      setVerifying(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4" />
          Custom Domain
        </h3>

        {/* Setup Instructions */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
          <p className="font-medium text-gray-700 mb-2">Setup Instructions:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
            <li>Go to your domain&apos;s DNS settings</li>
            <li>
              Add a CNAME record:
              <div className="mt-1 flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-1.5 font-mono text-xs">
                <span className="text-gray-500">CNAME</span>
                <span className="text-gray-400">→</span>
                <span className="text-indigo-600">cname.{appDomain}</span>
                <button
                  onClick={() => copyToClipboard(`cname.${appDomain}`)}
                  className="ml-auto text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
            <li>Enter your domain below and click Verify</li>
          </ol>
        </div>

        <div className="flex gap-2">
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="landing.yourcompany.com"
          />
          <Button onClick={handleVerify} disabled={verifying || !domain.trim()}>
            {verifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Verify"
            )}
          </Button>
        </div>

        {status !== "idle" && (
          <div
            className={`mt-3 flex items-start gap-2 text-sm ${
              status === "verified"
                ? "text-green-700"
                : status === "error"
                  ? "text-red-600"
                  : "text-amber-600"
            }`}
          >
            {status === "verified" ? (
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
