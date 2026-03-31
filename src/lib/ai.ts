import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface GeneratePageInput {
  productName: string;
  productDescription: string;
  targetAudience?: string;
  tone?: "professional" | "casual" | "bold" | "minimal";
  colorScheme?: string;
  language?: string; // e.g., "en", "ko", "ja"
}

export async function generateLandingPage(input: GeneratePageInput): Promise<{
  html: string;
  title: string;
  description: string;
}> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `You are an expert landing page designer and copywriter. Generate a complete, production-ready landing page based on the following details:

Product Name: ${input.productName}
Product Description: ${input.productDescription}
${input.targetAudience ? `Target Audience: ${input.targetAudience}` : ""}
Tone: ${input.tone || "professional"}
${input.colorScheme ? `Color Scheme: ${input.colorScheme}` : "Use a modern, appealing color scheme"}
${input.language && input.language !== "en" ? `Language: Write ALL text content in ${input.language}. The HTML lang attribute should be "${input.language}".` : ""}

Requirements:
1. Return ONLY valid HTML with inline Tailwind CSS classes (using CDN)
2. Include these sections: Hero, Features (3-4), Social Proof/Testimonials, Pricing/CTA, Footer
3. Make it fully responsive (mobile-first)
4. Use modern design patterns (gradients, shadows, rounded corners)
5. Include compelling, conversion-optimized copy
6. Add smooth scroll behavior
7. Include a sticky navigation header
8. Use placeholder images from https://placehold.co
9. The HTML must be a complete document with <!DOCTYPE html>, <head>, and <body>
10. Include the Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>

Return ONLY the HTML code, no explanations. Also include a JSON comment at the very end of the HTML like:
<!-- META: {"title": "Page Title", "description": "Meta description for SEO"} -->`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  const html = content.text.trim();

  // Extract meta from comment
  const metaMatch = html.match(/<!-- META: ({.*?}) -->/);
  let title = input.productName;
  let description = input.productDescription.slice(0, 160);

  if (metaMatch) {
    try {
      const meta = JSON.parse(metaMatch[1]);
      title = meta.title || title;
      description = meta.description || description;
    } catch {
      // Use defaults
    }
  }

  return { html, title, description };
}
