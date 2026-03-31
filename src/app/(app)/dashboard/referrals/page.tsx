"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Copy, Check, Gift } from "lucide-react";

interface Referral {
  id: string;
  referral_code: string;
  status: string;
  created_at: string;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferrals();
  }, []);

  async function loadReferrals() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get or create referral code
    const { data: existing } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });

    if (existing && existing.length > 0) {
      setReferrals(existing);
      setReferralCode(existing[0].referral_code);
    } else {
      // Create initial referral code
      const code = `ref_${user.id.slice(0, 8)}`;
      await supabase.from("referrals").insert({
        referrer_id: user.id,
        referral_code: code,
        status: "pending",
      });
      setReferralCode(code);
    }

    setLoading(false);
  }

  function copyLink() {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const stats = {
    total: referrals.length,
    signedUp: referrals.filter((r) => r.status !== "pending").length,
    converted: referrals.filter(
      (r) => r.status === "converted" || r.status === "rewarded"
    ).length,
    rewarded: referrals.filter((r) => r.status === "rewarded").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
        <p className="text-gray-500 text-sm mt-1">
          Invite friends and earn a free month of Pro for each signup
        </p>
      </div>

      {/* Referral Link */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Gift className="w-5 h-5 text-indigo-600" />
          Your Referral Link
        </h2>
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 font-mono truncate">
            {process.env.NEXT_PUBLIC_APP_URL || "https://pagecraft.ai"}/signup?ref=
            {referralCode}
          </div>
          <Button onClick={copyLink} variant="secondary">
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5" />
                Copy
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Share this link. When someone signs up and upgrades to a paid plan, you
          get 1 free month of Pro.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Links Shared", value: stats.total, color: "text-gray-900" },
          {
            label: "Signed Up",
            value: stats.signedUp,
            color: "text-blue-600",
          },
          {
            label: "Converted",
            value: stats.converted,
            color: "text-green-600",
          },
          {
            label: "Rewards Earned",
            value: stats.rewarded,
            color: "text-indigo-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-indigo-50 rounded-xl p-6">
        <h3 className="font-semibold text-indigo-900 mb-3">How it works</h3>
        <ol className="space-y-2 text-sm text-indigo-800">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
              1
            </span>
            Share your unique referral link with friends
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
              2
            </span>
            They sign up and create their first landing page
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
              3
            </span>
            When they upgrade to a paid plan, you get 1 month of Pro free
          </li>
        </ol>
      </div>
    </div>
  );
}
