/**
 * Real-Time AI Copilot Service
 *
 * This service handles WebSocket connections for real-time call analysis.
 *
 * To use this:
 * 1. Set up a WebSocket server (can be separate from Next.js)
 * 2. Configure Twilio to stream audio to this endpoint
 * 3. Open the copilot UI on your phone/tablet during calls
 *
 * Example WebSocket URL: wss://your-app.vercel.app/api/realtime/ws
 */

import { createClient } from "@/lib/supabase/server";

interface CopilotMessage {
  type: "audio" | "transcript" | "extracted_info" | "suggestion" | "error";
  session_id: string;
  data: any;
  timestamp: number;
}

interface ClientInfo {
  name?: string;
  marital_status?: string;
  children?: string;
  children_ages?: string[];
  age?: number;
  occupation?: string;
  income?: string;
  budget_concerns?: string[];
  current_coverage?: string;
  health_history?: string[];
  goals?: string[];
  concerns?: string[];
}

interface AnalysisResult {
  transcript: string;
  speaker: "agent" | "client";
  extracted_info: Partial<ClientInfo>;
  client_question?: string;
  suggested_response?: string;
  action_items: string[];
  sentiment: "positive" | "neutral" | "negative" | "concerned";
  engagement_level: number;
}

/**
 * Process audio chunk through AI
 *
 * Takes an audio chunk and returns real-time analysis
 */
export async function processAudioChunk(
  audioData: Buffer,
  sessionId: string,
  leadId: string
): Promise<AnalysisResult | null> {
  try {
    // In production, you would:
    // 1. Send audio to OpenAI Whisper API for transcription
    // 2. Send transcript to GPT-4 for analysis
    // 3. Return structured results

    // For now, this is a placeholder that shows the expected behavior
    return null;
  } catch (error) {
    console.error("Error processing audio:", error);
    return null;
  }
}

/**
 * Analyze transcript with GPT-4
 *
 * Takes a transcript segment and returns AI analysis
 */
export async function analyzeTranscript(
  transcript: string,
  context: {
    leadId: string;
    sessionId: string;
    previousExtractedInfo: Partial<ClientInfo>;
  }
): Promise<AnalysisResult> {
  try {
    // Use OpenAI for analysis
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const previousInfo = context.previousExtractedInfo;

    const prompt = `
You are an AI sales copilot listening to an insurance sales call.

PREVIOUS INFO COLLECTED:
${previousInfo.name ? `- Name: ${previousInfo.name}` : ""}
${previousInfo.marital_status ? `- Marital Status: ${previousInfo.marital_status}` : ""}
${previousInfo.children ? `- Children: ${previousInfo.children}` : ""}
${previousInfo.age ? `- Age: ${previousInfo.age}` : ""}
${previousInfo.occupation ? `- Occupation: ${previousInfo.occupation}` : ""}
${previousInfo.income ? `- Income: ${previousInfo.income}` : ""}
${previousInfo.budget_concerns?.length ? `- Budget Concerns: ${previousInfo.budget_concerns.join(", ")}` : ""}
${previousInfo.concerns?.length ? `- Concerns: ${previousInfo.concerns.join(", ")}` : ""}

CURRENT TRANSCRIPT:
${transcript}

Analyze this transcript and return a JSON response with:
- Update any extracted_info fields if new information was mentioned
- If client asked a question, put it in client_question and provide a suggested response
- List action items (things to follow up on)
- Rate sentiment and engagement

Return ONLY valid JSON, no markdown:
{
  "transcript": "the transcript text",
  "speaker": "agent" or "client",
  "extracted_info": {
    "name": "updated if mentioned",
    "marital_status": "updated if mentioned",
    "children": "updated if mentioned",
    "children_ages": ["ages of children if mentioned"],
    "age": number if mentioned,
    "occupation": "updated if mentioned",
    "income": "updated if mentioned",
    "budget_concerns": ["concerns about budget/pricing"],
    "current_coverage": "existing policies mentioned",
    "goals": ["what they want to achieve"],
    "concerns": ["fears or objections"]
  },
  "client_question": "question asked by client if any",
  "suggested_response": "helpful response to their question",
  "action_items": ["things to remember or do"],
  "sentiment": "positive|neutral|negative|concerned",
  "engagement_level": 1-10
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert insurance sales assistant. Be helpful, concise, and accurate."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent outputs
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing transcript:", error);
    return {
      transcript,
      speaker: "client",
      extracted_info: {},
      action_items: [],
      sentiment: "neutral",
      engagement_level: 5,
    };
  }
}

/**
 * Update lead profile with extracted info
 */
export async function updateLeadProfile(
  leadId: string,
  extractedInfo: Partial<ClientInfo>,
  agentId: string
): Promise<void> {
  try {
    const supabase = await createClient();

    // Only update fields that were extracted
    const updates: Record<string, any> = {};

    // Map extracted info to lead fields
    // Note: The leads table has specific fields - this would need to match your schema

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId);

      if (error) {
        console.error("Error updating lead profile:", error);
      }
    }

    // Log the activity
    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      user_id: agentId,
      activity_type: "ai_action",
      content: `AI Copilot extracted info: ${JSON.stringify(extractedInfo)}`,
      metadata: extractedInfo,
    });

  } catch (error) {
    console.error("Error updating lead profile:", error);
  }
}

/**
 * Generate call summary after call ends
 */
export async function generateCallSummary(
  leadId: string,
  transcriptSegments: { transcript: string; speaker: string; timestamp: number }[],
  agentId: string
): Promise<{
  summary: string;
  key_points: string[];
  next_steps: string[];
}> {
  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const fullTranscript = transcriptSegments
      .map(s => `${s.speaker}: ${s.transcript}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert insurance sales analyst. Generate a comprehensive summary of this sales call.`
        },
        {
          role: "user",
          content: `
Generate a summary of this insurance sales call:

${fullTranscript}

Return a JSON response:
{
  "summary": "2-3 sentence summary of the call",
  "key_points": ["list of important things discussed"],
  "next_steps": ["recommended next actions"],
  "client_readiness": "ready_to_buy|needs_more_info|not_interested|undecided",
  "recommended_follow_up": "what to do next"
}
`
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content);

  } catch (error) {
    console.error("Error generating call summary:", error);
    return {
      summary: "Call completed.",
      key_points: [],
      next_steps: ["Follow up with client"],
    };
  }
}

/**
 * Export all functions for use in other modules
 */
export const copilotService = {
  processAudioChunk,
  analyzeTranscript,
  updateLeadProfile,
  generateCallSummary,
};
