/**
 * Real-Time AI Sales Copilot API
 *
 * This endpoint handles real-time call analysis via WebSocket.
 * It streams audio, transcribes, and returns AI suggestions in real-time.
 *
 * Flow:
 * 1. Twilio streams audio to this endpoint
 * 2. Audio is sent to OpenAI Whisper for transcription
 * 3. Transcripts are analyzed by GPT-4 for:
 *    - Client information extraction
 *    - Question detection
 *    - Suggested responses
 *    - Follow-up reminders
 * 4. Results streamed back to the agent's screen
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for the AI sales copilot
const COPILOT_SYSTEM_PROMPT = `You are an expert insurance sales assistant listening to a live call in real-time.

Your job is to:
1. TRANSCRIBE: Convert speech to text
2. EXTRACT: Pull out key client information as JSON
3. ANSWER: Provide suggested responses to client questions
4. REMIND: Flag important moments to remember

Extract this information when mentioned:
- Name
- Marital status
- Number of children / ages
- Age / Date of birth
- Occupation
- Annual income
- Budget concerns
- Current insurance coverage
- Family health history
- Goals / Concerns

When the client asks a question, provide a helpful, accurate response based on insurance best practices.

Format your response as JSON:
{
  "transcript": "what was just said",
  "extracted_info": {
    "name": "if mentioned",
    "marital_status": "if mentioned",
    "children": "if mentioned",
    "ages": "if mentioned",
    "occupation": "if mentioned",
    "income": "if mentioned",
    "budget": "if mentioned",
    "concerns": ["list of concerns mentioned"]
  },
  "client_question": "if the client asked a question, repeat it here",
  "suggested_response": "if there was a question, provide a helpful answer",
  "action_items": ["things to remember or do after the call"],
  "sentiment": "positive | neutral | negative | concerned",
  "engagement_level": 1-10
}

Be concise and fast - agents need real-time responses.`;

/**
 * POST - Start a new copilot session
 *
 * Creates a new real-time analysis session for a call.
 * Returns session ID and connection details.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { call_sid, lead_id, agent_id } = body;

    if (!call_sid || !lead_id) {
      return NextResponse.json(
        { error: "Missing call_sid or lead_id" },
        { status: 400 }
      );
    }

    // Create a new session
    const sessionId = `copilot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In production, you'd store this in Redis or a database
    // For now, return the session details

    return NextResponse.json({
      session_id: sessionId,
      call_sid,
      lead_id,
      agent_id,
      status: "ready",
      websocket_url: process.env.WEBSOCKET_URL || null,
      instructions: "Connect to WebSocket for real-time streaming",
    });

  } catch (error) {
    console.error("Error starting copilot session:", error);
    return NextResponse.json(
      { error: "Failed to start copilot session" },
      { status: 500 }
    );
  }
}

/**
 * GET - Get copilot session status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id" },
      { status: 400 }
    );
  }

  // In production, fetch from Redis/database
  return NextResponse.json({
    session_id: sessionId,
    status: "active",
    duration_seconds: 0,
    transcript_segments: [],
    extracted_info: {},
  });
}
