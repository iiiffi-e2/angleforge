import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AngleInput {
  topic: string;
  audience?: string;
  channel: string;
  tone: string;
  goal: string;
  competitorUrl?: string;
  competitorCopy?: string;
}

export interface AngleObject {
  angleName: string;
  hook: string;
  headline: string;
  explanation: string;
  visualSuggestion: string;
  channel: string;
  audience?: string;
  tone: string;
  goal: string;
}

export async function generateAngles(input: AngleInput): Promise<AngleObject[]> {
  if (!process.env.OPENAI_API_KEY) {
    // Mock response for development if no key
    console.warn("No OpenAI API Key found. Returning mock data.");
    return Array(5).fill(null).map((_, i) => ({
      angleName: `Mock Angle ${i + 1}`,
      hook: `This is a hook for ${input.topic}`,
      headline: `Headline ${i + 1}: Why this matters`,
      explanation: `This is an explanation of why this angle works for ${input.audience || 'everyone'}.`,
      visualSuggestion: "A photo of a happy person.",
      channel: input.channel,
      audience: input.audience,
      tone: input.tone,
      goal: input.goal
    }));
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert marketing strategist. You output structured content angles. Always return valid JSON."
      },
      {
        role: "user",
        content: `
Generate 20 unique marketing content angles for:

Topic: ${input.topic}
Audience: ${input.audience || 'General'}
Channel: ${input.channel}
Tone: ${input.tone}
Goal: ${input.goal}
${input.competitorUrl ? `Competitor URL: ${input.competitorUrl}` : ''}
${input.competitorCopy ? `Competitor Copy: ${input.competitorCopy}` : ''}

Each angle must include:
- Angle Name
- Hook
- Headline
- 2–3 sentence explanation
- Suggested visual theme

Return a JSON object with a single key "angles" containing an array of objects. Each object should have these keys: angleName, hook, headline, explanation, visualSuggestion.
The response must be valid JSON.
`
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content returned from OpenAI");
  }

  try {
    const parsed = JSON.parse(content);
    // Enrich with input data
    return parsed.angles.map((angle: any) => ({
      ...angle,
      channel: input.channel,
      audience: input.audience,
      tone: input.tone,
      goal: input.goal
    }));
  } catch (e) {
    console.error("Failed to parse OpenAI response", content);
    throw new Error("Failed to parse OpenAI response");
  }
}
