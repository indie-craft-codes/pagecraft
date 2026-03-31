export const INTEGRATION_TYPES = {
  google_analytics: {
    name: "Google Analytics",
    description: "Track visitors with Google Analytics 4",
    icon: "📊",
    fields: [
      { key: "measurementId", label: "Measurement ID", placeholder: "G-XXXXXXXXXX" },
    ],
  },
  google_tag_manager: {
    name: "Google Tag Manager",
    description: "Manage all your tags in one place",
    icon: "🏷️",
    fields: [
      { key: "containerId", label: "Container ID", placeholder: "GTM-XXXXXXX" },
    ],
  },
  facebook_pixel: {
    name: "Facebook Pixel",
    description: "Track conversions from Facebook ads",
    icon: "📘",
    fields: [
      { key: "pixelId", label: "Pixel ID", placeholder: "1234567890" },
    ],
  },
  tiktok_pixel: {
    name: "TikTok Pixel",
    description: "Track conversions from TikTok ads",
    icon: "🎵",
    fields: [
      { key: "pixelId", label: "Pixel ID", placeholder: "XXXXXXXXXX" },
    ],
  },
  zapier_webhook: {
    name: "Zapier Webhook",
    description: "Connect to 5000+ apps via Zapier",
    icon: "⚡",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", placeholder: "https://hooks.zapier.com/..." },
    ],
  },
  custom_webhook: {
    name: "Custom Webhook",
    description: "Send events to any URL",
    icon: "🔗",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", placeholder: "https://your-api.com/webhook" },
      { key: "secret", label: "Secret (optional)", placeholder: "webhook-secret" },
    ],
  },
  mailchimp: {
    name: "Mailchimp",
    description: "Sync leads to Mailchimp lists",
    icon: "📧",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "xxxxxx-usXX" },
      { key: "listId", label: "List/Audience ID", placeholder: "abc123" },
    ],
  },
  convertkit: {
    name: "ConvertKit",
    description: "Add subscribers to ConvertKit forms",
    icon: "✉️",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "xxxxxx" },
      { key: "formId", label: "Form ID", placeholder: "123456" },
    ],
  },
} as const;

export type IntegrationType = keyof typeof INTEGRATION_TYPES;
