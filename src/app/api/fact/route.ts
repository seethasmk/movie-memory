import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFact } from "@/lib/facts";

// GET /api/fact: fun fact for the logged-in user only
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fact = await getFact(session.user.id); // ID from session, never from the request
    return NextResponse.json({ text: fact.text, movie: fact.movie, createdAt: fact.createdAt });
  } catch {
    return NextResponse.json({ error: "Could not generate a fun fact right now." }, { status: 503 });
  }
}