"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DocumentIntakeForm } from "@/components/dashboard/DocumentIntakeForm";
import { DocumentQueue } from "@/components/dashboard/DocumentQueue";
import { GlossaryPanel } from "@/components/dashboard/GlossaryPanel";
import { IssueReviewPanel } from "@/components/dashboard/IssueReviewPanel";
import { ReportPanel } from "@/components/dashboard/ReportPanel";
import { StatCard } from "@/components/common/StatCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardStore } from "@/store/dashboardStore";
import type { DashboardData } from "@/types/document";

interface DashboardClientProps {
  initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { data, isLoading, isError } = useDashboardData(initialData);
  const selectedDocumentId = useDashboardStore((state) => state.selectedDocumentId);

  if (isLoading) {
    return (
      <AppShell>
        <div className="rounded-xl border border-white/60 bg-white/80 p-8 text-sm text-slate-600">
          대시보드를 불러오는 중입니다...
        </div>
      </AppShell>
    );
  }

  if (isError || !data) {
    return (
      <AppShell>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
          데이터를 불러오지 못했습니다.
        </div>
      </AppShell>
    );
  }

  const selectedDocument =
    data.documents.find((document) => document.id === selectedDocumentId) ?? data.documents[0];
  const hasDocument = Boolean(selectedDocument);
  const hasExtractedText = Boolean(selectedDocument?.text?.trim());
  const hasAnalysisRun = Boolean(
    selectedDocument && (selectedDocument.status === "reviewing" || selectedDocument.reportReadyAt)
  );
  const canShowReport = Boolean(selectedDocument?.reportReadyAt);

  const stepCards = [
    {
      step: "Step 1",
      title: "문서 등록",
      accent: "text-teal-300",
      active: true
    },
    {
      step: "Step 2",
      title: "추출 확인 및 검사 실행",
      accent: "text-rose-500",
      active: hasDocument
    },
    {
      step: "Step 3",
      title: "추천 검토 및 판정",
      accent: "text-teal-500",
      active: hasAnalysisRun
    },
    {
      step: "Step 4",
      title: "리포트 및 기준 관리",
      accent: "text-amber-500",
      active: canShowReport
    }
  ];

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-rose-500">Proofreading Ops</p>
          <h1 className="mt-3 max-w-4xl font-serif text-5xl font-semibold tracking-tight text-slate-950">
            교정편집기 : 원문의 문법오류와 맞춤법등을 검사합니다.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            교과서 개발자들을 위한 교정·교열 지원 서비스 MVP입니다. 문서 등록, 검사 실행, 추천 검토,
            용어집 관리, 리포트 생성 흐름을 한 화면에서 확인할 수 있습니다.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard label="등록 문서" value={`${data.metrics.totalDocuments}`} hint="챕터 단위 문서 기준" />
          <StatCard label="전체 이슈" value={`${data.metrics.totalIssues}`} hint="규범 + 일관성 검출" />
          <StatCard label="미처리" value={`${data.metrics.pendingIssues}`} hint="사람 검토 대기 상태" />
          <StatCard label="반영률" value={`${data.metrics.reviewedRate}%`} hint="승인/반려/보류 포함" />
        </div>
      </section>

      <section className="mt-8 space-y-8">
        <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur">
          <div className="grid gap-3 md:grid-cols-4">
            {stepCards.map((card) => (
              <div
                key={card.step}
                className={
                  card.active
                    ? "rounded-lg bg-slate-950 px-4 py-3 text-white"
                    : "rounded-lg bg-white px-4 py-3 text-slate-400 shadow-sm ring-1 ring-slate-200"
                }
              >
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${card.active ? "text-white/70" : card.accent}`}>
                  {card.step}
                </p>
                <p className="mt-2 text-sm font-semibold">{card.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Step 1</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">원고 등록</h2>
          </div>
          <DocumentIntakeForm />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-500">Step 2</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">추출 확인 및 검사 실행</h2>
          </div>
          {hasDocument ? (
            <div className="space-y-4">
              <section className="rounded-xl border border-white/60 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-rose-500">Extracted Text</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                      {selectedDocument.chapterTitle}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {selectedDocument.format.toUpperCase()}
                  </span>
                </div>
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                  {hasExtractedText ? (
                    <pre className="whitespace-pre-wrap font-sans">{selectedDocument.text}</pre>
                  ) : (
                    "아직 추출된 텍스트가 없습니다."
                  )}
                </div>
                {selectedDocument.extractionNote ? (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {selectedDocument.extractionNote}
                  </div>
                ) : null}
              </section>
              <DocumentQueue documents={data.documents} />
            </div>
          ) : (
            <section className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-8 text-sm text-slate-600">
              문서를 등록하면 추출된 본문과 검사 실행 영역이 여기 표시됩니다.
            </section>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">Step 3</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">이슈 리뷰</h2>
          </div>
          {hasAnalysisRun ? (
            <IssueReviewPanel document={selectedDocument} />
          ) : (
            <section className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-8 text-sm text-slate-600">
              검사 실행이 완료되면 추천 이슈와 검토 버튼이 여기 표시됩니다.
            </section>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">Step 4</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">리포트와 기준 관리</h2>
          </div>
          {canShowReport ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <ReportPanel document={selectedDocument} />
              <GlossaryPanel glossaryTerms={data.glossaryTerms} />
            </div>
          ) : (
            <section className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-8 text-sm text-slate-600">
              리뷰 결과가 생성되면 리포트 미리보기와 용어 기준 관리가 여기 열립니다.
            </section>
          )}
        </div>
      </section>
    </AppShell>
  );
}
