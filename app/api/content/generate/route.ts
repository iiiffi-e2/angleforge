import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isProUser } from "@/lib/planCheck";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ContentType = "LinkedIn Post" | "Blog Post" | "Email" | "Ad Copy" | "Social Caption";
type Length = "Short" | "Medium" | "Long";

interface ContentRequest {
  angleName: string;
  hook: string;
  headline: string;
  explanation: string;
  visualSuggestion: string;
  channel: string;
  tone: string;
  goal: string;
  audience?: string;
  sourceTopic?: string;
  contentType: ContentType;
  length?: Length;
  customCTA?: string;
  generateImage?: boolean;
}

function buildPrompt(req: ContentRequest): string {
  const {
    angleName,
    hook,
    headline,
    explanation,
    visualSuggestion,
    channel,
    tone,
    goal,
    audience,
    sourceTopic,
    contentType,
    length = "Medium",
    customCTA
  } = req;

  const lengthGuidance = {
    "Short": "Keep it concise and punchy. For LinkedIn: 2-3 short paragraphs. For Blog: 300-500 words. For Email: Brief, scannable. For Ad Copy: Very tight. For Social: 1-2 sentences.",
    "Medium": "Standard length. For LinkedIn: 4-6 paragraphs. For Blog: 800-1200 words. For Email: Moderate length. For Ad Copy: Standard format. For Social: 2-4 sentences.",
    "Long": "Comprehensive and detailed. For LinkedIn: 7+ paragraphs. For Blog: 1500+ words with multiple sections. For Email: Detailed explanation. For Ad Copy: Extended format. For Social: 4+ sentences."
  };

  const baseContext = `
Angle Name: ${angleName}
Hook: ${hook}
Headline: ${headline}
Explanation: ${explanation}
Visual Suggestion: ${visualSuggestion}
Channel: ${channel}
Tone: ${tone}
Goal: ${goal}
${audience ? `Audience: ${audience}` : ''}
${sourceTopic ? `Source Topic: ${sourceTopic}` : ''}
${customCTA ? `Custom CTA: ${customCTA}` : ''}
Length: ${length}
${lengthGuidance[length]}
`;

  switch (contentType) {
    case "LinkedIn Post":
      return `Write a LinkedIn post based on this marketing angle. 

${baseContext}

Requirements:
- Start with the hook in the first 1-2 lines to grab attention
- Use short, punchy lines (break up paragraphs for readability)
- Write from a clear point of view (POV-driven)
- End with a soft CTA or engaging question
- Match the specified tone: ${tone}
- Aim for the ${length} length guideline
- Do NOT include meta explanations or instructions
- Output ONLY the finished LinkedIn post content

Return the complete LinkedIn post ready to publish.`;

    case "Blog Post":
      return `Write a blog post based on this marketing angle.

${baseContext}

Requirements:
- Start with an introduction that frames the problem or opportunity
- Structure the body with clear subheadings (use ## for main sections, ### for subsections)
- Express the angle clearly throughout the post
- End with a strong conclusion and clear CTA
- Match the specified tone: ${tone}
- Aim for the ${length} length guideline
- Do NOT include meta explanations or instructions
- Output ONLY the finished blog post content with markdown formatting

Return the complete blog post ready to publish.`;

    case "Email":
      return `Write an email based on this marketing angle.

${baseContext}

Requirements:
- MUST include a subject line at the top (format: Subject: [subject line])
- Include an optional preview line after the subject (format: Preview: [preview text])
- Write in a conversational tone
- Use short paragraphs for readability
- Place the CTA at the end
- Match the specified tone: ${tone}
- Aim for the ${length} length guideline
- Do NOT include meta explanations or instructions
- Output ONLY the finished email content

Format:
Subject: [subject line]
Preview: [preview text]

[email body]

Return the complete email ready to send.`;

    case "Ad Copy":
      return `Write ad copy based on this marketing angle.

${baseContext}

Requirements:
- Generate a minimum of 3 variations
- Each variation must include:
  - Headline
  - Primary text (body copy)
- Make it punchy and benefit-driven
- Match the specified tone: ${tone}
- Aim for the ${length} length guideline
- Do NOT include meta explanations or instructions
- Output ONLY the finished ad copy variations

Format each variation as:
Variation 1:
Headline: [headline]
Primary Text: [body copy]

Variation 2:
[repeat format]

Return all variations ready to use.`;

    case "Social Caption":
      return `Write a social media caption based on this marketing angle.

${baseContext}

Requirements:
- Start with a strong, attention-grabbing first line
- Write in a conversational tone
- Include optional relevant hashtags at the end (3-5 hashtags)
- Match the specified tone: ${tone}
- Aim for the ${length} length guideline (compact for Short, expressive for Long)
- Do NOT include meta explanations or instructions
- Output ONLY the finished social caption

Return the complete social caption ready to post.`;

    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Validate Pro tier
  const isPro = await isProUser(session.user.id);
  if (!isPro) {
    return new NextResponse("Content generation is only available for Pro users. Please upgrade to access this feature.", { status: 403 });
  }

  try {
    const body: ContentRequest = await req.json();
    
    // Validate required fields
    if (!body.angleName || !body.hook || !body.headline || !body.explanation || !body.contentType) {
      return new NextResponse("Missing required fields: angleName, hook, headline, explanation, and contentType are required", { status: 400 });
    }

    // Build prompt
    const prompt = buildPrompt(body);

    // Generate content
    if (!process.env.OPENAI_API_KEY) {
      // Mock response for development
      console.warn("No OpenAI API Key found. Returning mock data.");
      return NextResponse.json({
        contentType: body.contentType,
        content: `[Mock ${body.contentType} content based on: ${body.angleName}]`,
        imageUrl: body.generateImage ? "https://via.placeholder.com/1024x1024?text=Mock+Image" : null
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert copywriter. Generate polished, ready-to-use marketing content. Never include meta explanations, instructions, or notes about the content. Output only the finished content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: body.contentType === "Blog Post" && body.length === "Long" ? 3000 : 2000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Generate image if requested
    let imageUrl: string | null = null;
    if (body.generateImage && body.visualSuggestion) {
      try {
        // Build image prompt from visual suggestion and angle context
        const imagePrompt = `Create a professional, high-quality marketing image. 
        
Visual concept: ${body.visualSuggestion}
Theme: ${body.angleName}
Context: ${body.headline}
Tone: ${body.tone}
Channel: ${body.channel}
${body.audience ? `Target audience: ${body.audience}` : ''}

The image should be visually compelling, modern, and suitable for marketing use. It should clearly represent the visual concept while maintaining a ${body.tone} aesthetic appropriate for ${body.channel}. High resolution, professional quality, engaging composition.`;
        
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: imagePrompt.trim(),
          n: 1,
          size: "1024x1024",
          quality: "standard",
        });

        if (imageResponse.data && imageResponse.data[0]?.url) {
          imageUrl = imageResponse.data[0].url;
        }
      } catch (imageError: any) {
        console.error("Image generation error:", imageError);
        // Don't fail the entire request if image generation fails
        // Just log the error and continue without image
      }
    }

    return NextResponse.json({
      contentType: body.contentType,
      content: content.trim(),
      imageUrl: imageUrl
    });

  } catch (error: any) {
    console.error("Content generation error:", error);
    return new NextResponse(
      error.message || "Failed to generate content",
      { status: 500 }
    );
  }
}


