"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { AICopilotPanel } from "@/components/ai-copilot-panel";
import {
  ArrowLeft,
  Phone,
  PhoneCall,
  Clock,
  User,
  Calendar,
  MessageSquare,
  FileText,
  ChevronRight,
} from "lucide-react";

interface CallsPageProps {
  params: Promise<{ id?: string }>;
}

// Demo call history
const demoCalls = [
  {
    id: "call_1",
    leadId: "lead_1",
    leadName: "Michael Rodriguez",
    phone: "+1 (208) 555-0123",
    duration: 342,
    date: "2026-07-17T14:30:00Z",
    sentiment: "positive" as const,
    summary: "Excellent conversation. Client interested in $500k term policy. Follow-up scheduled.",
    aiScore: 85,
  },
  {
    id: "call_2",
    leadId: "lead_2",
    leadName: "Sarah Chen",
    phone: "+1 (208) 555-0456",
    duration: 189,
    date: "2026-07-17T10:15:00Z",
    sentiment: "neutral" as const,
    summary: "Initial contact made. Client needs to review current coverage before proceeding.",
    aiScore: 62,
  },
  {
    id: "call_3",
    leadId: "lead_3",
    leadName: "James Wilson",
    phone: "+1 (208) 555-0789",
    duration: 456,
    date: "2026-07-16T16:45:00Z",
    sentiment: "positive" as const,
    summary: "Application submitted! Great rapport built. Client excited about mortgage protection.",
    aiScore: 92,
  },
  {
    id: "call_4",
    leadId: "lead_4",
    leadName: "Emily Thompson",
    phone: "+1 (208) 555-0234",
    duration: 120,
    date: "2026-07-16T11:00:00Z",
    sentiment: "negative" as const,
    summary: "Client not interested at this time. Budget constraints mentioned.",
    aiScore: 35,
  },
];

export default function CallsPage({ params }: CallsPageProps) {
  const resolvedParams = use(params);
  const [activeCallSid, setActiveCallSid] = useState<string | undefined>(
    resolvedParams.id
  );
  const [selectedLeadId, setSelectedLeadId] = useState<string>("lead_1");

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-text-secondary" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-text-primary">AI Sales Copilot</h1>
                <p className="text-sm text-text-muted">
                  Real-time call assistance powered by AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Copilot Panel */}
          <div className="lg:col-span-2">
            <AICopilotPanel
              callSid={activeCallSid}
              leadId={selectedLeadId}
              onCallStart={() => setActiveCallSid(`call_${Date.now()}`)}
              onCallEnd={() => setActiveCallSid(undefined)}
            />

            {/* Quick Actions */}
            <Card className="p-6 mt-6">
              <h3 className="font-semibold text-text-primary mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="flex flex-col items-center gap-2 p-4 bg-surface/50 rounded-lg hover:bg-surface transition-colors">
                  <PhoneCall className="w-6 h-6 text-emerald-400" />
                  <span className="text-sm text-text-secondary">Call Lead</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-surface/50 rounded-lg hover:bg-surface transition-colors">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  <span className="text-sm text-text-secondary">Send SMS</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-surface/50 rounded-lg hover:bg-surface transition-colors">
                  <Calendar className="w-6 h-6 text-amber-400" />
                  <span className="text-sm text-text-secondary">Schedule</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-surface/50 rounded-lg hover:bg-surface transition-colors">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <span className="text-sm text-text-secondary">Add Note</span>
                </button>
              </div>
            </Card>

            {/* How It Works */}
            <Card className="p-6 mt-6">
              <h3 className="font-semibold text-text-primary mb-4">How Real-Time AI Works</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary mb-1">
                      Start a Call
                    </h4>
                    <p className="text-sm text-text-muted">
                      Click "Start Call" to connect with your lead through Twilio. Audio
                      streams directly to our AI server in real-time.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary mb-1">
                      AI Listens & Analyzes
                    </h4>
                    <p className="text-sm text-text-muted">
                      Our AI transcribes and analyzes the conversation in real-time,
                      detecting objections, buying signals, and sentiment.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary mb-1">
                      Get Coaching
                    </h4>
                    <p className="text-sm text-text-muted">
                      Receive real-time suggestions on what to say next, how to handle
                      objections, and when to close.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Call History Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">Recent Calls</h3>
                <Link
                  href="/calls/history"
                  className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {demoCalls.map((call) => (
                  <Link
                    key={call.id}
                    href={`/calls?id=${call.id}`}
                    className={`block p-3 rounded-lg transition-colors ${
                      activeCallSid === call.id
                        ? "bg-emerald-500/20 border border-emerald-500/50"
                        : "bg-surface/50 hover:bg-surface"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-text-muted" />
                        <span className="font-medium text-text-primary text-sm">
                          {call.leadName}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          call.sentiment === "positive"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : call.sentiment === "negative"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {call.sentiment}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mb-2 line-clamp-2">
                      {call.summary}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(call.duration)}
                      </span>
                      <span>{formatDate(call.date)}</span>
                      <span className="ml-auto text-emerald-400">
                        Score: {call.aiScore}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
