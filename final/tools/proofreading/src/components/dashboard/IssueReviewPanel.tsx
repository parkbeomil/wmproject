"use client";

import { useDeferredValue } from "react";
import { useReviewIssue } from "@/hooks/useDashboardData";
import { useDashboardStore } from "@/store/dashboardStore";
import type { DocumentRecord, Issue, ReviewStatus } from "@/types/document";

interface IssueReviewPanelProps {
  document: DocumentRecord | undefined;
}

const REVIEW_ACTIONS: Array<{ label: string; status: ReviewStatus; tone: string }> = [
  { label: "승인", status: "approved", tone: "bg-emerald-500 hover:bg-emerald-400" },
  { label: "보류", status: "hold", tone: "bg-amber-500 hover:bg-amber-400" },
  { label: "반려", status: "rejected", tone: "bg-rose-500 hover:bg-rose-400" }
];

function ReviewItem({
  documentId,
  issue,
  reviewerName
}: {
  documentId: string;
  issue: Issue;
  reviewerName: string;
}) {
  const reviewIssue = useReviewIssue(documentId);

  async function handleDecision(status: ReviewStatus) {
    await reviewIssue.mutateAsync({
      documentId,
      issueId: issue.id,
      reviewer: reviewerName,
      status,
      reviewedAt: new Date().toISOString(),
      memo: status === "hold" ? "추가 확인 필요" : undefined
    });
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">{issue.category}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{issue.title}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {issue.reviewStatus}
        </span>
      </div>

      <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{issue.excerpt}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{issue.rationale}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">추천 수정안</p>
          {issue.suggestions.map((suggestion) => (
            <div key={suggestion.id} className="mt-3 rounded-lg bg-emerald-50 px-4 py-3">
              <p className="font-semibold text-emerald-900">{suggestion.text}</p>
              <p className="mt-1 text-sm text-emerald-800">{suggestion.reason}</p>
              <p className="mt-2 text-xs text-emerald-700">
                {suggestion.source} · 신뢰도 {Math.round(suggestion.confidence * 100)}%
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">원문 위치</p>
          <p className="mt-3 text-sm text-slate-700">{issue.location.sectionHeading}</p>
          <p className="mt-1 text-sm text-slate-600">문단 {issue.location.paragraphIndex + 1}</p>
          <p className="mt-1 text-sm text-slate-600">
            토큰 {issue.location.tokenStart} - {issue.location.tokenEnd}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {REVIEW_ACTIONS.map((action) => (
              <button
                key={action.status}
                className={`rounded-full px-3 py-2 text-sm font-semibold text-white transition ${action.tone}`}
                type="button"
                disabled={reviewIssue.isPending}
                onClick={() => void handleDecision(action.status)}
              >
                {reviewIssue.isPending ? "처리 중..." : action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {issue.evidences.length > 0 ? (
        <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">외부 근거</p>
          <div className="mt-3 space-y-3">
            {issue.evidences.map((evidence) => (
              <div key={evidence.id} className="rounded-lg bg-white px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-sky-900">{evidence.title}</span>
                  <span className="rounded-full bg-sky-100 px-2 py-1 text-[11px] font-semibold text-sky-700">
                    {evidence.source}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{evidence.description}</p>
                {evidence.link ? (
                  <a
                    className="mt-2 inline-block text-xs font-semibold text-sky-700 underline"
                    href={evidence.link}
                    rel="noreferrer"
                    target="_blank"
                  >
                    공식 근거 열기
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function IssueReviewPanel({ document }: IssueReviewPanelProps) {
  const reviewerName = useDashboardStore((state) => state.reviewerName);
  const deferredDocument = useDeferredValue(document);

  if (!deferredDocument) {
    return (
      <section className="rounded-xl border border-white/60 bg-white/85 p-6">
        <p className="text-sm text-slate-600">왼쪽 목록에서 검토할 문서를 선택해 주세요.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-white/60 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-500">Review Desk</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {deferredDocument.chapterTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{deferredDocument.bookTitle}</p>
        </div>
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          검수자: <span className="font-semibold">{reviewerName}</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {deferredDocument.analysisNotes.length > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {deferredDocument.analysisNotes.join(" / ")}
          </div>
        ) : null}
        {deferredDocument.issues.length > 0 ? (
          deferredDocument.issues.map((issue) => (
            <ReviewItem
              key={issue.id}
              documentId={deferredDocument.id}
              issue={issue}
              reviewerName={reviewerName}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
            아직 검사 결과가 없습니다. 검사 실행 버튼으로 추천 목록을 생성해 주세요.
          </div>
        )}
      </div>
    </section>
  );
}
