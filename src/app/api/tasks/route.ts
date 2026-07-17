import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/supabase/client";

// GET /api/tasks - Get tasks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const assignedTo = searchParams.get("assigned_to") || user.id;
    const completed = searchParams.get("completed");
    const leadId = searchParams.get("lead_id");

    let query = supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", assignedTo)
      .order("due_date", { ascending: true });

    if (completed !== null && completed !== undefined) {
      query = query.eq("completed", completed === "true");
    }

    if (leadId) {
      query = query.eq("lead_id", leadId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ tasks: data });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, due_date, priority, lead_id } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title,
        description: description || null,
        due_date: due_date || null,
        priority: priority || "medium",
        assigned_to: user.id,
        lead_id: lead_id || null,
        completed: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ task: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
