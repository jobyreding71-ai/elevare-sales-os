"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { Card, Button, Input, Badge, Avatar, Modal, Tabs, Skeleton } from "@/components/ui";
import { useLeads, createLead } from "@/lib/hooks";
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
  Loader2,
} from "lucide-react";

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new lead
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    lead_source: "",
  });

  // Using the useLeads hook for real data
  const { leads, isLoading, error, refetch } = useLeads();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      alert("First name and last name are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createLead({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        lead_source: formData.lead_source.trim() || undefined,
      });

      // Reset form and close modal
      setFormData({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        city: "",
        state: "",
        lead_source: "",
      });
      setIsAddLeadOpen(false);

      // Refresh the leads list
      await refetch();
    } catch (err) {
      console.error("Error creating lead:", err);
      alert("Failed to create lead. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      city: "",
      state: "",
      lead_source: "",
    });
  };

  // Filter leads based on search and tab
  const filteredLeads = (leads || []).filter((lead: any) => {
    const matchesSearch =
      searchQuery === "" ||
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchQuery));

    const aiScore = lead.ai_score || 0;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "hot" && aiScore >= 70) ||
      (activeTab === "warm" && aiScore >= 40 && aiScore < 70) ||
      (activeTab === "cold" && aiScore < 40);

    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: "all", label: "All Leads", count: leads?.length || 0 },
    { id: "hot", label: "Hot (70+)", count: leads?.filter((l: any) => (l.ai_score || 0) >= 70).length || 0 },
    { id: "warm", label: "Warm (40-69)", count: leads?.filter((l: any) => (l.ai_score || 0) >= 40 && (l.ai_score || 0) < 70).length || 0 },
    { id: "cold", label: "Cold (<40)", count: leads?.filter((l: any) => (l.ai_score || 0) < 40).length || 0 },
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
          <Button onClick={() => {
            resetForm();
            setIsAddLeadOpen(true);
          }}>
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
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-10 rounded-lg" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-24" /></td>
                    </tr>
                  ))
                ) : filteredLeads.length > 0 ? (
                  filteredLeads.map((lead: any) => (
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
                              {lead.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {formatPhoneNumber(lead.phone)}
                                </span>
                              )}
                              {lead.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {lead.email}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                              getAIScoreBgColor(lead.ai_score || 0),
                              getAIScoreColor(lead.ai_score || 0)
                            )}
                          >
                            {lead.ai_score || 0}
                          </div>
                          {(lead.ai_score || 0) >= 70 && (
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStageColor(lead.pipeline_stage || "new_lead")}>
                          {getStageName(lead.pipeline_stage || "new_lead")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary">{lead.lead_source || "Unknown"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-primary font-medium">
                          {lead.annual_income ? `$${lead.annual_income.toLocaleString()}` : "-"}
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
                  ))
                ) : null}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredLeads.length === 0 && (
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No leads found</h3>
              <p className="text-text-secondary mb-6">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first lead"}
              </p>
              <Button onClick={() => {
                resetForm();
                setIsAddLeadOpen(true);
              }}>
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
        onClose={() => {
          setIsAddLeadOpen(false);
          resetForm();
        }}
        title="Add New Lead"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="John"
                required
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Smith"
                required
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(208) 555-0100"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Boise"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="ID"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Lead Source
            </label>
            <input
              type="text"
              name="lead_source"
              value={formData.lead_source}
              onChange={handleInputChange}
              placeholder="Referral, Facebook Ads, etc."
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddLeadOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead
                </>
              )}
            </Button>
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
