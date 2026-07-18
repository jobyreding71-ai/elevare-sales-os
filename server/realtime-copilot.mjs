/**
 * Real-Time AI Sales Copilot Server
 *
 * This Node.js WebSocket server handles:
 * 1. Twilio Media Streams (incoming audio)
 * 2. OpenAI Realtime API integration
 * 3. Live transcription and analysis
 * 4. Real-time coaching suggestions
 *
 * Run with: node server/realtime-copilot.mjs
 * Or deploy to a WebSocket-compatible hosting (Railway, Render, etc.)
 */

import { WebSocketServer } from "ws";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// Configuration
const PORT = process.env.REALTIME_PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase admin client
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

// Initialize OpenAI
const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

// Insurance sales system prompt
const SYSTEM_PROMPT = `You are an expert AI sales coach for life insurance agents. You are listening to a live sales call in real-time.

Your role is to:
1. Transcribe and understand the conversation
2. Identify key moments (questions, objections, buying signals)
3. Provide real-time coaching suggestions
4. Alert on critical issues (compliance, tone, missed opportunities)

Response format (JSON):
{
  "transcript": "current transcript of conversation",
  "insights": {
    "agent_talk_ratio": 0-100,
    "questions_asked": number,
    "objections_handled": ["list of objections"],
    "buying_signals": ["detected buying signals"],
    "sentiment": "positive|neutral|negative"
  },
  "coaching": {
    "current_need": "what agent should focus on now",
    "suggestion": "specific actionable suggestion",
    "script_tip": "if applicable, a helpful phrase"
  },
  "alerts": ["any urgent alerts (compliance, etc)"],
  "next_action": "recommended next step"
}

Keep responses brief and actionable. The agent needs quick, useful information during a fast-paced call.`;

// Store active calls and their state
const activeCalls = new Map();

/**
 * Create OpenAI Realtime session for live conversation analysis
 */
async function createOpenAISession(callSid) {
  if (!openai) {
    console.warn("OpenAI not configured, using mock responses");
    return null;
  }

  try {
    // Create a realtime session
    const session = await openai.realtimeSessions.create({
      model: "gpt-4o-realtime-preview",
      modalities: ["text"],
      instructions: SYSTEM_PROMPT,
    });

    return session;
  } catch (error) {
    console.error("Failed to create OpenAI session:", error);
    return null;
  }
}

/**
 * Process audio chunk through OpenAI for real-time analysis
 */
async function processAudioChunk(callSid, audioChunk, transcript = "") {
  if (!openai) {
    return generateMockAnalysis(transcript);
  }

  try {
    // For demo, use Chat Completions with the transcript
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze this call transcript for coaching:\n\n${transcript || "[Audio received - processing]"}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const analysis = JSON.parse(response.choices[0].message.content);

    // Store analysis for this call
    const callState = activeCalls.get(callSid);
    if (callState) {
      callState.analysis = analysis;
      callState.lastUpdate = Date.now();
    }

    return analysis;
  } catch (error) {
    console.error("OpenAI processing error:", error);
    return generateMockAnalysis(transcript);
  }
}

/**
 * Generate mock analysis when OpenAI is not available
 */
function generateMockAnalysis(transcript) {
  return {
    transcript: transcript || "Listening...",
    insights: {
      agent_talk_ratio: 45,
      questions_asked: 3,
      objections_handled: [],
      buying_signals: [],
      sentiment: "neutral"
    },
    coaching: {
      current_need: "Continue building rapport",
      suggestion: "Ask another qualifying question",
      script_tip: "Tell me more about your coverage goals?"
    },
    alerts: [],
    next_action: "Ask about current coverage"
  };
}

/**
 * Handle incoming Twilio media stream connection
 */
