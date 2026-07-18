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
  PhoneIncoming,
} from "lucide-react";

interface CallsPageProps {
  params: Promise<{ id?: string }>;
}

export default function CallsPage({ params }: CallsPageProps) {
  const resolvedParams = use(params);
  const [activeCallSid, setActiveCallSid] = useState<string | undefined>(
    resolvedParams.id
  );
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

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
                <Link href="/leads" className="flex flex-col items-center gap-2 p-4 bg-surface/50 rounded-lg hover:bg-surface transition-colors">
                  <PhoneCall className="w-6 h-6 text-emerald-400" />
                  <span className="text-sm text-text-secondary">Call Lead</span>
                </Link>
                <Link href="/leads" className="flex flex-col items-center gap-2 p-4 bg-surface/50 rounded-lg hover:bg-surface transition-colors">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  <span className="text-sm text-text-secondary">Send SMS</span>
                </Link>
                <Link href="/appointments" className="flex flex-col items-center gap-2 p-4 bg-surface/50 rounded-lg hover:bg-surface transition-colors">
                  <Calendar className="w-6 h-6 text-amber-400" />
                  <span className="text-sm text-text-secondary">Schedule</span>
                </Link>
                <Link href="/leads" className="flex flex-col items-center gap-2 p-4 bg-surface/50 rounded-lg hover:bg-surface transition-colors">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <span className="text-sm text-text-secondary">Add Note</span>
                </Link>
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
              </div>

              <div className="py-8 text-center text-text-muted">
                <PhoneIncoming className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No call history yet</p>
                <p className="text-xs mt-1">Start a call to see your history here</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
