"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, getCurrentUser } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
  }, []);

  useEffect(() => {
    // Initial session check
    getCurrentUser().then((user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    isLoading,
    signOut,
    refreshSession,
  };
}

interface UseLeadsOptions {
  ownerId?: string;
  pipelineStage?: string;
  limit?: number;
  offset?: number;
}

interface UseLeadsReturn {
  leads: any[];
  isLoading: boolean;
  error: Error | null;
  count: number;
  refetch: () => Promise<void>;
}

export function useLeads(options: UseLeadsOptions = {}): UseLeadsReturn {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState(0);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (options.ownerId) {
        query = query.eq("owner_id", options.ownerId);
      }

      if (options.pipelineStage) {
        query = query.eq("pipeline_stage", options.pipelineStage);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setLeads(data || []);
      setCount(count || 0);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [options.ownerId, options.pipelineStage, options.limit, options.offset]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    isLoading,
    error,
    count,
    refetch: fetchLeads,
  };
}

export async function createLead(leadData: {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  lead_source?: string;
  owner_id?: string;
}) {
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      first_name: leadData.first_name,
      last_name: leadData.last_name,
      phone: leadData.phone || null,
      email: leadData.email || null,
      city: leadData.city || null,
      state: leadData.state || null,
      lead_source: leadData.lead_source || "Direct",
      owner_id: leadData.owner_id || userData?.user?.id,
      pipeline_stage: "new_lead",
      ai_score: Math.floor(Math.random() * 30) + 10, // Random score between 10-40 for new leads
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

interface UseLeadReturn {
  lead: any;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useLead(leadId: string): UseLeadReturn {
  const [lead, setLead] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLead = useCallback(async () => {
    if (!leadId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (error) throw error;
      setLead(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  return {
    lead,
    isLoading,
    error,
    refetch: fetchLead,
  };
}

interface UseTasksOptions {
  assignedTo?: string;
  leadId?: string;
  completed?: boolean;
}

export function useTasks(options: UseTasksOptions = {}) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("tasks")
        .select("*")
        .order("due_date", { ascending: true });

      if (options.assignedTo) {
        query = query.eq("assigned_to", options.assignedTo);
      }

      if (options.leadId) {
        query = query.eq("lead_id", options.leadId);
      }

      if (typeof options.completed === "boolean") {
        query = query.eq("completed", options.completed);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [options.assignedTo, options.leadId, options.completed]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks,
  };
}

interface UseAppointmentsOptions {
  userId?: string;
  leadId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export function useAppointments(options: UseAppointmentsOptions = {}) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("appointments")
        .select("*")
        .order("start_time", { ascending: true });

      if (options.userId) {
        query = query.eq("user_id", options.userId);
      }

      if (options.leadId) {
        query = query.eq("lead_id", options.leadId);
      }

      if (options.status) {
        query = query.eq("status", options.status);
      }

      if (options.fromDate) {
        query = query.gte("start_time", options.fromDate);
      }

      if (options.toDate) {
        query = query.lte("start_time", options.toDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [options.userId, options.leadId, options.status, options.fromDate, options.toDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    isLoading,
    error,
    refetch: fetchAppointments,
  };
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface DashboardStats {
  newLeadsToday: number;
  callsMade: number;
  appointmentsBooked: number;
  applicationsSubmitted: number;
  policiesIssued: number;
  grossCommission: number;
  paidCommission: number;
  pendingCommission: number;
  monthlyRenewalIncome: number;
  closeRate: number;
  averagePremium: number;
  leadToIssueConversion: number;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0];

      // Fetch leads created today
      const { count: newLeadsToday } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today);

      // Fetch calls this month
      const { count: callsMade } = await supabase
        .from("calls")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth);

      // Fetch appointments this month
      const { count: appointmentsBooked } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("start_time", startOfMonth)
        .eq("status", "scheduled");

      // Fetch applications submitted this month
      const { count: applicationsSubmitted } = await supabase
        .from("policies")
        .select("*", { count: "exact", head: true })
        .gte("application_date", startOfMonth)
        .neq("application_date", null);

      // Fetch policies issued this month
      const { count: policiesIssued } = await supabase
        .from("policies")
        .select("*", { count: "exact", head: true })
        .gte("issue_date", startOfMonth)
        .eq("policy_status", "active");

      // Fetch commissions this month
      const { data: commissionsData } = await supabase
        .from("commissions")
        .select("*")
        .gte("created_at", startOfMonth);

      const grossCommission = commissionsData?.reduce(
        (sum, c) => sum + c.gross_premium * (c.commission_rate / 100),
        0
      ) || 0;
      const paidCommission =
        commissionsData?.reduce((sum, c) => sum + c.paid_amount, 0) || 0;
      const pendingCommission = grossCommission - paidCommission;

      // Fetch renewal income (annual premium for active policies)
      const { data: policiesData } = await supabase
        .from("policies")
        .select("annual_premium")
        .eq("policy_status", "active");

      const monthlyRenewalIncome =
        (policiesData?.reduce((sum, p) => sum + p.annual_premium, 0) || 0) / 12;

      // Calculate close rate
      const { count: totalLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      const closeRate = totalLeads && totalLeads > 0
        ? ((policiesIssued || 0) / totalLeads) * 100
        : 0;

      // Calculate average premium
      const avgPremium =
        policiesData && policiesData.length > 0
          ? policiesData.reduce((sum, p) => sum + p.annual_premium, 0) /
            policiesData.length
          : 0;

      setStats({
        newLeadsToday: newLeadsToday || 0,
        callsMade: callsMade || 0,
        appointmentsBooked: appointmentsBooked || 0,
        applicationsSubmitted: applicationsSubmitted || 0,
        policiesIssued: policiesIssued || 0,
        grossCommission,
        paidCommission,
        pendingCommission,
        monthlyRenewalIncome,
        closeRate: Math.round(closeRate * 10) / 10,
        averagePremium: Math.round(avgPremium),
        leadToIssueConversion: Math.round(closeRate * 10) / 10,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

interface UseCommissionsOptions {
  userId?: string;
  policyId?: string;
  status?: string;
}

interface UseCommissionsReturn {
  commissions: any[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCommissions(options: UseCommissionsOptions = {}): UseCommissionsReturn {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCommissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("commissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (options.userId) {
        query = query.eq("user_id", options.userId);
      }

      if (options.policyId) {
        query = query.eq("policy_id", options.policyId);
      }

      if (options.status) {
        query = query.eq("commission_status", options.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCommissions(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [options.userId, options.policyId, options.status]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  return {
    commissions,
    isLoading,
    error,
    refetch: fetchCommissions,
  };
}
