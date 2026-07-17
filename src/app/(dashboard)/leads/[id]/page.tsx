"use client";

import { useState, use } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { Card, Button, Badge, Avatar, Modal, Input, Tabs, Skeleton } from "@/components/ui";
import { useLead, useTasks } from "@/lib/hooks";
import {
  cn,
  formatPhoneNumber,
  formatDate,
  formatDateTime,
  getAIScoreColor,
  getAIScoreBgColor,
} from "@/lib/utils";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  MessageSquare,
  FileText,
  User,
  Users,
  Briefcase,
  Sparkles,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target,
} from "lucide-react";

// Mock data for fallback
const mockLead = {
  id: "1",
  first_name: "Jennifer",
  last_name: "Martinez",
  phone: "(208) 555-1001",
  email: "jennifer.martinez@email.com",
  date_of_birth: "1985-03-15",
  age: 39,
  marital_status: "Married",
  children_count: 2,
  occupation: "Business Owner",
  annual_income: 125000,
  state: "ID",
  city: "Boise",
  lead_source: "Referral",
  pipeline_stage: "active_policy",
  ai_score: 92,
  created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
};

const mockTasks = [
  { id: "1", title: "Send anniversary gift", due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), completed: false, priority: "low" },
  { id: "2", title: "Schedule annual review", due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), completed: false, priority: "medium" },
];

