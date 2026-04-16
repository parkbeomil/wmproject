export type DocumentFormat = "docx" | "hwp" | "txt";
export type DocumentStatus = "draft" | "ready" | "analyzing" | "reviewing";
export type ReviewStatus = "pending" | "approved" | "rejected" | "hold";
export type IssueSeverity = "high" | "medium" | "low";
export type IssueCategory =
  | "spelling"
  | "spacing"
  | "punctuation"
  | "number_unit"
  | "glossary"
  | "heading_style"
  | "repetition"
  | "tone";

export interface DocumentSection {
  id: string;
  heading: string;
  level: number;
  paragraphs: string[];
}

export interface DocumentLocation {
  sectionId: string;
  sectionHeading: string;
  paragraphIndex: number;
  sentenceIndex: number;
  tokenStart: number;
  tokenEnd: number;
}

export interface Suggestion {
  id: string;
  text: string;
  reason: string;
  source: string;
  confidence: number;
}

export interface Issue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  excerpt: string;
  rationale: string;
  location: DocumentLocation;
  groupKey: string;
  suggestions: Suggestion[];
  reviewStatus: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewMemo?: string;
}

export interface ReviewDecision {
  issueId: string;
  status: ReviewStatus;
  reviewer: string;
  memo?: string;
  reviewedAt: string;
}

export interface GlossaryTerm {
  id: string;
  standard: string;
  allowedVariants: string[];
  bannedVariants: string[];
  scope: "book" | "series";
}

export interface DocumentRecord {
  id: string;
  bookTitle: string;
  chapterTitle: string;
  format: DocumentFormat;
  version: number;
  status: DocumentStatus;
  uploadedAt: string;
  extractionNote?: string;
  text: string;
  sections: DocumentSection[];
  issues: Issue[];
  reportReadyAt?: string;
}

export interface CreateDocumentPayload {
  bookTitle: string;
  chapterTitle: string;
  format: DocumentFormat;
  text?: string;
  fileName?: string;
  fileBase64?: string;
}

export interface DashboardData {
  documents: DocumentRecord[];
  glossaryTerms: GlossaryTerm[];
  metrics: {
    totalDocuments: number;
    totalIssues: number;
    pendingIssues: number;
    reviewedRate: number;
  };
}
