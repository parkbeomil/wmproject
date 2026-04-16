"use client";

import { useState } from "react";
import type { DocumentRecord } from "@/types/document";

interface ReportPanelProps {
  document: DocumentRecord | undefined;
}

export function ReportPanel({ document }: ReportPanelProps) {
  const [notice, setNotice] = useState<string | null>(null);

  async function handleDownload() {
    if (!document) {
      return;
    }

    const response = await fetch(`/api/documents/${document.id}/report`);
    const payload = await response.json();
    setNotice(payload.report as string);
  }

  return (
    <section className="rounded-xl border border-white/60 bg-gradient-to-br from-rose-500 to-orange-400 p-6 text-white shadow-[0_18px_60px_rgba(251,113,133,0.28)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-rose-100">Review Output</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">검토 리포트</h2>
        </div>
        <button
          className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:bg-rose-100"
          type="button"
          disabled={!document}
          onClick={() => void handleDownload()}
        >
          리포트 미리보기
        </button>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-rose-50">
        수정된 원고를 재생성하지 않고, 검수 상태와 추천 근거를 정리한 다운로드용 결과를 우선 제공합니다.
      </p>

      <div className="mt-6 rounded-xl bg-black/15 p-4 text-sm leading-6 text-rose-50">
        {notice ?? "선택한 문서의 리포트를 생성해 미리 볼 수 있습니다."}
      </div>
    </section>
  );
}