const aiInsights = {
  buyingProbability: 92,
  topObjections: ["Premium cost concern", "Policy complexity"],
  recommendedQuestion: "What specific financial goals are you hoping to achieve with life insurance?",
  bestContactTime: "Tuesday or Thursday afternoons",
  similarCases: 12,
};

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);

  const { lead, isLoading } = useLead(resolvedParams.id);
  const { tasks } = useTasks({ leadId: resolvedParams.id });

  // Use real lead data or fallback to mock
  const leadData = lead || mockLead;
  const tasksData = tasks && tasks.length > 0 ? tasks : mockTasks;

  // Mock calls for demonstration
  const mockCalls = [
    {
      id: "1",
      duration: "30:45",
      date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
      summary: "Initial discovery call completed. Jennifer expressed strong interest in whole life coverage. Key concerns include college fund for children and mortgage protection.",
      sentiment: "positive" as const,
    },
    {
      id: "2",
      duration: "45:20",
      date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      summary: "Follow-up call to discuss specific coverage amounts. Jennifer is very engaged and has done research on different policy types.",
      sentiment: "positive" as const,
    },
  ];

  const mockActivities = [
    { id: "1", type: "call" as const, content: "Initial discovery call completed - 30 minutes", date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "2", type: "appointment" as const, content: "Needs analysis meeting at Starbucks", date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "3", type: "email" as const, content: "Sent IUL product information brochure", date: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "4", type: "stage_change" as const, content: "Pipeline stage updated: Needs Analysis → Quoted", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "5", type: "note" as const, content: "Application submitted for $500K Whole Life", date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  const mockPolicies = [
    {
      id: "1",
      carrier: "Northwestern Mutual",
      product: "Whole Life",
      faceAmount: 500000,
      annualPremium: 8400,
      status: "Active",
      issueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      new_lead: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      active_policy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      underwriting: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    };
    return colors[stage] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="w-4 h-4 text-blue-400" />;
      case "sms":
        return <MessageSquare className="w-4 h-4 text-green-400" />;
      case "email":
        return <Mail className="w-4 h-4 text-yellow-400" />;
      case "note":
        return <FileText className="w-4 h-4 text-gray-400" />;
      case "appointment":
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case "stage_change":
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case "application":
        return <FileText className="w-4 h-4 text-emerald-400" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "neutral":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case "negative":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "calls", label: "Calls", count: mockCalls.length },
    { id: "activities", label: "Activities", count: mockActivities.length },
    { id: "policies", label: "Policies", count: mockPolicies.length },
  ];

  // Calculate age from date of birth if available
  const calculateAge = (dob: string | null | undefined) => {
    if (!dob) return 39; // Default fallback
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/leads"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            {isLoading ? (
              <Skeleton className="w-16 h-16 rounded-full" />
            ) : (
              <Avatar name={`${leadData.first_name} ${leadData.last_name}`} size="lg" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {isLoading ? <Skeleton className="h-8 w-48" /> : `${leadData.first_name} ${leadData.last_name}`}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Badge className={getStageColor(leadData.pipeline_stage || "new_lead")}>
                  {(leadData.pipeline_stage || "new_lead")
                    .split("_")
                    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </Badge>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold",
                      getAIScoreBgColor(leadData.ai_score || 0),
                      getAIScoreColor(leadData.ai_score || 0)
                    )}
                  >
                    <Sparkles className="w-5 h-5 mr-1" />
                    {isLoading ? <Skeleton className="w-8 h-8" /> : (leadData.ai_score || 0)}
                  </div>
                  <span className="text-sm text-text-secondary">AI Score</span>
                </div>
                {(leadData.ai_score || 0) >= 70 && (
                  <Badge variant="gold">
                    <Star className="w-3 h-3 mr-1" />
                    Premium Lead
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setIsLogCallOpen(true)}>
              <Phone className="w-4 h-4 mr-2" />
              Log Call
            </Button>
            <Button variant="secondary">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button variant="secondary">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send SMS
            </Button>
            <Button onClick={() => setIsEditOpen(true)}>
              <User className="w-4 h-4 mr-2" />
              Edit Lead
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "overview" && (
              <>
                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button className="p-4 rounded-xl bg-card border border-border hover:border-emerald-500/50 transition-all text-center group">
                    <Phone className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-text-primary group-hover:text-emerald-400">
                      Call
                    </p>
                  </button>
                  <button className="p-4 rounded-xl bg-card border border-border hover:border-blue-500/50 transition-all text-center group">
                    <Mail className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-text-primary group-hover:text-blue-400">
                      Email
                    </p>
                  </button>
                  <button className="p-4 rounded-xl bg-card border border-border hover:border-yellow-500/50 transition-all text-center group">
                    <Calendar className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-text-primary group-hover:text-yellow-400">
                      Meeting
                    </p>
                  </button>
                  <button className="p-4 rounded-xl bg-card border border-border hover:border-purple-500/50 transition-all text-center group">
                    <FileText className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-text-primary group-hover:text-purple-400">
                      Quote
                    </p>
                  </button>
                </div>

                {/* Recent Calls */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">Recent Calls</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("calls")}>
                      View all
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {mockCalls.map((call) => (
                      <div
                        key={call.id}
                        className="p-4 rounded-lg bg-surface border border-border hover:border-border-light transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-card">
                              <Phone className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">Discovery Call</p>
                              <p className="text-sm text-text-muted">
                                {formatDateTime(call.date)} • {call.duration}
                              </p>
                            </div>
                          </div>
                          {getSentimentIcon(call.sentiment)}
                        </div>
                        <p className="text-sm text-text-secondary mt-2">{call.summary}</p>
                        <div className="flex gap-2 mt-3">
                          <Button variant="ghost" size="sm">
                            View Transcript
                          </Button>
                          <Button variant="ghost" size="sm">
                            View AI Analysis
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Tasks */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">Tasks</h3>
                    <Button variant="ghost" size="sm">
                      Add Task
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {tasksData.map((task: any) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface"
                      >
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          className="w-5 h-5 rounded border-border bg-surface text-emerald-500 focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <p
                            className={cn(
                              "text-sm",
                              task.completed
                                ? "text-text-muted line-through"
                                : "text-text-primary"
                            )}
                          >
                            {task.title}
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            Due: {task.due_date ? formatDate(task.due_date) : "No due date"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "error"
                              : task.priority === "medium"
                              ? "warning"
                              : "default"
                          }
                          size="sm"
                        >
                          {task.priority || "medium"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {activeTab === "calls" && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Call History</h3>
                  <Button onClick={() => setIsLogCallOpen(true)}>
                    <Phone className="w-4 h-4 mr-2" />
                    Log Call
                  </Button>
                </div>
                <div className="space-y-4">
                  {mockCalls.map((call) => (
                    <div
                      key={call.id}
                      className="p-4 rounded-lg bg-surface border border-border"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/20">
                            <Phone className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary">Discovery Call</p>
                            <p className="text-sm text-text-muted">
                              {formatDateTime(call.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-text-primary">
                            {call.duration}
                          </p>
                          <p className="text-xs text-text-muted">Duration</p>
                        </div>
                      </div>
                      <p className="text-text-secondary mb-4">{call.summary}</p>
                      <div className="flex gap-3">
                        <Button variant="secondary" size="sm">
                          View Transcript
                        </Button>
                        <Button variant="secondary" size="sm">
                          View Coaching Report
                        </Button>
                        <Button variant="secondary" size="sm">
                          Play Recording
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "activities" && (
              <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Activity Timeline
                </h3>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-6">
                    {mockActivities.map((activity, index) => (
                      <div key={activity.id} className="relative flex gap-4">
                        <div className="relative z-10 p-2 rounded-full bg-surface border border-border">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="text-sm text-text-primary">{activity.content}</p>
                          <p className="text-xs text-text-muted mt-1">
                            {formatDateTime(activity.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "policies" && (
              <div className="space-y-4">
                {mockPolicies.map((policy) => (
                  <Card key={policy.id} className="border-emerald-500/30">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">
                          {policy.carrier}
                        </h3>
                        <p className="text-text-secondary">{policy.product}</p>
                      </div>
                      <Badge variant="success">{policy.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-text-muted">Face Amount</p>
                        <p className="text-lg font-semibold text-text-primary">
                          ${policy.faceAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Annual Premium</p>
                        <p className="text-lg font-semibold text-text-primary">
                          ${policy.annualPremium.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Issue Date</p>
                        <p className="text-lg font-semibold text-text-primary">
                          {formatDate(policy.issueDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Commission</p>
                        <p className="text-lg font-semibold text-emerald-400">$4,620</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Phone</p>
                    <a
                      href={`tel:${leadData.phone || ""}`}
                      className="text-text-primary hover:text-emerald-400"
                    >
                      {leadData.phone ? formatPhoneNumber(leadData.phone) : "-"}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Email</p>
                    <a
                      href={`mailto:${leadData.email || ""}`}
                      className="text-text-primary hover:text-emerald-400"
                    >
                      {leadData.email || "-"}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Location</p>
                    <p className="text-text-primary">
                      {leadData.city || "N/A"}, {leadData.state || ""}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Family & Financial */}
            <Card>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Family & Financial
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-secondary">Marital Status</span>
                  </div>
                  <span className="text-sm text-text-primary">{leadData.marital_status || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-secondary">Children</span>
                  </div>
                  <span className="text-sm text-text-primary">{leadData.children_count ?? "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-secondary">Annual Income</span>
                  </div>
                  <span className="text-sm text-text-primary">
                    {leadData.annual_income ? `$${leadData.annual_income.toLocaleString()}` : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-secondary">Occupation</span>
                  </div>
                  <span className="text-sm text-text-primary">{leadData.occupation || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-secondary">Age</span>
                  </div>
                  <span className="text-sm text-text-primary">{calculateAge(leadData.date_of_birth)} years old</span>
                </div>
              </div>
            </Card>

            {/* AI Insights */}
            <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-text-primary">AI Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-emerald-500/10">
                  <p className="text-4xl font-bold text-emerald-400">
                    {aiInsights.buyingProbability}%
                  </p>
                  <p className="text-sm text-text-muted mt-1">Buying Probability</p>
                </div>

                <div>
                  <p className="text-xs text-text-muted mb-2">Top Objections</p>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.topObjections.map((obj, i) => (
                      <Badge key={i} variant="warning" size="sm">
                        {obj}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-text-muted mb-2">Recommended Next Question</p>
                  <p className="text-sm text-text-primary italic">
                    "{aiInsights.recommendedQuestion}"
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-muted mb-2">Best Contact Time</p>
                  <p className="text-sm text-text-primary flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    {aiInsights.bestContactTime}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-muted mb-2">Similar Successful Cases</p>
                  <p className="text-sm text-text-primary flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    {aiInsights.similarCases} cases found
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Lead"
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" defaultValue={leadData.first_name} />
            <Input label="Last Name" defaultValue={leadData.last_name} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" defaultValue={leadData.phone || ""} />
            <Input label="Email" type="email" defaultValue={leadData.email || ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" defaultValue={leadData.city || ""} />
            <Input label="State" defaultValue={leadData.state || ""} />
          </div>
          <Input label="Occupation" defaultValue={leadData.occupation || ""} />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Log Call Modal */}
      <Modal
        isOpen={isLogCallOpen}
        onClose={() => setIsLogCallOpen(false)}
        title="Log Call"
        size="lg"
      >
        <form className="space-y-4">
          <Input label="Duration (minutes)" type="number" placeholder="30" />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Summary
            </label>
            <textarea
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={4}
              placeholder="What was discussed during the call..."
            />
          </div>
          <Input label="Recording URL (optional)" placeholder="https://..." />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setIsLogCallOpen(false)}>
              Cancel
            </Button>
            <Button>Log Call</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
