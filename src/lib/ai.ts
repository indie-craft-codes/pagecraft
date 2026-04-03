/**
 * AI Provider Adapter
 *
 * 환경변수 AI_PROVIDER로 사용할 AI 서비스를 선택합니다.
 * - "gemini"    → Google Gemini (기본값)
 * - "anthropic" → Anthropic Claude
 * - "openai"    → OpenAI GPT
 *
 * 각 프로바이더별 필요한 환경변수:
 * - Gemini:    GEMINI_API_KEY
 * - Anthropic: ANTHROPIC_API_KEY
 * - OpenAI:    OPENAI_API_KEY
 */

export interface GeneratePageInput {
  productName: string;
  productDescription: string;
  targetAudience?: string;
  tone?: "professional" | "casual" | "bold" | "minimal";
  colorScheme?: string;
  language?: string;
}

export interface GeneratePageOutput {
  html: string;
  title: string;
  description: string;
}

// ─── 공통 프롬프트 ───────────────────────────────────

function buildPrompt(input: GeneratePageInput): string {
  return `You are an expert landing page designer and copywriter. Generate a complete, production-ready landing page based on the following details:

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
<!-- META: {"title": "Page Title", "description": "Meta description for SEO"} -->`;
}

function parseResponse(
  text: string,
  input: GeneratePageInput
): GeneratePageOutput {
  let html = text.trim();

  // Claude/Gemini sometimes wrap in markdown code blocks
  if (html.startsWith("```")) {
    html = html.replace(/^```(?:html)?\n?/, "").replace(/\n?```$/, "");
  }

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

// ─── 프로바이더 어댑터 ───────────────────────────────

interface AIProvider {
  generate(prompt: string): Promise<string>;
  chatEdit(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string>;
}

// Gemini
async function createGeminiProvider(): Promise<AIProvider> {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  return {
    async generate(prompt: string) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text ?? "";
    },
    async chatEdit(systemPrompt: string, messages: { role: string; content: string }[]) {
      const contents = messages.map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: m.content }],
      }));
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: { systemInstruction: systemPrompt },
        contents,
      });
      return response.text ?? "";
    },
  };
}

// Anthropic
async function createAnthropicProvider(): Promise<AIProvider> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  return {
    async generate(prompt: string) {
      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      });
      const content = message.content[0];
      return content.type === "text" ? content.text : "";
    },
    async chatEdit(systemPrompt: string, messages: { role: string; content: string }[]) {
      const formatted = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        system: systemPrompt,
        messages: formatted,
      });
      const content = message.content[0];
      return content.type === "text" ? content.text : "";
    },
  };
}

// OpenAI (준비됨 — OPENAI_API_KEY 설정 시 사용 가능)
async function createOpenAIProvider(): Promise<AIProvider> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  return {
    async generate(prompt: string) {
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 8000,
      });
      return response.choices[0]?.message?.content ?? "";
    },
    async chatEdit(systemPrompt: string, messages: { role: string; content: string }[]) {
      const formatted = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: formatted,
        max_tokens: 8000,
      });
      return response.choices[0]?.message?.content ?? "";
    },
  };
}

// ─── 프로바이더 팩토리 ────────────────────────────────

let _provider: AIProvider | null = null;

export function getProviderName(): string {
  return process.env.AI_PROVIDER || "gemini";
}

async function getProvider(): Promise<AIProvider> {
  if (_provider) return _provider;

  const provider = getProviderName();

  switch (provider) {
    case "anthropic":
      _provider = await createAnthropicProvider();
      break;
    case "openai":
      _provider = await createOpenAIProvider();
      break;
    case "gemini":
    default:
      _provider = await createGeminiProvider();
      break;
  }

  return _provider;
}

// ─── 공개 API ─────────────────────────────────────────

export async function generateLandingPage(
  input: GeneratePageInput
): Promise<GeneratePageOutput> {
  const provider = await getProvider();
  const prompt = buildPrompt(input);
  const text = await provider.generate(prompt);
  return parseResponse(text, input);
}

export async function chatEditPage(
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const provider = await getProvider();
  return provider.chatEdit(systemPrompt, messages);
}

export async function regenerateSection(
  sectionHtml: string,
  instruction: string,
  fullPageContext?: string
): Promise<string> {
  const provider = await getProvider();
  const prompt = `You are an expert web designer and copywriter. You need to modify a specific section of a landing page based on the user's instruction.

${fullPageContext ? `Here is the FULL PAGE for context:\n${fullPageContext}\n` : ""}

Here is the SPECIFIC SECTION to modify:
\`\`\`html
${sectionHtml}
\`\`\`

User instruction: "${instruction}"

Requirements:
1. Return ONLY the modified HTML for this section
2. Keep the same general structure unless the instruction says otherwise
3. Maintain Tailwind CSS classes and responsive design
4. Keep it consistent with the rest of the page
5. Return ONLY the HTML, no explanations or markdown code blocks`;

  return provider.generate(prompt);
}
