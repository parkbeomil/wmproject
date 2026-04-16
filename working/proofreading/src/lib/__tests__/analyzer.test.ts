import test from "node:test";
import assert from "node:assert/strict";
import { analyzeDocument } from "@/lib/analyzer";
import { seedDocuments, seedGlossaryTerms } from "@/lib/seed-data";

test("analyzeDocument detects spacing, unit, and glossary issues", () => {
  const analyzed = analyzeDocument(seedDocuments[0], seedGlossaryTerms);

  assert.ok(analyzed.some((issue) => issue.category === "spacing"));
  assert.ok(analyzed.some((issue) => issue.category === "number_unit"));
  assert.ok(analyzed.some((issue) => issue.category === "glossary"));
});
