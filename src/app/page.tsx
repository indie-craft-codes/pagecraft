import Link from "next/link";
import {
  Sparkles,
  Zap,
  Globe,
  Code,
  ArrowRight,
  Check,
  Star,
} from "lucide-react";

function Header() {
  return (
    <header className="glass fixed top-0 w-full z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">PageCraft</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Landing Pages
          </span>
        </div>
        <h1 className="animate-fade-in text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
          Build landing pages
          <br />
          <span className="gradient-text">in seconds, not days</span>
        </h1>
        <p className="animate-fade-in-delay mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Describe your product. AI generates a stunning, conversion-optimized
          landing page — complete with copy, design, and code. Ready to publish
          instantly.
        </p>
        <div className="animate-fade-in-delay-2 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/25"
          >
            Start Creating Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            See How It Works
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          No credit card required · Free plan available
        </p>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Generated Copy",
      description:
        "Our AI writes conversion-optimized headlines, CTAs, and body copy tailored to your product and audience.",
    },
    {
      icon: Zap,
      title: "Ready in Seconds",
      description:
        "Go from product description to a polished, responsive landing page in under 30 seconds. No design skills needed.",
    },
    {
      icon: Globe,
      title: "One-Click Publish",
      description:
        "Publish to a free PageCraft subdomain or connect your own custom domain. SSL included automatically.",
    },
    {
      icon: Code,
      title: "Export Clean Code",
      description:
        "Download the generated HTML/CSS or React components. Full ownership of your code with no vendor lock-in.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Everything you need to launch fast
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            PageCraft handles the design, copy, and deployment so you can focus
            on what matters — your product.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Describe Your Product",
      description:
        "Tell us about your product, target audience, and preferred tone. A few sentences is all it takes.",
    },
    {
      step: "02",
      title: "AI Generates Your Page",
      description:
        "Our AI creates a complete landing page with compelling copy, modern design, and responsive layout.",
    },
    {
      step: "03",
      title: "Customize & Publish",
      description:
        "Preview your page, make any edits, then publish with one click or download the code.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Three steps to launch
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            From idea to live landing page in under a minute.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white text-lg font-bold mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    {
      quote:
        "PageCraft saved us weeks of work. We launched our product landing page in 10 minutes and got our first signups the same day.",
      name: "Sarah Chen",
      role: "Founder, LaunchKit",
      stars: 5,
    },
    {
      quote:
        "The AI-generated copy was better than what we had before. It actually understands conversion optimization.",
      name: "Marcus Rodriguez",
      role: "Head of Marketing, GrowthLab",
      stars: 5,
    },
    {
      quote:
        "As a solo developer, I don't have time for design. PageCraft lets me create professional pages without hiring a designer.",
      name: "Alex Kim",
      role: "Indie Hacker",
      stars: 5,
    },
  ];

  return (
    <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Loved by builders worldwide
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white p-6 rounded-2xl border border-gray-100"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-gray-500 text-sm">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Perfect for trying out PageCraft",
      features: [
        "1 landing page per month",
        "PageCraft branding",
        "Basic templates",
        "HTML export",
      ],
      cta: "Get Started Free",
      href: "/signup",
      featured: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "For creators and marketers who ship fast",
      features: [
        "Unlimited landing pages",
        "No branding",
        "Custom domains",
        "Priority AI generation",
        "All templates",
        "HTML & React export",
      ],
      cta: "Start Pro Trial",
      href: "/signup?plan=pro",
      featured: true,
    },
    {
      name: "Team",
      price: "$49",
      period: "/month",
      description: "For teams building at scale",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Brand kit & style guide",
        "API access",
        "Priority support",
        "Analytics dashboard",
      ],
      cta: "Start Team Trial",
      href: "/signup?plan=team",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Start free. Upgrade when you&apos;re ready to grow.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.featured
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-600/20 scale-105"
                  : "bg-white border border-gray-200"
              }`}
            >
              <h3
                className={`text-lg font-semibold ${plan.featured ? "text-indigo-100" : "text-gray-900"}`}
              >
                {plan.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span
                    className={
                      plan.featured ? "text-indigo-200" : "text-gray-500"
                    }
                  >
                    {plan.period}
                  </span>
                )}
              </div>
              <p
                className={`mt-2 text-sm ${plan.featured ? "text-indigo-200" : "text-gray-500"}`}
              >
                {plan.description}
              </p>
              <Link
                href={plan.href}
                className={`mt-6 block w-full text-center py-2.5 rounded-lg text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {plan.cta}
              </Link>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.featured ? "text-indigo-200" : "text-indigo-600"}`}
                    />
                    <span
                      className={`text-sm ${plan.featured ? "text-indigo-100" : "text-gray-600"}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Ready to build your next landing page?
        </h2>
        <p className="mt-4 text-lg text-indigo-100">
          Join thousands of creators who ship faster with PageCraft.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 text-base font-semibold text-indigo-600 bg-white rounded-xl hover:bg-indigo-50 transition shadow-lg"
        >
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="text-lg font-bold text-white">PageCraft</span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered landing page generator. Build beautiful, high-converting
              pages in seconds.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Templates
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  API
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {new Date().getFullYear()} PageCraft. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
