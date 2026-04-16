"use client";

import { useState } from "react";
import { useAddGlossaryTerm } from "@/hooks/useDashboardData";
import type { GlossaryTerm } from "@/types/document";

interface GlossaryPanelProps {
  glossaryTerms: GlossaryTerm[];
}

export function GlossaryPanel({ glossaryTerms }: GlossaryPanelProps) {
  const addGlossaryTerm = useAddGlossaryTerm();
  const [standard, setStandard] = useState("판별식");
  const [allowedVariants, setAllowedVariants] = useState("판별 식");
  const [bannedVariants, setBannedVariants] = useState("판 별식");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await addGlossaryTerm.mutateAsync({
      standard,
      allowedVariants: allowedVariants
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      bannedVariants: bannedVariants
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      scope: "book"
    });
  }

  return (
    <section className="rounded-xl border border-white/60 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-500">Glossary Control</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">용어집 관리</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-600">
          도서별 표준 용어, 허용 표기, 금지 표기를 등록해 일관성 검출의 기준으로 사용합니다.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {glossaryTerms.map((term) => (
            <article key={term.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{term.standard}</h3>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {term.scope}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                허용: {term.allowedVariants.length > 0 ? term.allowedVariants.join(", ") : "없음"}
              </p>
              <p className="mt-1 text-sm text-rose-600">
                금지: {term.bannedVariants.length > 0 ? term.bannedVariants.join(", ") : "없음"}
              </p>
            </article>
          ))}
        </div>

        <form className="rounded-xl border border-slate-200 bg-slate-950 p-5 text-white" onSubmit={handleSubmit}>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-300">New Term</p>
          <div className="mt-4 space-y-4">
            <label className="block space-y-2 text-sm">
              <span>표준 용어</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-amber-300"
                value={standard}
                onChange={(event) => setStandard(event.target.value)}
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span>허용 표기</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-amber-300"
                value={allowedVariants}
                onChange={(event) => setAllowedVariants(event.target.value)}
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span>금지 표기</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-amber-300"
                value={bannedVariants}
                onChange={(event) => setBannedVariants(event.target.value)}
              />
            </label>
            <button
              className="w-full rounded-full bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              type="submit"
            >
              용어집 추가
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
