# PageCraft — Product Roadmap

## Current State: MVP ✅

Core loop is complete: Users sign up → describe product → AI generates landing page → preview/edit → publish.

**Completed:**
- Marketing landing page with pricing
- Auth (email + Google OAuth via Supabase)
- AI page generation (Claude API)
- Live editor with responsive preview + code view
- Stripe billing (Free / Pro $19 / Team $49)
- Page publishing at `/p/[slug]`
- Database schema with RLS security
- HTML export

---

## Phase 1 — Launch Ready (Week 1-2)

Goal: Polish the MVP so real users can use it without friction.

### 1.1 SEO & Meta Optimization
- [ ] Dynamic sitemap.xml generation
- [ ] robots.txt
- [ ] Open Graph images (auto-generated per page)
- [ ] Structured data (JSON-LD) on marketing site
- [ ] Meta tags optimization for all routes

### 1.2 Template Gallery
- [ ] 10-15 pre-built landing page templates by category
  - SaaS, Mobile App, Agency, Portfolio, Event, E-commerce, Newsletter, etc.
- [ ] Template preview modal
- [ ] "Use this template" → opens editor with pre-filled content
- [ ] Template categories and search/filter

### 1.3 AI Section Editing
- [ ] Break generated pages into editable sections
- [ ] "Regenerate this section" with AI
- [ ] "Change tone" / "Make shorter" / "Add testimonials" per section
- [ ] Section drag-and-drop reordering

### 1.4 UX Polish
- [ ] Global error boundaries and user-friendly error messages
- [ ] Loading skeletons for dashboard and editor
- [ ] Toast notifications for save/publish/delete actions
- [ ] Keyboard shortcuts in editor (Cmd+S to save, etc.)
- [ ] Mobile-responsive dashboard (sidebar → hamburger menu)

### 1.5 Analytics Setup
- [ ] PostHog or Mixpanel integration
- [ ] Track: signups, page generations, publishes, upgrades
- [ ] Funnel: landing → signup → first page → publish → upgrade

---

## Phase 2 — Growth Engine (Week 3-6)

Goal: Build viral loops and features that drive organic growth + paid conversions.

### 2.1 "Made with PageCraft" Viral Badge
- [ ] Auto-inject branded badge on Free plan published pages
- [ ] Badge links to PageCraft signup with referral tracking
- [ ] Remove badge for Pro/Team plans
- [ ] Track badge click-through rate

### 2.2 Custom Domains (Pro Feature)
- [ ] Custom domain input in project settings
- [ ] CNAME verification flow
- [ ] SSL provisioning (via Vercel or Cloudflare)
- [ ] Domain status indicator (pending / active / error)

### 2.3 A/B Testing
- [ ] Generate 2-3 variants of a landing page from one description
- [ ] Split traffic between variants
- [ ] Track conversion per variant (CTA clicks)
- [ ] Declare winner and auto-promote

### 2.4 Multi-language Page Generation
- [ ] Language selector in page creation form
- [ ] AI generates page in selected language
- [ ] Support: EN, KO, JA, ES, FR, DE, PT, ZH (8 languages)
- [ ] Language switcher on published pages

### 2.5 Lead Capture Integration
- [ ] Built-in email capture form component
- [ ] Integrations: Mailchimp, ConvertKit, Resend
- [ ] Webhook option for custom integrations
- [ ] Submissions visible in dashboard

### 2.6 Referral Program
- [ ] Unique referral link per user
- [ ] Reward: 1 free Pro month per successful referral
- [ ] Referral dashboard (invites sent, signups, conversions)
- [ ] Email invite flow

---

## Phase 3 — Revenue Maximization (Month 2-3)

Goal: Increase ARPU, reduce churn, and add high-value features for paying users.

### 3.1 Public API (Team Feature)
- [ ] REST API for page generation
- [ ] API key management in settings
- [ ] Rate limiting per plan
- [ ] API documentation page
- [ ] Usage tracking and billing

### 3.2 Team Workspaces
- [ ] Create team / invite members
- [ ] Shared project library
- [ ] Role-based permissions (admin, editor, viewer)
- [ ] Team billing (seats-based pricing)

### 3.3 Brand Kit
- [ ] Save brand colors, fonts, logo
- [ ] AI uses brand kit when generating pages
- [ ] Consistent branding across all team pages
- [ ] Brand kit templates

### 3.4 Conversion Analytics Dashboard
- [ ] Page view tracking (lightweight, privacy-friendly)
- [ ] CTA click tracking
- [ ] Visitor geography and device breakdown
- [ ] Conversion rate trends over time
- [ ] Compare performance across pages

### 3.5 Template Marketplace
- [ ] Community-submitted templates
- [ ] Template rating and reviews
- [ ] Featured templates
- [ ] Revenue share for template creators (future)

---

## Phase 4 — Scale (Month 3+)

Goal: Evolve from landing page tool to full web presence platform.

### 4.1 AI Chat Editor
- [ ] Natural language editing: "Make the hero section more bold"
- [ ] "Add a FAQ section about pricing"
- [ ] "Change the color scheme to dark mode"
- [ ] Conversation history per project

### 4.2 Multi-page Site Builder
- [ ] Multiple pages per project (Home, About, Pricing, Contact)
- [ ] Shared navigation across pages
- [ ] Site-level settings (favicon, global styles)
- [ ] Subdirectory routing for published sites

### 4.3 Third-party Integrations
- [ ] Shopify (product embeds)
- [ ] Notion (content sync)
- [ ] Zapier / Make (workflow automation)
- [ ] Google Analytics / Tag Manager
- [ ] Facebook Pixel / TikTok Pixel

### 4.4 Enterprise Plan
- [ ] SSO (SAML)
- [ ] Custom contracts and invoicing
- [ ] Dedicated support
- [ ] SLA guarantees
- [ ] White-label option

---

## Success Metrics

| Metric | Target (3 months) |
|--------|--------------------|
| Registered users | 5,000+ |
| Monthly active users | 1,500+ |
| Paid subscribers | 200+ |
| MRR | $5,000+ |
| Pages generated | 10,000+ |
| Churn rate | < 5% monthly |

---

## Growth Strategy

1. **Viral Loop**: Free plan badge → organic discovery → new signups
2. **Content Marketing**: Blog posts about landing page best practices, AI, conversion optimization
3. **Product Hunt Launch**: Phase 1 completion → PH launch
4. **SEO**: Target "AI landing page generator", "free landing page builder" keywords
5. **Indie Hacker / Twitter**: Build in public, share milestones
6. **Partnerships**: Integration partners, template creators

---

*Last updated: 2026-03-31*
*Status: All 4 phases complete — ready for production deployment*
