import { NextResponse } from "next/server";
import { getDocumentText } from "@/lib/mock-db";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  const result = await getDocumentText(id);

  if (!result) {
    return new NextResponse("문서를 찾을 수 없습니다.", { status: 404 });
  }

  const { text, fileName } = result;

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
    }
  });
}
