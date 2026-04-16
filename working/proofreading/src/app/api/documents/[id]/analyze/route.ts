import { NextResponse } from "next/server";
import { runAnalysis } from "@/lib/mock-db";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, context: Context) {
  const { id } = await context.params;
  const document = await runAnalysis(id);

  if (!document) {
    return new NextResponse("문서를 찾을 수 없습니다.", { status: 404 });
  }

  return NextResponse.json(document);
}
