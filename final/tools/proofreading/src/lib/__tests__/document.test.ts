import test from "node:test";
import assert from "node:assert/strict";
import { splitIntoSections } from "@/utils/document";

test("splitIntoSections groups headings and paragraphs", () => {
  const sections = splitIntoSections("# 1. 도입\n첫 문단\n## 확인 문제\n둘째 문단");

  assert.equal(sections.length, 2);
  assert.equal(sections[0].heading, "1. 도입");
  assert.equal(sections[1].heading, "확인 문제");
});