function handleMediaStream(ws, callSid, params = {}) {
  console.log(`New media stream for call: ${callSid}`);

  const callState = {
    callSid,
    ws,
    params,
    transcript: [],
    analysis: null,
    startTime: Date.now(),
    lastUpdate: Date.now(),
    audioBuffer: Buffer.alloc(0),
  };

  activeCalls.set(callSid, callState);

  // Create OpenAI session
  createOpenAISession(callSid).then(session => {
    if (session) {
      callState.openaiSession = session;
      console.log(`OpenAI session created for ${callSid}`);
    }
  });

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.event) {
        case "media":
          // Handle audio chunk
          const audioBuffer = Buffer.from(data.media.payload, "base64");
          callState.audioBuffer = Buffer.concat([callState.audioBuffer, audioBuffer]);

          // Process every ~5 seconds of audio
          if (callState.audioBuffer.length > 80000) { // ~5 sec of 16kHz audio
            await processAudioChunk(callSid, callState.transcript.join(" "));
            callState.audioBuffer = Buffer.alloc(0);
          }
          break;

        case "start":
          console.log(`Stream started:`, data.start);
          callState.params = data.start?.streamSid ? { streamSid: data.start.streamSid } : {};
          break;

        case "stop":
          console.log(`Stream stopped for ${callSid}`);
          // Final analysis and cleanup
          await finalizeCall(callSid);
          break;

        case "mark":
          // Twilio mark messages (timestamps)
          console.log(`Mark received:`, data.mark?.name);
          break;

        default:
          console.log(`Unknown event:`, data.event);
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log(`WebSocket closed for ${callSid}`);
    finalizeCall(callSid);
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for ${callSid}:`, error);
    finalizeCall(callSid);
  });
}

/**
 * Finalize call and save analysis to database
 */
async function finalizeCall(callSid) {
  const callState = activeCalls.get(callSid);
  if (!callState) return;

  try {
    // Generate final analysis
    const finalAnalysis = await processAudioChunk(
      callSid,
      callState.transcript.join(" "),
      true // final flag
    );

    // Save to database if available
    if (supabase && callState.params?.leadId) {
      await supabase.from("calls").insert({
        lead_id: callState.params.leadId,
        transcript: callState.transcript.join("\n"),
        ai_summary: finalAnalysis.transcript,
        ai_objections: finalAnalysis.insights?.objections_handled || [],
        ai_buying_signals: finalAnalysis.insights?.buying_signals || [],
        ai_next_actions: [finalAnalysis.next_action].filter(Boolean),
        sentiment_score: finalAnalysis.insights?.sentiment === "positive" ? 0.8 :
                        finalAnalysis.insights?.sentiment === "negative" ? 0.3 : 0.5,
        duration_seconds: Math.floor((Date.now() - callState.startTime) / 1000),
      });
    }

    console.log(`Call ${callSid} finalized and saved`);
  } catch (error) {
    console.error(`Error finalizing call ${callSid}:`, error);
  } finally {
    activeCalls.delete(callSid);
  }
}

/**
 * Broadcast call state to connected dashboard clients
 */
function broadcastToDashboards(callSid) {
  const callState = activeCalls.get(callSid);
  if (!callState) return;

  // This would be handled by a separate WebSocket for dashboard clients
  // The dashboard clients subscribe to specific callSid updates
  const update = {
    type: "call_update",
    callSid,
    analysis: callState.analysis,
    transcript: callState.transcript.slice(-5), // Last 5 entries
    duration: Math.floor((Date.now() - callState.startTime) / 1000),
  };

  // In production, this would broadcast to dashboard WebSocket connections
  console.log("Dashboard update:", JSON.stringify(update));
}

/**
 * Start the WebSocket server
 */
function startServer() {
  const wss = new WebSocketServer({ port: PORT });

  console.log(`🚀 Real-Time AI Copilot Server running on port ${PORT}`);
  console.log(`   - Twilio streams: ws://localhost:${PORT}/stream`);
  console.log(`   - Dashboard: ws://localhost:${PORT}/dashboard`);

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname;

    if (path === "/stream" || path === "/api/twilio/stream") {
      // Twilio media stream connection
      const params = Object.fromEntries(url.searchParams);
      const callSid = params.callSid || `call_${Date.now()}`;
      handleMediaStream(ws, callSid, params);
    } else if (path === "/dashboard") {
      // Dashboard client connection for live updates
      console.log("Dashboard client connected");
      ws.on("message", (message) => {
        const data = JSON.parse(message);
        if (data.type === "subscribe") {
          // Subscribe to call updates
          ws.subscribedCall = data.callSid;
        }
      });
    } else {
      ws.close(1002, "Unknown path");
    }
  });

  // Periodic updates for dashboards
  setInterval(() => {
    activeCalls.forEach((callState, callSid) => {
      broadcastToDashboards(callSid);
    });
  }, 2000);

  return wss;
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { startServer, handleMediaStream, processAudioChunk };
