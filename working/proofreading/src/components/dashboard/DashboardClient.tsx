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

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-rose-500">Proofreading Ops</p>
          <h1 className="mt-3 max-w-4xl font-serif text-5xl font-semibold tracking-tight text-slate-950">
            교정자가 처음부터 찾지 않아도 되도록, 원고의 반복 오류와 용어 흔들림을 먼저 모읍니다.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            출판사 내부 편집자를 위한 교정·교열 지원 서비스 MVP입니다. 문서 등록, 검사 실행, 추천 검토,
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
            <div className="rounded-lg bg-slate-950 px-4 py-3 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Step 1</p>
              <p className="mt-2 text-sm font-semibold">문서 등록</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 text-slate-800 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Step 2</p>
              <p className="mt-2 text-sm font-semibold">검사 대상 선택 및 실행</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 text-slate-800 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-500">Step 3</p>
              <p className="mt-2 text-sm font-semibold">추천 검토 및 판정</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 text-slate-800 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">Step 4</p>
              <p className="mt-2 text-sm font-semibold">리포트 및 기준 용어 관리</p>
            </div>
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
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">검사 실행</h2>
          </div>
          <DocumentQueue documents={data.documents} />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">Step 3</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">이슈 리뷰</h2>
          </div>
          <IssueReviewPanel document={selectedDocument} />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">Step 4</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">리포트와 기준 관리</h2>
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <ReportPanel document={selectedDocument} />
            <GlossaryPanel glossaryTerms={data.glossaryTerms} />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
