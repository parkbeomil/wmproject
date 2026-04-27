import { NextResponse } from "next/server";
import { createDocument, listDashboardData } from "@/lib/mock-db";
import type { CreateDocumentPayload } from "@/types/document";

export async function GET() {
  const data = await listDashboardData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as CreateDocumentPayload;

  if (!payload.bookTitle || !payload.chapterTitle || !payload.format) {
    return new NextResponse("필수 항목이 누락되었습니다.", { status: 400 });
  }

  const document = await createDocument(payload);
  return NextResponse.json(document);
}
