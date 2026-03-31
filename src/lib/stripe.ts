import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    pages: 1,
    features: [
      "1 landing page per month",
      "PageCraft branding",
      "Basic templates",
      "HTML export",
    ],
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 19,
    pages: -1, // unlimited
    features: [
      "Unlimited landing pages",
      "No branding",
      "Custom domains",
      "Priority AI generation",
      "All templates",
      "HTML/React export",
    ],
  },
  team: {
    name: "Team",
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    price: 49,
    pages: -1,
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Brand kit & style guide",
      "API access",
      "Priority support",
      "Analytics dashboard",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
