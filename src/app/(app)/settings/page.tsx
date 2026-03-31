"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Profile } from "@/types/database";
import { PLANS } from "@/lib/stripe";
import { Check, Crown, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);
    setLoading(false);
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
      })
      .eq("id", profile.id);

    setSaving(false);
  }

  async function handleUpgrade(plan: string) {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleManageBilling() {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setBillingLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!profile) return null;

  const currentPlan = PLANS[profile.plan];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Profile Section */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              value={profile.full_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input value={profile.email} disabled />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </section>

      {/* Billing Section */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Subscription
        </h2>
        <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <Crown className="w-5 h-5 text-indigo-600" />
          <div>
            <p className="font-medium text-gray-900">
              Current Plan: {currentPlan.name}
            </p>
            <p className="text-sm text-gray-500">
              {currentPlan.price === 0
                ? "Free forever"
                : `$${currentPlan.price}/month`}
            </p>
          </div>
        </div>

        {profile.plan === "free" ? (
          <div className="grid md:grid-cols-2 gap-4">
            {(["pro", "team"] as const).map((planKey) => {
              const plan = PLANS[planKey];
              return (
                <div
                  key={planKey}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-2xl font-bold mt-1">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-500">
                      /mo
                    </span>
                  </p>
                  <ul className="mt-3 space-y-2">
                    {plan.features.slice(0, 3).map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleUpgrade(planKey)}
                    disabled={billingLoading}
                  >
                    {billingLoading ? "Loading..." : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <Button
            variant="secondary"
            onClick={handleManageBilling}
            disabled={billingLoading}
          >
            {billingLoading ? "Loading..." : "Manage Billing"}
          </Button>
        )}
      </section>
    </div>
  );
}
