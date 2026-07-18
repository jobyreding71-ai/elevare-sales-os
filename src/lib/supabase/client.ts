import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Validate Supabase configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables!",
    { hasUrl: !!supabaseUrl, hasKey: !!supabaseAnonKey }
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // PKCE is only needed for OAuth flows, not email/password
    // Removed to ensure cookies work properly for middleware
  },
});

// Type definitions for Supabase database tables
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: "owner" | "agent" | "manager" | "admin";
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          role?: "owner" | "agent" | "manager" | "admin";
          phone?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string;
          email?: string;
          role?: "owner" | "agent" | "manager" | "admin";
          phone?: string | null;
          avatar_url?: string | null;
        };
      };
      leads: {
        Row: {
          id: string;
          owner_id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          email: string | null;
          date_of_birth: string | null;
          marital_status: string | null;
          children_count: number | null;
          occupation: string | null;
          annual_income: number | null;
          state: string | null;
          city: string | null;
          zip_code: string | null;
          lead_source: string | null;
          lead_status: string;
          pipeline_stage: string;
          ai_score: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          email?: string | null;
          date_of_birth?: string | null;
          marital_status?: string | null;
          children_count?: number | null;
          occupation?: string | null;
          annual_income?: number | null;
          state?: string | null;
          city?: string | null;
          zip_code?: string | null;
          lead_source?: string | null;
          lead_status?: string;
          pipeline_stage?: string;
          ai_score?: number | null;
          notes?: string | null;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          email?: string | null;
          date_of_birth?: string | null;
          marital_status?: string | null;
          children_count?: number | null;
          occupation?: string | null;
          annual_income?: number | null;
          state?: string | null;
          city?: string | null;
          zip_code?: string | null;
          lead_source?: string | null;
          lead_status?: string;
          pipeline_stage?: string;
          ai_score?: number | null;
          notes?: string | null;
        };
      };
      calls: {
        Row: {
          id: string;
          lead_id: string;
          user_id: string;
          twilio_call_sid: string | null;
          duration_seconds: number | null;
          recording_url: string | null;
          transcript: string | null;
          ai_summary: string | null;
          ai_objections: string[] | null;
          ai_buying_signals: string[] | null;
          ai_next_actions: string[] | null;
          sentiment_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          user_id: string;
          twilio_call_sid?: string | null;
          duration_seconds?: number | null;
          recording_url?: string | null;
          transcript?: string | null;
          ai_summary?: string | null;
          ai_objections?: string[] | null;
          ai_buying_signals?: string[] | null;
          ai_next_actions?: string[] | null;
          sentiment_score?: number | null;
        };
        Update: {
          transcript?: string | null;
          ai_summary?: string | null;
          ai_objections?: string[] | null;
          ai_buying_signals?: string[] | null;
          ai_next_actions?: string[] | null;
          sentiment_score?: number | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          lead_id: string | null;
          assigned_to: string;
          title: string;
          description: string | null;
          due_date: string | null;
          priority: "low" | "medium" | "high" | "urgent";
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          assigned_to: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          priority?: "low" | "medium" | "high" | "urgent";
          completed?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          due_date?: string | null;
          priority?: "low" | "medium" | "high" | "urgent";
          completed?: boolean;
          assigned_to?: string;
          lead_id?: string | null;
        };
      };
      appointments: {
        Row: {
          id: string;
          lead_id: string;
          user_id: string;
          appointment_type: string;
          start_time: string;
          end_time: string;
          location: string | null;
          notes: string | null;
          status: "scheduled" | "completed" | "cancelled" | "no_show";
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          user_id: string;
          appointment_type: string;
          start_time: string;
          end_time: string;
          location?: string | null;
          notes?: string | null;
          status?: "scheduled" | "completed" | "cancelled" | "no_show";
        };
        Update: {
          appointment_type?: string;
          start_time?: string;
          end_time?: string;
          location?: string | null;
          notes?: string | null;
          status?: "scheduled" | "completed" | "cancelled" | "no_show";
        };
      };
      policies: {
        Row: {
          id: string;
          lead_id: string;
          carrier: string;
          product_type: string;
          face_amount: number;
          annual_premium: number;
          application_date: string | null;
          issue_date: string | null;
          policy_status: string;
          chargeback_risk: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          carrier: string;
          product_type: string;
          face_amount: number;
          annual_premium: number;
          application_date?: string | null;
          issue_date?: string | null;
          policy_status?: string;
          chargeback_risk?: boolean;
        };
        Update: {
          carrier?: string;
          product_type?: string;
          face_amount?: number;
          annual_premium?: number;
          application_date?: string | null;
          issue_date?: string | null;
          policy_status?: string;
          chargeback_risk?: boolean;
        };
      };
      commissions: {
        Row: {
          id: string;
          policy_id: string;
          user_id: string;
          gross_premium: number;
          commission_rate: number;
          advance_amount: number;
          renewal_amount: number;
          paid_amount: number;
          paid_date: string | null;
          chargeback_amount: number;
          commission_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          policy_id: string;
          user_id: string;
          gross_premium: number;
          commission_rate: number;
          advance_amount?: number;
          renewal_amount?: number;
          paid_amount?: number;
          paid_date?: string | null;
          chargeback_amount?: number;
          commission_status?: string;
        };
        Update: {
          gross_premium?: number;
          commission_rate?: number;
          advance_amount?: number;
          renewal_amount?: number;
          paid_amount?: number;
          paid_date?: string | null;
          chargeback_amount?: number;
          commission_status?: string;
        };
      };
      lead_activities: {
        Row: {
          id: string;
          lead_id: string;
          user_id: string;
          activity_type: string;
          content: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          user_id: string;
          activity_type: string;
          content: string;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          content?: string;
          metadata?: Record<string, unknown> | null;
        };
      };
      ai_coaching_reports: {
        Row: {
          id: string;
          call_id: string;
          talk_ratio: number;
          question_count: number;
          objection_handling_score: number;
          confidence_score: number;
          empathy_score: number;
          closing_score: number;
          missed_opportunities: string[];
          recommended_improvements: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          call_id: string;
          talk_ratio: number;
          question_count: number;
          objection_handling_score: number;
          confidence_score: number;
          empathy_score: number;
          closing_score: number;
          missed_opportunities: string[];
          recommended_improvements: string[];
        };
        Update: {
          talk_ratio?: number;
          question_count?: number;
          objection_handling_score?: number;
          confidence_score?: number;
          empathy_score?: number;
          closing_score?: number;
          missed_opportunities?: string[];
          recommended_improvements?: string[];
        };
      };
    };
  };
}

// Helper function to get current user
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Helper function to sign in with email
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// Helper function to sign up
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
}

// Helper function to sign in with Google
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

// Helper function to sign in with magic link
export async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) throw error;
  return data;
}

// Helper function to sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Helper function to reset password
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
  return data;
}
