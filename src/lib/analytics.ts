// Analytics wrapper — supports PostHog or any provider
// Set NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST in .env.local to enable

type EventProperties = Record<string, string | number | boolean | undefined>;

class Analytics {
  private posthog: typeof import("posthog-js").default | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    if (typeof window === "undefined") return;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!key) return;

    try {
      const posthog = (await import("posthog-js")).default;
      posthog.init(key, {
        api_host: host || "https://us.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
      });
      this.posthog = posthog;
      this.initialized = true;
    } catch {
      // PostHog not available — analytics disabled
    }
  }

  identify(userId: string, properties?: EventProperties) {
    this.posthog?.identify(userId, properties);
  }

  track(event: string, properties?: EventProperties) {
    this.posthog?.capture(event, properties);
  }

  page(url?: string) {
    this.posthog?.capture("$pageview", url ? { $current_url: url } : {});
  }

  reset() {
    this.posthog?.reset();
  }
}

export const analytics = new Analytics();

// Standard event names
export const EVENTS = {
  SIGNUP: "user_signed_up",
  LOGIN: "user_logged_in",
  PAGE_GENERATED: "page_generated",
  PAGE_PUBLISHED: "page_published",
  PAGE_EXPORTED: "page_exported",
  SECTION_REGENERATED: "section_regenerated",
  TEMPLATE_SELECTED: "template_selected",
  UPGRADE_STARTED: "upgrade_started",
  UPGRADE_COMPLETED: "upgrade_completed",
} as const;
