import { NextResponse } from "next/server";
import { addGlossaryTerm, listGlossaryTerms } from "@/lib/mock-db";
import type { GlossaryTerm } from "@/types/document";

export async function GET() {
  const terms = await listGlossaryTerms();
  return NextResponse.json(terms);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Omit<GlossaryTerm, "id">;

  if (!payload.standard) {
    return new NextResponse("표준 용어를 입력해 주세요.", { status: 400 });
  }

  const created = await addGlossaryTerm(payload);
  return NextResponse.json(created);
}
