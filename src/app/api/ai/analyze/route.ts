import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/ai/analyze - Analyze call transcript with AI
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript, callId, leadId, userId } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    // Create completion for call summary
    const summaryCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for a life insurance sales agent. Analyze the following call transcript and provide:
1. A concise summary (2-3 sentences)
2. Key facts about the prospect
3. Objections raised during the call
4. Buying signals detected
5. Recommended next action
6. Follow-up date recommendation (if applicable)

Be specific and actionable in your recommendations.`,
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "call_analysis",
          schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "2-3 sentence summary of the call",
              },
              key_facts: {
                type: "array",
                items: { type: "string" },
                description: "Key facts about the prospect",
              },
              objections: {
                type: "array",
                items: { type: "string" },
                description: "Objections raised during the call",
              },
              buying_signals: {
                type: "array",
                items: { type: "string" },
                description: "Positive buying signals detected",
              },
              recommended_next_action: {
                type: "string",
                description: "Specific next action to take",
              },
              follow_up_date: {
                type: "string",
                description: "Recommended follow-up date (YYYY-MM-DD or null)",
              },
              sentiment_score: {
                type: "number",
                description: "Sentiment score from -100 to 100",
              },
            },
            required: ["summary", "key_facts", "objections", "buying_signals", "recommended_next_action", "follow_up_date", "sentiment_score"],
          },
        },
      },
    });

    const analysis = JSON.parse(summaryCompletion.choices[0].message.content || "{}");

    // Create completion for coaching report
    const coachingCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional sales coach for life insurance agents. Analyze the following call transcript and provide a detailed coaching report with:

1. Talk-to-listen ratio (percentage)
2. Number of questions asked
3. Objection handling score (0-100)
4. Confidence score (0-100)
5. Empathy score (0-100)
6. Closing effectiveness score (0-100)
7. Missed opportunities (array of strings)
8. Recommended improvements (array of specific, actionable suggestions)

Be constructive and specific in your feedback. Focus on behaviors the agent can improve.`,
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "coaching_report",
          schema: {
            type: "object",
            properties: {
              talk_ratio: {
                type: "number",
                description: "Percentage of time the agent was talking (0-100)",
              },
              question_count: {
                type: "number",
                description: "Number of questions asked by the agent",
              },
              objection_handling_score: {
                type: "number",
                description: "Score from 0-100",
              },
              confidence_score: {
                type: "number",
                description: "Score from 0-100",
              },
              empathy_score: {
                type: "number",
                description: "Score from 0-100",
              },
              closing_score: {
                type: "number",
                description: "Score from 0-100",
              },
              missed_opportunities: {
                type: "array",
                items: { type: "string" },
                description: "List of missed opportunities",
              },
              recommended_improvements: {
                type: "array",
                items: { type: "string" },
                description: "Specific improvement suggestions",
              },
            },
            required: ["talk_ratio", "question_count", "objection_handling_score", "confidence_score", "empathy_score", "closing_score", "missed_opportunities", "recommended_improvements"],
          },
        },
      },
    });

    const coaching = JSON.parse(coachingCompletion.choices[0].message.content || "{}");

    // Return both analyses
    return NextResponse.json({
      summary: analysis,
      coaching,
    });
  } catch (error) {
    console.error("Error analyzing call:", error);
    return NextResponse.json(
      { error: "Failed to analyze call" },
      { status: 500 }
    );
  }
}
