"use client";

import { useTransition } from "react";
import { useRunAnalysis } from "@/hooks/useDashboardData";
import { useDashboardStore } from "@/store/dashboardStore";
import type { DocumentRecord } from "@/types/document";

interface DocumentQueueProps {
  documents: DocumentRecord[];
}

function getStatusLabel(document: DocumentRecord) {
  switch (document.status) {
    case "draft":
      return "텍스트 확인 필요";
    case "ready":
      return "검사 대기";
    case "analyzing":
      return "검사 중";
    case "reviewing":
      return "검토 가능";
    default:
      return document.status;
  }
}

export function DocumentQueue({ documents }: DocumentQueueProps) {
  const { selectedDocumentId, setSelectedDocumentId } = useDashboardStore();
  const runAnalysis = useRunAnalysis();
  const [isPending, startTransition] = useTransition();

  return (
    <section className="rounded-xl border border-white/60 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(2,6,23,0.30)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-300">Chapter Queue</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">검사 대상 문서</h2>
        </div>
        <p className="max-w-xs text-sm leading-6 text-slate-300">
          챕터 단위로 업로드된 문서를 기준으로 검사 실행과 검토 우선순위를 관리합니다.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-300">
            아직 등록된 문서가 없습니다. 먼저 Step 1에서 문서를 등록해 주세요.
          </div>
        ) : null}
        {documents.map((document) => {
          const selected = selectedDocumentId === document.id;
          const pendingCount = document.issues.filter((issue) => issue.reviewStatus === "pending").length;

          return (
            <article
              key={document.id}
              className={`w-full rounded-xl border px-4 py-4 text-left transition ${
                selected
                  ? "border-teal-300 bg-teal-400/10"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8"
              }`}
            >
              <button
                className="w-full text-left"
                onClick={() => setSelectedDocumentId(document.id)}
                type="button"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-300">{document.bookTitle}</p>
                    <h3 className="mt-1 text-lg font-semibold">{document.chapterTitle}</h3>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-100">
                    {getStatusLabel(document)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span>{document.format.toUpperCase()}</span>
                  <span>이슈 {document.issues.length}건</span>
                  <span>미처리 {pendingCount}건</span>
                  <span>버전 {document.version}</span>
                </div>
              </button>

              <div className="mt-4 flex flex-wrap gap-3">
                <div>
                  <button
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:bg-slate-400"
                    type="button"
                    disabled={isPending || runAnalysis.isPending || document.status === "draft"}
                    onClick={() => {
                      startTransition(async () => {
                        await runAnalysis.mutateAsync(document.id);
                        setSelectedDocumentId(document.id);
                      });
                    }}
                  >
                    {isPending || runAnalysis.isPending ? "검사 중..." : "검사 실행"}
                  </button>
                </div>
                {document.extractionNote ? (
                  <span className="self-center text-xs text-amber-200">{document.extractionNote}</span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
