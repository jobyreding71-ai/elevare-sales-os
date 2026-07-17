"use client";

import { useState, useCallback } from "react";
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
  GripVertical,
  Plus,
  MoreVertical,
  Filter,
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

// Mock data for fallback when no real data
const mockLeads: Lead[] = [
  { id: "1", first_name: "Andrew", last_name: "Wright", phone: "(208) 555-1024", email: "andrew.wright@email.com", pipeline_stage: "new_lead", ai_score: 20, lead_source: "Website", annual_income: 120000 },
  { id: "2", first_name: "Katherine", last_name: "Scott", phone: "(208) 555-1025", email: "katherine.s@email.com", pipeline_stage: "new_lead", ai_score: 18, lead_source: "Google Ads", annual_income: 105000 },
  { id: "3", first_name: "Mark", last_name: "Young", phone: "(208) 555-1022", email: "mark.young@email.com", pipeline_stage: "contact_attempted", ai_score: 25, lead_source: "Lead Gen Partner", annual_income: 85000 },
  { id: "4", first_name: "Melissa", last_name: "King", phone: "(208) 555-1023", email: "melissa.king@email.com", pipeline_stage: "contact_attempted", ai_score: 30, lead_source: "Referral", annual_income: 155000 },
  { id: "5", first_name: "Stephanie", last_name: "Lewis", phone: "(208) 555-1019", email: "stephanie.l@email.com", pipeline_stage: "contacted", ai_score: 42, lead_source: "Facebook Ads", annual_income: 88000 },
  { id: "6", first_name: "Jason", last_name: "Walker", phone: "(208) 555-1020", email: "jason.walker@email.com", pipeline_stage: "contacted", ai_score: 38, lead_source: "Door to Door", annual_income: 95000 },
  { id: "7", first_name: "Lauren", last_name: "Hall", phone: "(208) 555-1021", email: "lauren.hall@email.com", pipeline_stage: "contacted", ai_score: 35, lead_source: "Social Media", annual_income: 62000 },
  { id: "8", first_name: "Thomas", last_name: "White", phone: "(208) 555-1016", email: "thomas.white@email.com", pipeline_stage: "appointment_scheduled", ai_score: 52, lead_source: "Lead Gen Partner", annual_income: 140000 },
  { id: "9", first_name: "Nicole", last_name: "Harris", phone: "(208) 555-1017", email: "nicole.harris@email.com", pipeline_stage: "appointment_scheduled", ai_score: 48, lead_source: "Referral", annual_income: 105000 },
  { id: "10", first_name: "Brian", last_name: "Clark", phone: "(208) 555-1018", email: "brian.clark@email.com", pipeline_stage: "appointment_scheduled", ai_score: 60, lead_source: "Center of Influence", annual_income: 225000 },
  { id: "11", first_name: "Sarah", last_name: "Brown", phone: "(208) 555-1013", email: "sarah.brown@email.com", pipeline_stage: "needs_analysis", ai_score: 58, lead_source: "Website", annual_income: 175000 },
  { id: "12", first_name: "Kevin", last_name: "Lee", phone: "(208) 555-1014", email: "kevin.lee@email.com", pipeline_stage: "needs_analysis", ai_score: 62, lead_source: "Google Ads", annual_income: 180000 },
  { id: "13", first_name: "Rachel", last_name: "Adams", phone: "(208) 555-1015", email: "rachel.adams@email.com", pipeline_stage: "needs_analysis", ai_score: 55, lead_source: "Door to Door", annual_income: 95000 },
  { id: "14", first_name: "William", last_name: "Chen", phone: "(208) 555-1010", email: "william.chen@email.com", pipeline_stage: "quoted", ai_score: 68, lead_source: "Referral", annual_income: 450000 },
  { id: "15", first_name: "Elizabeth", last_name: "Taylor", phone: "(208) 555-1011", email: "elizabeth.t@email.com", pipeline_stage: "quoted", ai_score: 72, lead_source: "Social Media", annual_income: 110000 },
  { id: "16", first_name: "Daniel", last_name: "Patel", phone: "(208) 555-1012", email: "daniel.patel@email.com", pipeline_stage: "quoted", ai_score: 65, lead_source: "Facebook Ads", annual_income: 165000 },
  { id: "17", first_name: "Michael", last_name: "Johnson", phone: "(208) 555-1008", email: "michael.j@email.com", pipeline_stage: "application_submitted", ai_score: 75, lead_source: "Google Ads", annual_income: 210000 },
  { id: "18", first_name: "Patricia", last_name: "Garcia", phone: "(208) 555-1009", email: "patricia.g@email.com", pipeline_stage: "application_submitted", ai_score: 70, lead_source: "Lead Gen Partner", annual_income: 135000 },
  { id: "19", first_name: "Christopher", last_name: "Wilson", phone: "(208) 555-1006", email: "chris.wilson@email.com", pipeline_stage: "underwriting", ai_score: 78, lead_source: "Website", annual_income: 320000 },
  { id: "20", first_name: "Lisa", last_name: "Nguyen", phone: "(208) 555-1007", email: "lisa.nguyen@email.com", pipeline_stage: "underwriting", ai_score: 82, lead_source: "Facebook Ads", annual_income: 155000 },
  { id: "21", first_name: "Jennifer", last_name: "Martinez", phone: "(208) 555-1001", email: "jennifer.martinez@email.com", pipeline_stage: "active_policy", ai_score: 92, lead_source: "Referral", annual_income: 125000 },
  { id: "22", first_name: "Robert", last_name: "Anderson", phone: "(208) 555-1002", email: "robert.anderson@email.com", pipeline_stage: "active_policy", ai_score: 88, lead_source: "Facebook Ads", annual_income: 285000 },
  { id: "23", first_name: "Amanda", last_name: "Brooks", phone: "(208) 555-1005", email: "amanda.brooks@email.com", pipeline_stage: "active_policy", ai_score: 94, lead_source: "Referral", annual_income: 265000 },
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
  const { leads: realLeads, isLoading } = useLeads();
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Use real leads when available, fallback to mock
  const leads = (realLeads && realLeads.length > 0 ? realLeads : localLeads.length > 0 ? localLeads : mockLeads) as Lead[];

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

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    // Check if dropping on a column (stage)
    const targetStage = PIPELINE_STAGES.find((s) => s.id === overId);
    if (targetStage) {
      // If we have real data, this would update via API
      // For now, update local state
      setLocalLeads((prevLeads) => {
        const newLeads = prevLeads.length > 0 ? prevLeads : mockLeads;
        return newLeads.map((lead) =>
          lead.id === activeLeadId ? { ...lead, pipeline_stage: targetStage.id } : lead
        );
      });
    }

    setActiveId(null);
  };

  const getLeadsByStage = (stageId: string) => {
    return leads.filter((lead) => lead.pipeline_stage === stageId);
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
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
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
      </div>
    </DashboardLayout>
  );
}
