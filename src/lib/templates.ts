export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  previewDescription: string;
  tone: "professional" | "casual" | "bold" | "minimal";
  color: string; // tailwind gradient for card
}

export type TemplateCategory =
  | "saas"
  | "mobile-app"
  | "agency"
  | "portfolio"
  | "event"
  | "ecommerce"
  | "newsletter"
  | "startup"
  | "ai-tool"
  | "dev-tool";

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  saas: "SaaS",
  "mobile-app": "Mobile App",
  agency: "Agency",
  portfolio: "Portfolio",
  event: "Event",
  ecommerce: "E-commerce",
  newsletter: "Newsletter",
  startup: "Startup",
  "ai-tool": "AI Tool",
  "dev-tool": "Developer Tool",
};

export const TEMPLATES: Template[] = [
  {
    id: "saas-analytics",
    name: "Analytics Dashboard SaaS",
    category: "saas",
    description: "A modern analytics platform that helps businesses track metrics, visualize data, and make data-driven decisions with real-time dashboards.",
    previewDescription: "Clean, data-focused design with metric cards, chart previews, and enterprise social proof.",
    tone: "professional",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "saas-project-mgmt",
    name: "Project Management Tool",
    category: "saas",
    description: "An intuitive project management platform with Kanban boards, team collaboration, time tracking, and sprint planning for agile teams.",
    previewDescription: "Productivity-focused layout with feature showcase and team collaboration visuals.",
    tone: "professional",
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "mobile-fitness",
    name: "Fitness Tracking App",
    category: "mobile-app",
    description: "A fitness app that tracks workouts, nutrition, sleep, and provides AI-powered personalized training plans. Available on iOS and Android.",
    previewDescription: "Vibrant, energetic design with app screenshots and health metric highlights.",
    tone: "bold",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "mobile-finance",
    name: "Personal Finance App",
    category: "mobile-app",
    description: "A smart personal finance app that helps users track spending, set budgets, invest wisely, and achieve financial goals with AI insights.",
    previewDescription: "Trust-building design with security badges and financial growth visuals.",
    tone: "professional",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "agency-digital",
    name: "Digital Marketing Agency",
    category: "agency",
    description: "A full-service digital marketing agency specializing in SEO, PPC, social media marketing, and content strategy for growing brands.",
    previewDescription: "Bold, creative layout with case study highlights and client logos.",
    tone: "bold",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "portfolio-designer",
    name: "Designer Portfolio",
    category: "portfolio",
    description: "A personal portfolio showcasing UI/UX design work, brand identity projects, and creative direction. Minimalist and visually focused.",
    previewDescription: "Minimal, gallery-style layout with large project images and subtle animations.",
    tone: "minimal",
    color: "from-gray-600 to-gray-900",
  },
  {
    id: "event-conference",
    name: "Tech Conference",
    category: "event",
    description: "An annual tech conference bringing together developers, designers, and entrepreneurs. Featuring 50+ speakers, workshops, and networking events.",
    previewDescription: "Event-focused with speaker cards, schedule preview, and countdown timer.",
    tone: "bold",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "ecommerce-fashion",
    name: "Fashion Brand Store",
    category: "ecommerce",
    description: "A sustainable fashion brand offering premium, eco-friendly clothing. Ethically sourced materials, modern designs, free shipping worldwide.",
    previewDescription: "Elegant, image-heavy layout with product highlights and brand story.",
    tone: "casual",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "newsletter-tech",
    name: "Tech Newsletter",
    category: "newsletter",
    description: "A weekly newsletter delivering curated insights on AI, startups, and tech trends. Read by 50,000+ founders and engineers.",
    previewDescription: "Simple, focused design with sample content preview and subscriber count.",
    tone: "casual",
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: "startup-ai",
    name: "AI Startup Launch",
    category: "ai-tool",
    description: "An AI-powered writing assistant that helps content creators write 10x faster. Features include blog posts, social media, ad copy, and SEO optimization.",
    previewDescription: "Modern, tech-forward design with AI demo preview and feature comparison.",
    tone: "professional",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "devtool-api",
    name: "Developer API Platform",
    category: "dev-tool",
    description: "A powerful API platform for developers. RESTful and GraphQL APIs with real-time webhooks, SDKs in 10+ languages, and 99.99% uptime.",
    previewDescription: "Developer-focused with code snippets, API playground preview, and docs links.",
    tone: "minimal",
    color: "from-slate-600 to-slate-900",
  },
  {
    id: "startup-marketplace",
    name: "Freelance Marketplace",
    category: "startup",
    description: "A marketplace connecting businesses with top freelance talent in design, development, and marketing. Built-in contracts, payments, and reviews.",
    previewDescription: "Two-sided marketplace layout with talent categories and trust signals.",
    tone: "professional",
    color: "from-teal-500 to-cyan-500",
  },
];
