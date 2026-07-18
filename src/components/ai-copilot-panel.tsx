"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Zap,
  Brain,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Analysis {
  transcript: string;
  insights: {
    agent_talk_ratio: number;
    questions_asked: number;
    objections_handled: string[];
    buying_signals: string[];
    sentiment: "positive" | "neutral" | "negative";
  };
  coaching: {
    current_need: string;
    suggestion: string;
    script_tip?: string;
  };
  alerts: string[];
  next_action: string;
}

interface AICopilotPanelProps {
  callSid?: string;
  leadId?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  className?: string;
}

export function AICopilotPanel({
  callSid,
  leadId,
  onCallStart,
  onCallEnd,
  className,
}: AICopilotPanelProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnCall, setIsOnCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!callSid || !isOnCall) return;

    const wsUrl = process.env.NEXT_PUBLIC_REALTIME_WS_URL || "ws://localhost:8080";
    const ws = new WebSocket(`${wsUrl}/dashboard?callSid=${callSid}`);

    ws.onopen = () => {
      console.log("Connected to AI Copilot");
      setIsConnected(true);
      ws.send(JSON.stringify({ type: "subscribe", callSid }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "call_update") {
        setAnalysis(data.analysis);
        if (data.transcript) {
          setTranscript((prev) => [...prev, ...data.transcript]);
        }
        if (data.duration !== undefined) {
          setCallDuration(data.duration);
        }
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [callSid, isOnCall]);

  // Call duration timer
  useEffect(() => {
    if (!isOnCall) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnCall]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start a call
  const handleStartCall = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Initiate Twilio call with media stream
      const response = await fetch(`/api/twilio/voice?phone=${leadId}&leadId=${leadId}`);
      const data = await response.json();

      if (data.callSid) {
        setIsOnCall(true);
        onCallStart?.();
      }
    } catch (error) {
      console.error("Failed to start call:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [leadId, onCallStart]);

  // End call
  const handleEndCall = useCallback(() => {
    setIsOnCall(false);
    setCallDuration(0);
    setTranscript([]);
    setAnalysis(null);
    onCallEnd?.();
  }, [onCallEnd]);

  // Toggle mute
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Card className={cn("p-6 bg-card/80 backdrop-blur-sm border-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-8 h-8 text-emerald-400" />
            {isConnected && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">AI Sales Copilot</h3>
            <p className="text-xs text-text-muted">
              {isOnCall ? `Live • ${formatDuration(callDuration)}` : "Ready"}
            </p>
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex items-center gap-2">
          {!isOnCall ? (
            <button
              onClick={handleStartCall}
              disabled={isConnecting}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors",
                isConnecting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isConnecting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
              Start Call
            </button>
          ) : (
            <>
              <button
                onClick={handleToggleMute}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  isMuted
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : "bg-surface border-border text-text-secondary hover:text-text-primary"
                )}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={handleEndCall}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                End
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Live Transcript */}
        <div className="bg-surface/50 rounded-lg p-4 h-32 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-text-secondary">Live Transcript</span>
          </div>
          {transcript.length > 0 ? (
            <div className="space-y-1 text-sm">
              {transcript.map((line, i) => (
                <p key={i} className="text-text-primary">
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm italic">
              {isOnCall ? "Listening..." : "Start a call to see transcript"}
            </p>
          )}
        </div>

        {/* Real-Time Analysis */}
        {analysis && (
          <div className="space-y-4">
            {/* Insights Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Talk Ratio */}
              <div className="bg-surface/50 rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Talk Ratio</p>
                <div className="flex items-center justify-center gap-1">
                  {analysis.insights.agent_talk_ratio > 60 ? (
                    <TrendingUp className="w-4 h-4 text-red-400" />
                  ) : analysis.insights.agent_talk_ratio < 40 ? (
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Minus className="w-4 h-4 text-blue-400" />
                  )}
                  <span className="font-bold text-text-primary">
                    {analysis.insights.agent_talk_ratio}%
                  </span>
                </div>
                <p className="text-[10px] text-text-muted">
                  {analysis.insights.agent_talk_ratio > 60 ? "Talking too much" : "Good balance"}
                </p>
              </div>

              {/* Questions */}
              <div className="bg-surface/50 rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Questions</p>
                <p className="font-bold text-text-primary text-xl">
                  {analysis.insights.questions_asked}
                </p>
                <p className="text-[10px] text-text-muted">asked</p>
              </div>

              {/* Sentiment */}
              <div className="bg-surface/50 rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Sentiment</p>
                <div
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    analysis.insights.sentiment === "positive" &&
                      "bg-emerald-500/20 text-emerald-400",
                    analysis.insights.sentiment === "negative" &&
                      "bg-red-500/20 text-red-400",
                    analysis.insights.sentiment === "neutral" &&
                      "bg-blue-500/20 text-blue-400"
                  )}
                >
                  {analysis.insights.sentiment === "positive" && <TrendingUp className="w-3 h-3" />}
                  {analysis.insights.sentiment === "negative" && (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {analysis.insights.sentiment}
                </div>
              </div>
            </div>

            {/* Objections & Buying Signals */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface/50 rounded-lg p-3">
                <p className="text-xs text-text-muted mb-2">Objections Handled</p>
                {analysis.insights.objections_handled.length > 0 ? (
                  <div className="space-y-1">
                    {analysis.insights.objections_handled.map((obj, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs mr-1"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic">None detected yet</p>
                )}
              </div>

              <div className="bg-surface/50 rounded-lg p-3">
                <p className="text-xs text-text-muted mb-2">Buying Signals</p>
                {analysis.insights.buying_signals.length > 0 ? (
                  <div className="space-y-1">
                    {analysis.insights.buying_signals.map((signal, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs mr-1"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic">None detected yet</p>
                )}
              </div>
            </div>

            {/* Coaching Suggestion */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg p-4 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Coaching Suggestion</span>
              </div>
              <p className="text-sm text-text-primary mb-1">
                <span className="font-medium">Focus:</span> {analysis.coaching.current_need}
              </p>
              <p className="text-sm text-text-secondary mb-2">{analysis.coaching.suggestion}</p>
              {analysis.coaching.script_tip && (
                <div className="bg-surface/50 rounded px-3 py-2">
                  <p className="text-xs text-text-muted mb-1">Try saying:</p>
                  <p className="text-sm text-text-primary italic">
                    "{analysis.coaching.script_tip}"
                  </p>
                </div>
              )}
            </div>

            {/* Next Action */}
            <div className="flex items-center gap-3 bg-surface/50 rounded-lg p-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Recommended Next Step</p>
                <p className="text-sm font-medium text-text-primary">{analysis.next_action}</p>
              </div>
            </div>

            {/* Alerts */}
            {analysis.alerts && analysis.alerts.length > 0 && (
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">Alerts</span>
                </div>
                <ul className="space-y-1">
                  {analysis.alerts.map((alert, i) => (
                    <li key={i} className="text-sm text-red-300">
                      • {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Placeholder State */}
        {!analysis && !isOnCall && (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary mb-2">Ready to assist your call</p>
            <p className="text-sm text-text-muted">
              Start a call to receive real-time AI coaching, objection handling tips, and
              buying signal detection.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
