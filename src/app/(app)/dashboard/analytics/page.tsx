"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, MousePointer, TrendingUp, Globe } from "lucide-react";

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  byDevice: Record<string, number>;
  byCountry: Record<string, number>;
  dailyViews: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  async function loadAnalytics() {
    setLoading(true);
    const supabase = createClient();

    const daysAgo = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const since = new Date();
    since.setDate(since.getDate() - daysAgo);

    // Get user's project IDs
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: projects } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id);

    if (!projects || projects.length === 0) {
      setData({
        totalViews: 0,
        totalClicks: 0,
        totalConversions: 0,
        conversionRate: 0,
        byDevice: {},
        byCountry: {},
        dailyViews: [],
      });
      setLoading(false);
      return;
    }

    const projectIds = projects.map((p) => p.id);

    const { data: events } = await supabase
      .from("page_events")
      .select("event_type, device, country, created_at")
      .in("project_id", projectIds)
      .gte("created_at", since.toISOString());

    const allEvents = events || [];

    const totalViews = allEvents.filter((e) => e.event_type === "view").length;
    const totalClicks = allEvents.filter(
      (e) => e.event_type === "click"
    ).length;
    const totalConversions = allEvents.filter(
      (e) => e.event_type === "conversion"
    ).length;

    const byDevice: Record<string, number> = {};
    const byCountry: Record<string, number> = {};

    allEvents.forEach((e) => {
      if (e.device) byDevice[e.device] = (byDevice[e.device] || 0) + 1;
      if (e.country) byCountry[e.country] = (byCountry[e.country] || 0) + 1;
    });

    // Group views by day
    const dailyMap: Record<string, number> = {};
    allEvents
      .filter((e) => e.event_type === "view")
      .forEach((e) => {
        const day = e.created_at.slice(0, 10);
        dailyMap[day] = (dailyMap[day] || 0) + 1;
      });

    const dailyViews = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setData({
      totalViews,
      totalClicks,
      totalConversions,
      conversionRate: totalViews > 0 ? (totalConversions / totalViews) * 100 : 0,
      byDevice,
      byCountry,
      dailyViews,
    });
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track your pages&apos; performance
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition cursor-pointer ${
                period === p
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500"
              }`}
            >
              {p === "7d" ? "7 days" : p === "30d" ? "30 days" : "90 days"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Page Views",
            value: data.totalViews.toLocaleString(),
            icon: Eye,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "CTA Clicks",
            value: data.totalClicks.toLocaleString(),
            icon: MousePointer,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Conversions",
            value: data.totalConversions.toLocaleString(),
            icon: TrendingUp,
            color: "text-purple-600 bg-purple-50",
          },
          {
            label: "Conversion Rate",
            value: `${data.conversionRate.toFixed(1)}%`,
            icon: Globe,
            color: "text-indigo-600 bg-indigo-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Daily Views Chart (simple bar chart) */}
      {data.dailyViews.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">
            Daily Page Views
          </h2>
          <div className="flex items-end gap-1 h-40">
            {data.dailyViews.map((day) => {
              const maxViews = Math.max(...data.dailyViews.map((d) => d.count), 1);
              const height = maxViews > 0 ? (day.count / maxViews) * 100 : 0;
              return (
                <div
                  key={day.date}
                  className="flex-1 group relative"
                  title={`${day.date}: ${day.count} views`}
                >
                  <div
                    className="bg-indigo-500 rounded-t-sm w-full transition-all hover:bg-indigo-600"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{data.dailyViews[0]?.date}</span>
            <span>{data.dailyViews[data.dailyViews.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Device & Country Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">By Device</h2>
          {Object.keys(data.byDevice).length === 0 ? (
            <p className="text-sm text-gray-500">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.byDevice)
                .sort((a, b) => b[1] - a[1])
                .map(([device, count]) => {
                  const total = Object.values(data.byDevice).reduce(
                    (a, b) => a + b,
                    0
                  );
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={device}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 capitalize">
                          {device}
                        </span>
                        <span className="text-gray-500">
                          {count} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-2 bg-indigo-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top Countries</h2>
          {Object.keys(data.byCountry).length === 0 ? (
            <p className="text-sm text-gray-500">No data yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(data.byCountry)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([country, count]) => (
                  <div
                    key={country}
                    className="flex justify-between text-sm py-1"
                  >
                    <span className="text-gray-700">{country}</span>
                    <span className="text-gray-500 font-medium">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
