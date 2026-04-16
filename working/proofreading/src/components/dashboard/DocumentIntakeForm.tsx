"use client";

import { useRef, useState, useTransition } from "react";
import { useCreateDocument } from "@/hooks/useDashboardData";
import { useDashboardStore } from "@/store/dashboardStore";
import type { DocumentFormat } from "@/types/document";

async function toBase64(file: File) {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

async function readTextFile(file: File) {
  return file.text();
}

function getHelperMessage(format: DocumentFormat) {
  if (format === "txt") {
    return "TXT는 파일 본문을 직접 읽어 자동으로 입력칸에 반영합니다.";
  }

  if (format === "docx") {
    return "DOCX는 자동 추출을 시도하고, 일부 서식은 단순화될 수 있습니다.";
  }

  return "HWP는 제한 안내와 함께 텍스트 확인을 요구합니다.";
}

export function DocumentIntakeForm() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [bookTitle, setBookTitle] = useState("중학 수학 개념서");
  const [chapterTitle, setChapterTitle] = useState("3-2 근의 공식");
  const [format, setFormat] = useState<DocumentFormat>("docx");
  const [text, setText] = useState(
    "# 1. 근의 공식\n이차방정식의 근을 구할때 판별식을 함께 확인한다.\n가곡의 로마자 표기를 Kagok으로 적는 것은 잘못이다.\n반지름은 4 cm 이고 넓이는 16 cm2이다."
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const createDocument = useCreateDocument();
  const setSelectedDocumentId = useDashboardStore((state) => state.setSelectedDocumentId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const file = fileRef.current?.files?.[0];

    startTransition(async () => {
      try {
        const resolvedText =
          format === "txt" && file ? await readTextFile(file) : text;

        const payload = {
          bookTitle,
          chapterTitle,
          format,
          text: resolvedText,
          fileName: file?.name,
          fileBase64: file ? await toBase64(file) : undefined
        };

        const created = await createDocument.mutateAsync(payload);
        setSelectedDocumentId(created.id);
        if (format === "txt" && resolvedText) {
          setText(resolvedText);
        }
        setNotice(
          created.extractionNote ??
            "문서가 등록되었습니다. 검사 실행 버튼으로 추천 목록을 생성할 수 있습니다."
        );
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "문서 등록에 실패했습니다.");
      }
    });
  }

  return (
    <section className="rounded-xl border border-white/60 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-rose-500">Document Intake</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">문서 등록</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            챕터 단위 원고를 등록하고, 검사 가능한 텍스트를 함께 준비합니다.
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          HWP는 제한 지원
        </span>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            도서명
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-rose-300"
              value={bookTitle}
              onChange={(event) => setBookTitle(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            챕터명
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-rose-300"
              value={chapterTitle}
              onChange={(event) => setChapterTitle(event.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-[180px_1fr]">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            형식
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-rose-300"
              value={format}
              onChange={(event) => setFormat(event.target.value as DocumentFormat)}
            >
              <option value="docx">DOCX</option>
              <option value="hwp">HWP</option>
              <option value="txt">TXT</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            원고 파일
            <input
              ref={fileRef}
              className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600"
              type="file"
              accept=".docx,.hwp,.txt"
            />
          </label>
        </div>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          추출 또는 입력 텍스트
          <textarea
            className="min-h-40 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 outline-none transition focus:border-rose-300"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={isPending || createDocument.isPending}
          >
            {isPending || createDocument.isPending ? "등록 중..." : "문서 등록"}
          </button>
          <p className="text-sm text-slate-600">{getHelperMessage(format)}</p>
        </div>

        {notice ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {notice}
          </div>
        ) : null}
      </form>
    </section>
  );
}
