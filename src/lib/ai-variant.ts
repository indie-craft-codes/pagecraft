/**
 * AI variant generation — uses the shared AI adapter
 */

export default async function generateVariant(
  originalHtml: string,
  variantInstruction?: string
): Promise<string> {
  // Dynamic import to avoid circular deps
  const ai = await import("@/lib/ai");
  const provider = await getProviderInstance();

  const prompt = `You are an expert at A/B testing and conversion rate optimization.

Here is the original landing page:
\`\`\`html
${originalHtml}
\`\`\`

${variantInstruction ? `Specific changes requested: "${variantInstruction}"` : "Create a meaningfully different variant that tests a different conversion hypothesis."}

Create a VARIANT of this page that:
1. Tests a different approach to converting visitors (different headline angle, different CTA, different layout, different social proof approach)
2. Maintains the same product information and branding
3. Is a complete, valid HTML document
4. Uses Tailwind CSS via CDN
5. Is meaningfully different, not just cosmetic changes

Return ONLY the complete HTML. No explanations.`;

  const text = await provider.generate(prompt);

  let html = text.trim();
  if (html.startsWith("```")) {
    html = html.replace(/^```(?:html)?\n?/, "").replace(/\n?```$/, "");
  }

  return html;
}

// Re-use the provider factory from ai.ts
async function getProviderInstance() {
  const { getProviderName } = await import("@/lib/ai");
  const provider = getProviderName();

  switch (provider) {
    case "anthropic": {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      return {
        async generate(prompt: string) {
          const msg = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 8000,
            messages: [{ role: "user", content: prompt }],
          });
          return msg.content[0].type === "text" ? msg.content[0].text : "";
        },
      };
    }
    case "openai": {
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
      return {
        async generate(prompt: string) {
          const res = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 8000,
          });
          return res.choices[0]?.message?.content ?? "";
        },
      };
    }
    default: {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      return {
        async generate(prompt: string) {
          const res = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          return res.text ?? "";
        },
      };
    }
  }
}
