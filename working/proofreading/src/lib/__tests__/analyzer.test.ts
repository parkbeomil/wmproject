import test from "node:test";
import assert from "node:assert/strict";
import { analyzeDocument } from "@/lib/analyzer";
import { seedDocuments, seedGlossaryTerms } from "@/lib/seed-data";

test("analyzeDocument detects spacing, unit, glossary, and romanization issues", async () => {
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

  const analyzed = await analyzeDocument(seedDocuments[0], seedGlossaryTerms);

  assert.ok(analyzed.issues.some((issue) => issue.category === "spacing"));
  assert.ok(analyzed.issues.some((issue) => issue.category === "number_unit"));
  assert.ok(analyzed.issues.some((issue) => issue.category === "glossary"));
  assert.ok(analyzed.issues.some((issue) => issue.category === "romanization"));
});
