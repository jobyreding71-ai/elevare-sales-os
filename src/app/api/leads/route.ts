import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client with service role for API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/leads - Get all leads
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("owner_id");
    const pipelineStage = searchParams.get("pipeline_stage");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (ownerId) {
      query = query.eq("owner_id", ownerId);
    }

    if (pipelineStage) {
      query = query.eq("pipeline_stage", pipelineStage);
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
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      owner_id,
      first_name,
      last_name,
      phone,
      email,
      date_of_birth,
      marital_status,
      children_count,
      occupation,
      annual_income,
      state,
      city,
      zip_code,
      lead_source,
      notes,
    } = body;

    // Validate required fields
    if (!owner_id || !first_name || !last_name) {
      return NextResponse.json(
        { error: "Missing required fields: owner_id, first_name, last_name" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({
        owner_id,
        first_name,
        last_name,
        phone,
        email,
        date_of_birth,
        marital_status,
        children_count,
        occupation,
        annual_income,
        state,
        city,
        zip_code,
        lead_source,
        notes,
        pipeline_stage: "new_lead",
        lead_status: "active",
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
      lead_id: data.id,
      user_id: owner_id,
      activity_type: "lead",
      content: `New lead created: ${first_name} ${last_name}`,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
