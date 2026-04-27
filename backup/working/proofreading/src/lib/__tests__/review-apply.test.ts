import test from "node:test";
import assert from "node:assert/strict";
import { createDocument, runAnalysis, updateReview } from "@/lib/mock-db";

test("approving an issue applies the first suggestion to the document", async () => {
  process.env.ONTERM_API_KEY = "test-onterm";
  process.env.KORNORM_API_KEY = "test-kornorm";
  process.env.STDICT_API_KEY = "test-stdict";

  global.fetch = (async (input: RequestInfo | URL) => {
    const url = input.toString();

    if (url.includes("kli.korean.go.kr")) {
      return new Response(JSON.stringify({ channel: { return_object: [{ resultlist: [] }] } }));
    }

    if (url.includes("korean.go.kr")) {
      return new Response(JSON.stringify({ response: { items: [] } }));
    }

    return new Response("<html>시스템 오류</html>");
  }) as typeof fetch;

  const created = await createDocument({
    bookTitle: "테스트 도서",
    chapterTitle: "테스트 챕터",
    format: "txt",
    text: "# 1. 테스트\n답을 구할때 단위를 빠뜨리지 않도록 한다."
  });

  const analyzed = await runAnalysis(created.id);
  assert.ok(analyzed);

  const targetIssue = analyzed.issues.find((issue) => issue.title === "의존 명사 띄어쓰기");
  assert.ok(targetIssue);

  const updated = await updateReview(created.id, {
    issueId: targetIssue.id,
    reviewer: "테스터",
    reviewedAt: new Date().toISOString(),
    status: "approved"
  });

  assert.ok(updated);
  assert.ok(updated.text.includes("구할 때"));
  assert.ok(!updated.text.includes("구할때"));
});
