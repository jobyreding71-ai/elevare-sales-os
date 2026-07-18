import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// POST /api/leads/activity - Log an activity for a lead
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lead_id, activity_type, content, metadata } = body;

    if (!lead_id) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Get current user (using client-side auth for API routes)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Insert the activity
    const { data, error } = await supabase
      .from("lead_activities")
      .insert({
        lead_id,
        user_id: user.id,
        activity_type: activity_type || "note",
        content: content || "",
        metadata_json: metadata || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error logging activity:", error);
      return NextResponse.json(
        { error: "Failed to log activity" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activity: data
    });

  } catch (error) {
    console.error("Error in activity route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/leads/activity - Get activities for a lead
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("lead_id");

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("lead_activities")
      .select(`
        *,
        user:users(full_name)
      `)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching activities:", error);
      return NextResponse.json(
        { error: "Failed to fetch activities" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      activities: data || []
    });

  } catch (error) {
    console.error("Error in activity route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
