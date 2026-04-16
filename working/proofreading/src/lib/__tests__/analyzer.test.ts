import test from "node:test";
import assert from "node:assert/strict";
import { analyzeDocument } from "@/lib/analyzer";
import { seedGlossaryTerms } from "@/lib/seed-data";
import type { DocumentRecord } from "@/types/document";

const fixtureDocument: DocumentRecord = {
  id: "doc-test-1",
  bookTitle: "중학 수학 개념서",
  chapterTitle: "3-1 이차방정식",
  format: "txt",
  version: 1,
  status: "ready",
  uploadedAt: "2026-04-16T08:30:00.000Z",
  extractionNote: undefined,
  text: [
    "# 1. 이차방정식의 풀이",
    "2차방정식은 ax²+bx+c=0 꼴의 방정식이다.",
    "학생들은 2 차 방정식의 근을 구할 수 있어야한다.",
    "답을 구할때 단위를 빠뜨리지 않도록 한다.",
    "결과가 몇일 뒤에 나온다고 하면 왠만한 학생도 불안해한다.",
    "가곡의 로마자 표기를 Kagok으로 적는 것은 잘못이다.",
    "",
    "## 확인 문제",
    "다음 수 를 자연수와 정수로 나누어 보자.",
    "반지름은 3 cm 이고 넓이는 9 cm2이다."
  ].join("\n"),
  sections: [
    {
      id: "section-1",
      heading: "1. 이차방정식의 풀이",
      level: 1,
      paragraphs: [
        "2차방정식은 ax²+bx+c=0 꼴의 방정식이다.",
        "학생들은 2 차 방정식의 근을 구할 수 있어야한다.",
        "답을 구할때 단위를 빠뜨리지 않도록 한다.",
        "결과가 몇일 뒤에 나온다고 하면 왠만한 학생도 불안해한다.",
        "가곡의 로마자 표기를 Kagok으로 적는 것은 잘못이다."
      ]
    },
    {
      id: "section-2",
      heading: "확인 문제",
      level: 2,
      paragraphs: [
        "다음 수 를 자연수와 정수로 나누어 보자.",
        "반지름은 3 cm 이고 넓이는 9 cm2이다."
      ]
    }
  ],
  issues: [],
  analysisNotes: [],
  reportReadyAt: undefined
};

test("analyzeDocument detects spelling, spacing, unit, glossary, and romanization issues", async () => {
  process.env.ONTERM_API_KEY = "test-onterm";
  process.env.KORNORM_API_KEY = "test-kornorm";
  process.env.STDICT_API_KEY = "test-stdict";

  global.fetch = (async (input: RequestInfo | URL) => {
    const url = input.toString();

    if (url.includes("kli.korean.go.kr")) {
      return new Response(
        JSON.stringify({
          channel: {
            return_object: [
              {
                resultlist: [
                  {
                    word: "이차^방정식",
                    definition: "가장 높은 차수가 이차인 방정식.",
                    category_main: "자연",
                    category_sub: "수학",
                    glossary: "우리말샘"
                  }
                ]
              }
            ]
          }
        })
      );
    }

    if (url.includes("korean.go.kr")) {
      return new Response(
        JSON.stringify({
          response: {
            items: [
              {
                korean_mark: "가곡",
                roman_mark: "Gagok",
                relate_mark_o: "Kagok(X)",
                regltn_path: "본문>제2장>제1항"
              }
            ]
          }
        })
      );
    }

    return new Response("<html>시스템 오류</html>");
  }) as typeof fetch;

  const analyzed = await analyzeDocument(fixtureDocument, seedGlossaryTerms);

  assert.ok(analyzed.issues.some((issue) => issue.category === "spelling"));
  assert.ok(analyzed.issues.some((issue) => issue.category === "spacing"));
  assert.ok(analyzed.issues.some((issue) => issue.category === "number_unit"));
  assert.ok(analyzed.issues.some((issue) => issue.category === "glossary"));
  assert.ok(analyzed.issues.some((issue) => issue.category === "romanization"));
});
