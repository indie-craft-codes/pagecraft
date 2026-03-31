"use client";

import { Sparkles } from "lucide-react";

interface PageWithBadgeProps {
  htmlContent: string;
  showBadge: boolean;
  slug: string;
}

export function PageWithBadge({
  htmlContent,
  showBadge,
  slug,
}: PageWithBadgeProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pagecraft.ai";
  const referralUrl = `${appUrl}/signup?ref=${slug}`;

  return (
    <div className="relative w-full h-screen">
      <iframe
        srcDoc={htmlContent}
        className="w-full h-full border-0"
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        title="Published Page"
      />

      {showBadge && (
        <a
          href={referralUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-xs font-medium text-gray-700 hover:text-indigo-600"
        >
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Made with PageCraft
        </a>
      )}
    </div>
  );
}
