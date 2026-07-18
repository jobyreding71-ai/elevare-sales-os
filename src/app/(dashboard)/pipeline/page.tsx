"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { Card, Badge, Avatar, Button, Skeleton } from "@/components/ui";
import { useLeads } from "@/lib/hooks";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn, formatPhoneNumber, getAIScoreColor, getAIScoreBgColor } from "@/lib/utils";
import {
  Phone,
  Mail,
  Calendar,
  Plus,
  Filter,
  Users,
} from "lucide-react";

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  pipeline_stage: string;
  ai_score: number;
  lead_source: string;
  annual_income: number;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  leads: Lead[];
}

const PIPELINE_STAGES = [
  { id: "new_lead", name: "New Lead", color: "#3B82F6" },
  { id: "contact_attempted", name: "Contacted", color: "#8B5CF6" },
  { id: "contacted", name: "Contacted", color: "#EC4899" },
  { id: "appointment_scheduled", name: "Appointment", color: "#F59E0B" },
  { id: "needs_analysis", name: "Needs Analysis", color: "#10B981" },
  { id: "quoted", name: "Quoted", color: "#14B8A6" },
  { id: "application_sent", name: "App Sent", color: "#06B6D4" },
  { id: "application_submitted", name: "App Submitted", color: "#2563EB" },
  { id: "underwriting", name: "Underwriting", color: "#7C3AED" },
  { id: "issued", name: "Issued", color: "#D4AF37" },
  { id: "active_policy", name: "Active Policy", color: "#10B981" },
  { id: "referral_requested", name: "Referral", color: "#F97316" },
];

function LeadCard({ lead, isDragging }: { lead: Lead; isDragging?: boolean }) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg bg-card border border-border kanban-card group",
        isDragging && "dragging opacity-80 shadow-2xl border-emerald-500/50"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar name={`${lead.first_name} ${lead.last_name}`} size="sm" />
          <div>
            <p className="text-sm font-medium text-text-primary">
              {lead.first_name} {lead.last_name}
            </p>
            <p className="text-xs text-text-muted">{formatPhoneNumber(lead.phone)}</p>
          </div>
        </div>
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
            getAIScoreBgColor(lead.ai_score),
            getAIScoreColor(lead.ai_score)
          )}
        >
          {lead.ai_score}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-text-muted hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors">
            <Phone className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 text-text-muted hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors">
            <Mail className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 text-text-muted hover:text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors">
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-xs text-text-muted">${(lead.annual_income / 1000).toFixed(0)}K</span>
      </div>
    </div>
  );
}

function SortableLeadCard({ lead }: { lead: Lead }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="mb-2">
        <LeadCard lead={lead} isDragging={isDragging} />
      </div>
    </div>
  );
}

function PipelineColumn({ stage, leads }: { stage: typeof PIPELINE_STAGES[0]; leads: Lead[] }) {
  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="text-sm font-semibold text-text-primary">{stage.name}</h3>
          <Badge variant="default" size="sm">
            {leads.length}
          </Badge>
        </div>
        <button className="p-1 text-text-muted hover:text-text-primary rounded transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="kanban-column bg-surface/50 rounded-xl p-2 space-y-0 min-h-[200px]">
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <SortableLeadCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-24 text-text-muted text-sm">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const { leads, isLoading } = useLeads();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    // In a real app, this would update the lead's stage via API
    // For now, we just handle the drag UI without persisting changes

    setActiveId(null);
  };

  const getLeadsByStage = (stageId: string) => {
    return (leads || []).filter((lead) => lead.pipeline_stage === stageId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Pipeline</h1>
            <p className="text-text-secondary mt-1">
              Drag and drop leads between stages to update their status
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Link href="/leads">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </Link>
          </div>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-text-secondary">Total Leads</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {isLoading ? <Skeleton className="h-8 w-16" /> : leads.length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-text-secondary">Hot Leads</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {isLoading ? <Skeleton className="h-8 w-16" /> : leads.filter((l) => (l.ai_score || 0) >= 70).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-text-secondary">In Progress</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {isLoading ? <Skeleton className="h-8 w-16" /> : leads.filter((l) => !["active_policy"].includes(l.pipeline_stage)).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-text-secondary">Closed Won</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {isLoading ? <Skeleton className="h-8 w-16" /> : leads.filter((l) => l.pipeline_stage === "active_policy").length}
            </p>
          </Card>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-72">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                  <h3 className="text-sm font-semibold text-text-primary">{stage.name}</h3>
                </div>
                <div className="kanban-column bg-surface/50 rounded-xl p-2 min-h-[200px]">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="mb-2 p-3 rounded-lg bg-card border border-border animate-pulse">
                      <div className="flex items-start gap-2">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : leads && leads.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6">
              {PIPELINE_STAGES.map((stage) => (
                <PipelineColumn
                  key={stage.id}
                  stage={stage}
                  leads={getLeadsByStage(stage.id)}
                />
              ))}
            </div>

            <DragOverlay>
              {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No leads yet</h3>
            <p className="text-text-secondary mb-6">
              Start by adding your first lead to see them here
            </p>
            <Link href="/leads">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
