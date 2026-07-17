import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/calls - Get all calls
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("lead_id");
    const userId = searchParams.get("user_id");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("calls")
      .select("*, leads(first_name, last_name)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (leadId) {
      query = query.eq("lead_id", leadId);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data,
      count,
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching calls:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/calls - Create a new call record
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      lead_id,
      user_id,
      twilio_call_sid,
      duration_seconds,
      recording_url,
      transcript,
    } = body;

    // Validate required fields
    if (!lead_id || !user_id) {
      return NextResponse.json(
        { error: "Missing required fields: lead_id, user_id" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("calls")
      .insert({
        lead_id,
        user_id,
        twilio_call_sid,
        duration_seconds,
        recording_url,
        transcript,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log activity
    await supabase.from("lead_activities").insert({
      lead_id,
      user_id,
      activity_type: "call",
      content: `Call logged: ${duration_seconds ? Math.floor(duration_seconds / 60) + " minutes" : "Duration not recorded"}`,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error creating call:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
