import { NextResponse } from "next/server";
import { updateReview } from "@/lib/mock-db";
import type { ReviewDecision } from "@/types/document";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  const payload = (await request.json()) as ReviewDecision;
  const issue = await updateReview(id, payload);

  if (!issue) {
    return new NextResponse("검토 대상을 찾을 수 없습니다.", { status: 404 });
  }

  return NextResponse.json(issue);
}
