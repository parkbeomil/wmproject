import { createId } from "@/lib/id";
import type {
  DocumentLocation,
  DocumentRecord,
  GlossaryTerm,
  Issue,
  IssueCategory,
  IssueSeverity,
  Suggestion
} from "@/types/document";

function createLocation(
  document: DocumentRecord,
  sectionIndex: number,
  paragraphIndex: number,
  tokenStart: number,
  tokenEnd: number
): DocumentLocation {
  const section = document.sections[sectionIndex];

  return {
    sectionId: section.id,
    sectionHeading: section.heading,
    paragraphIndex,
    sentenceIndex: 0,
    tokenStart,
    tokenEnd
  };
}

function buildSuggestion(text: string, reason: string, source: string, confidence: number): Suggestion {
  return {
    id: createId("suggestion"),
    text,
    reason,
    source,
    confidence
  };
}

function buildIssue(params: {
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  excerpt: string;
  rationale: string;
  groupKey: string;
  location: DocumentLocation;
  suggestions: Suggestion[];
}): Issue {
  return {
    id: createId("issue"),
    category: params.category,
    severity: params.severity,
    title: params.title,
    excerpt: params.excerpt,
    rationale: params.rationale,
    groupKey: params.groupKey,
    location: params.location,
    suggestions: params.suggestions,
    reviewStatus: "pending"
  };
}

function findIndex(haystack: string, needle: string) {
  const index = haystack.indexOf(needle);
  return index >= 0 ? index : 0;
}

export function analyzeDocument(document: DocumentRecord, glossaryTerms: GlossaryTerm[]) {
  const issues: Issue[] = [];

  document.sections.forEach((section, sectionIndex) => {
    section.paragraphs.forEach((paragraph, paragraphIndex) => {
      if (paragraph.includes("수 를")) {
        const tokenStart = findIndex(paragraph, "수 를");
        issues.push(
          buildIssue({
            category: "spacing",
            severity: "medium",
            title: "조사 앞 불필요한 띄어쓰기",
            excerpt: paragraph,
            rationale: "`수 를`은 목적격 조사와 붙여 쓰는 표현입니다.",
            groupKey: "spacing-particle",
            location: createLocation(document, sectionIndex, paragraphIndex, tokenStart, tokenStart + 3),
            suggestions: [buildSuggestion("수를", "조사 `를`은 앞말과 붙여 씁니다.", "국립국어원 규범", 0.93)]
          })
        );
      }

      if (paragraph.includes("구할때")) {
        const tokenStart = findIndex(paragraph, "구할때");
        issues.push(
          buildIssue({
            category: "spacing",
            severity: "medium",
            title: "의존 명사 띄어쓰기",
            excerpt: paragraph,
            rationale: "`때`는 의존 명사이므로 앞말과 띄어 씁니다.",
            groupKey: "spacing-dependent-noun",
            location: createLocation(document, sectionIndex, paragraphIndex, tokenStart, tokenStart + 3),
            suggestions: [buildSuggestion("구할 때", "`때`는 의존 명사라 띄어씁니다.", "국립국어원 규범", 0.95)]
          })
        );
      }

      if (paragraph.includes("있어야한다")) {
        const tokenStart = findIndex(paragraph, "있어야한다");
        issues.push(
          buildIssue({
            category: "spacing",
            severity: "high",
            title: "보조 용언 띄어쓰기",
            excerpt: paragraph,
            rationale: "`-아야 하다` 구성은 띄어 쓰는 것이 원칙입니다.",
            groupKey: "spacing-auxiliary",
            location: createLocation(document, sectionIndex, paragraphIndex, tokenStart, tokenStart + 6),
            suggestions: [buildSuggestion("있어야 한다", "보조 용언 `하다`는 띄어 씁니다.", "국립국어원 규범", 0.97)]
          })
        );
      }

      if (/cm2\b/.test(paragraph)) {
        const tokenStart = paragraph.search(/cm2\b/);
        issues.push(
          buildIssue({
            category: "number_unit",
            severity: "medium",
            title: "단위 표기 형식 불일치",
            excerpt: paragraph,
            rationale: "제곱 단위 표기는 `cm²` 또는 `cm^2`처럼 일관된 형식이 필요합니다.",
            groupKey: "number-unit-area",
            location: createLocation(document, sectionIndex, paragraphIndex, tokenStart, tokenStart + 3),
            suggestions: [buildSuggestion("cm²", "면적 단위 표기를 통일합니다.", "편집 표기 원칙", 0.82)]
          })
        );
      }

      if (/cm\s이고/.test(paragraph)) {
        const tokenStart = paragraph.search(/cm\s이고/);
        issues.push(
          buildIssue({
            category: "spacing",
            severity: "low",
            title: "단위 뒤 조사 연결 점검",
            excerpt: paragraph,
            rationale: "단위 뒤 조사 연결은 스타일가이드에 맞춰 일관성 있게 유지해야 합니다.",
            groupKey: "spacing-unit-particle",
            location: createLocation(document, sectionIndex, paragraphIndex, tokenStart, tokenStart + 2),
            suggestions: [buildSuggestion("3 cm이고", "문장 내 수식 흐름을 자연스럽게 정리합니다.", "편집자 제안", 0.62)]
          })
        );
      }
    });

    if (section.level === 2 && !/문제|활동|정리/.test(section.heading)) {
      issues.push(
        buildIssue({
          category: "heading_style",
          severity: "low",
          title: "하위 제목 스타일 점검",
          excerpt: section.heading,
          rationale: "하위 제목은 학습 활동 유형과 일치하는 스타일인지 확인이 필요합니다.",
          groupKey: "heading-style",
          location: createLocation(document, sectionIndex, 0, 0, section.heading.length),
          suggestions: [buildSuggestion(section.heading, "제목 체계를 도서 기준에 맞게 확인합니다.", "구조 점검", 0.51)]
        })
      );
    }
  });

  glossaryTerms.forEach((term) => {
    const variants = [term.standard, ...term.allowedVariants, ...term.bannedVariants];
    const hits = new Set<string>();

    document.sections.forEach((section) => {
      section.paragraphs.forEach((paragraph) => {
        variants.forEach((variant) => {
          if (paragraph.includes(variant)) {
            hits.add(variant);
          }
        });
      });
    });

    if (hits.size > 1) {
      const hitList = [...hits].join(", ");
      const paragraph = document.sections.flatMap((section) => section.paragraphs).find((line) => variants.some((variant) => line.includes(variant)));

      if (paragraph) {
        const tokenStart = variants.map((variant) => paragraph.indexOf(variant)).find((index) => index >= 0) ?? 0;
        issues.push(
          buildIssue({
            category: "glossary",
            severity: "high",
            title: "용어 표기 일관성 불일치",
            excerpt: paragraph,
            rationale: `같은 개념이 ${hitList} 형태로 혼용되고 있습니다.`,
            groupKey: `glossary-${term.id}`,
            location: createLocation(document, 0, 0, tokenStart, tokenStart + term.standard.length),
            suggestions: [
              buildSuggestion(
                term.standard,
                `도서 기준 표준 용어는 \`${term.standard}\`입니다.`,
                "용어집",
                0.98
              )
            ]
          })
        );
      }
    }
  });

  const reviewed = document.issues.filter((issue) => issue.reviewStatus !== "pending");
  const carryOver = reviewed.map((issue) => ({
    ...issue,
    suggestions: issue.suggestions
  }));

  return [...carryOver, ...issues];
}
