import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createDatabaseClient } from "@/lib/supabase/database";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data, error } = await createDatabaseClient()
      .from("interviews")
      .select("id, topic, interview_type, duration_seconds, score, status, created_at")
      .eq("clerk_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ interviews: data || [] });
  } catch (error) {
    console.error("Interview history error:", error);
    return NextResponse.json({ error: "Interview history is not configured." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { data, error } = await createDatabaseClient()
      .from("interviews")
      .insert({ ...body, clerk_user_id: userId, status: "completed" })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ interview: data }, { status: 201 });
  } catch (error) {
    console.error("Interview save error:", error);
    return NextResponse.json({ error: "Interview history is not configured." }, { status: 503 });
  }
}