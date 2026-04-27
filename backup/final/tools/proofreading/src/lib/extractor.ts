import mammoth from "mammoth";
import type { CreateDocumentPayload } from "@/types/document";

function decodeBase64(input: string) {
  return Buffer.from(input, "base64");
}

export async function extractText(payload: CreateDocumentPayload) {
  if (payload.format === "hwp") {
    return {
      text: payload.text?.trim() ?? "",
      extractionNote:
        "HWP는 초기 버전에서 자동 추출 정확도가 제한됩니다. 추출 결과를 직접 확인하거나 본문 텍스트를 함께 입력해 주세요."
    };
  }

  if (payload.format === "txt") {
    return {
      text: payload.text?.trim() ?? "",
      extractionNote: payload.fileName
        ? "TXT 파일 본문을 읽어 텍스트로 등록했습니다."
        : undefined
    };
  }

  if (payload.format === "docx" && payload.fileBase64) {
    const result = await mammoth.extractRawText({
      buffer: decodeBase64(payload.fileBase64)
    });

    return {
      text: result.value.trim(),
      extractionNote: result.messages.length > 0 ? "DOCX 추출 중 일부 서식이 단순화되었습니다." : undefined
    };
  }

  return {
    text: payload.text?.trim() ?? "",
    extractionNote: undefined
  };
}
