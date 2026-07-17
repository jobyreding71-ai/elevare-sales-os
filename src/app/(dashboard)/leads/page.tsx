"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { Card, Button, Input, Badge, Avatar, Modal, Tabs } from "@/components/ui";
import { useLeads } from "@/lib/hooks";
import { cn, formatPhoneNumber, formatDate, getAIScoreColor, getAIScoreBgColor } from "@/lib/utils";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  X,
  Users,
  Sparkles,
} from "lucide-react";

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Using the useLeads hook - in production, this would fetch real data
  const { leads, isLoading, error } = useLeads();

  // Mock data for demonstration
  const mockLeads = [
    {
      id: "1",
      first_name: "Jennifer",
      last_name: "Martinez",
      phone: "(208) 555-1001",
      email: "jennifer.martinez@email.com",
      pipeline_stage: "active_policy",
      ai_score: 92,
      lead_source: "Referral",
      annual_income: 125000,
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      state: "ID",
    },
    {
      id: "2",
      first_name: "Robert",
      last_name: "Anderson",
      phone: "(208) 555-1002",
      email: "robert.anderson@email.com",
      pipeline_stage: "active_policy",
      ai_score: 88,
      lead_source: "Facebook Ads",
      annual_income: 285000,
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      state: "ID",
    },
    {
      id: "3",
      first_name: "Christopher",
      last_name: "Wilson",
      phone: "(208) 555-1006",
      email: "chris.wilson@email.com",
      pipeline_stage: "underwriting",
      ai_score: 78,
      lead_source: "Website",
      annual_income: 320000,
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      state: "ID",
    },
    {
      id: "4",
      first_name: "Michael",
      last_name: "Johnson",
      phone: "(208) 555-1008",
      email: "michael.j@email.com",
      pipeline_stage: "application_submitted",
      ai_score: 75,
      lead_source: "Google Ads",
      annual_income: 210000,
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      state: "ID",
    },
    {
      id: "5",
      first_name: "William",
      last_name: "Chen",
      phone: "(208) 555-1010",
      email: "william.chen@email.com",
      pipeline_stage: "quoted",
      ai_score: 68,
      lead_source: "Referral",
      annual_income: 450000,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      state: "ID",
    },
    {
      id: "6",
      first_name: "Sarah",
      last_name: "Brown",
      phone: "(208) 555-1013",
      email: "sarah.brown@email.com",
      pipeline_stage: "needs_analysis",
      ai_score: 58,
      lead_source: "Website",
      annual_income: 175000,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      state: "ID",
    },
    {
      id: "7",
      first_name: "Thomas",
      last_name: "White",
      phone: "(208) 555-1016",
      email: "thomas.white@email.com",
      pipeline_stage: "appointment_scheduled",
      ai_score: 52,
      lead_source: "Lead Gen Partner",
      annual_income: 140000,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      state: "ID",
    },
    {
      id: "8",
      first_name: "Andrew",
      last_name: "Wright",
      phone: "(208) 555-1024",
      email: "andrew.wright@email.com",
      pipeline_stage: "new_lead",
      ai_score: 20,
      lead_source: "Website",
      annual_income: 120000,
      created_at: new Date().toISOString(),
      state: "ID",
    },
  ];

  const filteredLeads = mockLeads.filter((lead) => {
    const matchesSearch =
      searchQuery === "" ||
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "hot" && lead.ai_score >= 70) ||
      (activeTab === "warm" && lead.ai_score >= 40 && lead.ai_score < 70) ||
      (activeTab === "cold" && lead.ai_score < 40);

    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: "all", label: "All Leads", count: mockLeads.length },
    { id: "hot", label: "Hot (70+)", count: mockLeads.filter((l) => l.ai_score >= 70).length },
    { id: "warm", label: "Warm (40-69)", count: mockLeads.filter((l) => l.ai_score >= 40 && l.ai_score < 70).length },
    { id: "cold", label: "Cold (<40)", count: mockLeads.filter((l) => l.ai_score < 40).length },
  ];

  const getStageName = (stage: string) => {
    return stage
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      new_lead: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      contact_attempted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      contacted: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      appointment_scheduled: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      needs_analysis: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      quoted: "bg-teal-500/20 text-teal-400 border-teal-500/30",
      application_sent: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      application_submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      underwriting: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      issued: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      active_policy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      referral_requested: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
    return colors[stage] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Leads</h1>
            <p className="text-text-secondary mt-1">
              Manage and track all your leads in one place
            </p>
          </div>
          <Button onClick={() => setIsAddLeadOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <Button variant="secondary" onClick={() => setIsFilterOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Leads Table */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Source
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Income
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Added
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-surface/50 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/leads/${lead.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${lead.first_name} ${lead.last_name}`}
                          size="md"
                        />
                        <div>
                          <p className="font-medium text-text-primary">
                            {lead.first_name} {lead.last_name}
                          </p>
                          <p className="text-sm text-text-muted flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {formatPhoneNumber(lead.phone)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                            getAIScoreBgColor(lead.ai_score),
                            getAIScoreColor(lead.ai_score)
                          )}
                        >
                          {lead.ai_score}
                        </div>
                        {lead.ai_score >= 70 && (
                          <Sparkles className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStageColor(lead.pipeline_stage)}>
                        {getStageName(lead.pipeline_stage)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">{lead.lead_source}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-primary font-medium">
                        ${lead.annual_income.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-muted">
                        {formatDate(lead.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-text-muted hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle call
                          }}
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-text-muted hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle email
                          }}
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-text-muted hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle more
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No leads found</h3>
              <p className="text-text-secondary mb-6">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first lead"}
              </p>
              <Button onClick={() => setIsAddLeadOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        title="Add New Lead"
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" placeholder="John" />
            <Input label="Last Name" placeholder="Smith" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" type="tel" placeholder="(208) 555-0100" />
            <Input label="Email" type="email" placeholder="john@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" placeholder="Boise" />
            <Input label="State" placeholder="ID" />
          </div>
          <Input label="Lead Source" placeholder="Referral, Facebook Ads, etc." />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setIsAddLeadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Lead</Button>
          </div>
        </form>
      </Modal>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Leads"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Pipeline Stage
            </label>
            <div className="space-y-2">
              {["New Lead", "Contacted", "Appointment Scheduled", "Needs Analysis", "Quoted", "Application Submitted", "Active Policy"].map((stage) => (
                <label key={stage} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface cursor-pointer">
                  <input type="checkbox" className="rounded border-border bg-surface text-emerald-500" />
                  <span className="text-text-primary">{stage}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setIsFilterOpen(false)}>
              Clear All
            </Button>
            <Button onClick={() => setIsFilterOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
