import type { DocumentRecord, GlossaryTerm } from "@/types/document";

export const seedGlossaryTerms: GlossaryTerm[] = [
  {
    id: "glossary-1",
    standard: "이차방정식",
    allowedVariants: ["2차방정식"],
    bannedVariants: ["2 차 방정식"],
    scope: "book"
  },
  {
    id: "glossary-2",
    standard: "자연수",
    allowedVariants: [],
    bannedVariants: ["자 연수"],
    scope: "series"
  }
];

export const seedDocuments: DocumentRecord[] = [];
