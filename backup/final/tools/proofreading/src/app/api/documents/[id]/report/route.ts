import { NextResponse } from "next/server";
import { exportReport } from "@/lib/mock-db";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  const report = await exportReport(id);

  if (!report) {
    return new NextResponse("문서를 찾을 수 없습니다.", { status: 404 });
  }

  return NextResponse.json({ report });
}
