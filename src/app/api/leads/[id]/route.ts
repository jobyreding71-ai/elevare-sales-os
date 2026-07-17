import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/leads/[id] - Get a single lead
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/leads/[id] - Update a lead
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get the current lead to track changes
    const { data: currentLead, error: fetchError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Update the lead
    const { data, error } = await supabase
      .from("leads")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log stage changes
    if (body.pipeline_stage && body.pipeline_stage !== currentLead.pipeline_stage) {
      await supabase.from("lead_activities").insert({
        lead_id: id,
        user_id: body.owner_id || currentLead.owner_id,
        activity_type: "stage_change",
        content: `Pipeline stage updated: ${currentLead.pipeline_stage.replace("_", " ")} → ${body.pipeline_stage.replace("_", " ")}`,
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id] - Delete a lead
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
