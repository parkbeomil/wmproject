import { analyzeDocument } from "@/lib/analyzer";
import { extractText } from "@/lib/extractor";
import { createId } from "@/lib/id";
import { seedDocuments, seedGlossaryTerms } from "@/lib/seed-data";
import type {
  CreateDocumentPayload,
  DashboardData,
  DocumentRecord,
  GlossaryTerm,
  ReviewDecision
} from "@/types/document";
import { splitIntoSections } from "@/utils/document";

declare global {
  var __proofreadingStore:
    | {
        documents: DocumentRecord[];
        glossaryTerms: GlossaryTerm[];
      }
    | undefined;
}

const store =
  globalThis.__proofreadingStore ??
  (globalThis.__proofreadingStore = {
    documents: structuredClone(seedDocuments),
    glossaryTerms: structuredClone(seedGlossaryTerms)
  });

const { documents, glossaryTerms } = store;

function calculateMetrics(docList: DocumentRecord[]) {
  const totalIssues = docList.reduce((acc, item) => acc + item.issues.length, 0);
  const pendingIssues = docList.reduce(
    (acc, item) => acc + item.issues.filter((issue) => issue.reviewStatus === "pending").length,
    0
  );
  const reviewedIssues = totalIssues - pendingIssues;

  return {
    totalDocuments: docList.length,
    totalIssues,
    pendingIssues,
    reviewedRate: totalIssues === 0 ? 0 : Math.round((reviewedIssues / totalIssues) * 100)
  };
}

export async function listDashboardData(): Promise<DashboardData> {
  const sortedDocuments = [...documents].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

  return {
    documents: sortedDocuments,
    glossaryTerms: glossaryTerms,
    metrics: calculateMetrics(sortedDocuments)
  };
}

export async function createDocument(payload: CreateDocumentPayload) {
  const extracted = await extractText(payload);
  const text = extracted.text;
  const sections = splitIntoSections(text);

  const document: DocumentRecord = {
    id: createId("document"),
    bookTitle: payload.bookTitle,
    chapterTitle: payload.chapterTitle,
    format: payload.format,
    version: 1,
    status: text ? "ready" : "draft",
    uploadedAt: new Date().toISOString(),
    extractionNote: extracted.extractionNote,
    text,
    sections,
    issues: [],
    analysisNotes: []
  };

  documents.unshift(document);
  return document;
}

export async function runAnalysis(documentId: string) {
  const document = documents.find((item) => item.id === documentId);

  if (!document) {
    return null;
  }

  document.status = "analyzing";
  const analyzed = await analyzeDocument(document, glossaryTerms);
  document.issues = analyzed.issues;
  document.analysisNotes = analyzed.analysisNotes;
  document.status = "reviewing";
  document.reportReadyAt = new Date().toISOString();

  return document;
}

export async function updateReview(documentId: string, decision: ReviewDecision) {
  const document = documents.find((item) => item.id === documentId);

  if (!document) {
    return null;
  }

  const issue = document.issues.find((item) => item.id === decision.issueId);

  if (!issue) {
    return null;
  }

  issue.reviewStatus = decision.status;
  issue.reviewedBy = decision.reviewer;
  issue.reviewMemo = decision.memo;
  issue.reviewedAt = decision.reviewedAt;

  return issue;
}

export async function exportReport(documentId: string) {
  const document = documents.find((item) => item.id === documentId);

  if (!document) {
    return null;
  }

  const lines = [
    `도서명: ${document.bookTitle}`,
    `챕터명: ${document.chapterTitle}`,
    `형식: ${document.format.toUpperCase()}`,
    `업로드 시각: ${document.uploadedAt}`,
    `검사 결과 수: ${document.issues.length}`,
    ...(document.analysisNotes.length > 0 ? [`분석 메모: ${document.analysisNotes.join(" / ")}`] : []),
    ""
  ];

  document.issues.forEach((issue, index) => {
    lines.push(`${index + 1}. [${issue.category}] ${issue.title}`);
    lines.push(`상태: ${issue.reviewStatus}`);
    lines.push(`위치: ${issue.location.sectionHeading} / 문단 ${issue.location.paragraphIndex + 1}`);
    lines.push(`원문: ${issue.excerpt}`);
    lines.push(`근거: ${issue.rationale}`);
    if (issue.suggestions[0]) {
      lines.push(`추천: ${issue.suggestions[0].text}`);
    }
    if (issue.evidences[0]) {
      lines.push(`외부 근거: ${issue.evidences[0].title}`);
    }
    lines.push("");
  });

  return lines.join("\n");
}

export async function listGlossaryTerms() {
  return glossaryTerms;
}

export async function addGlossaryTerm(term: Omit<GlossaryTerm, "id">) {
  const created: GlossaryTerm = {
    id: createId("glossary"),
    ...term
  };
  glossaryTerms.unshift(created);
  return created;
}
