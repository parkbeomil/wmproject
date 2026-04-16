import { searchKornorm, searchKterm, searchStdict } from "@/lib/externalApis";
import { createId } from "@/lib/id";
import type {
  DocumentLocation,
  DocumentRecord,
  ExternalEvidence,
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
  evidences?: ExternalEvidence[];
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
    evidences: params.evidences ?? [],
    reviewStatus: "pending"
  };
}

function findIndex(haystack: string, needle: string) {
  const index = haystack.indexOf(needle);
  return index >= 0 ? index : 0;
}

function createIssueKey(issue: Issue) {
  return `${issue.groupKey}:${issue.location.sectionId}:${issue.location.paragraphIndex}:${issue.excerpt}`;
}

function collectLatinTokens(document: DocumentRecord) {
  const tokens = new Set<string>();

  document.sections.forEach((section) => {
    section.paragraphs.forEach((paragraph) => {
      const matches = paragraph.match(/\b[A-Za-z][A-Za-z-]{2,}\b/g) ?? [];
      matches.forEach((token) => tokens.add(token));
    });
  });

  return [...tokens].slice(0, 5);
}

function findParagraphPosition(document: DocumentRecord, predicate: (paragraph: string) => boolean) {
  for (let sectionIndex = 0; sectionIndex < document.sections.length; sectionIndex += 1) {
    const section = document.sections[sectionIndex];

    for (let paragraphIndex = 0; paragraphIndex < section.paragraphs.length; paragraphIndex += 1) {
      const paragraph = section.paragraphs[paragraphIndex];

      if (predicate(paragraph)) {
        return { sectionIndex, paragraphIndex, paragraph };
      }
    }
  }

  return null;
}

export async function analyzeDocument(document: DocumentRecord, glossaryTerms: GlossaryTerm[]) {
  const issues: Issue[] = [];
  const analysisNotes: string[] = [];

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

  for (const term of glossaryTerms) {
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

    const paragraphPosition = findParagraphPosition(document, (line) =>
      variants.some((variant) => line.includes(variant))
    );
    const paragraph = paragraphPosition?.paragraph;

    const bannedHit = term.bannedVariants.find((variant) =>
      document.sections.some((section) => section.paragraphs.some((paragraphLine) => paragraphLine.includes(variant)))
    );

    if ((!paragraph || hits.size <= 1) && !bannedHit) {
      continue;
    }

    const tokenStart = variants.map((variant) => paragraph?.indexOf(variant) ?? -1).find((index) => index >= 0) ?? 0;
    const ktermResult = await searchKterm(term.standard);
    const stdictResult = await searchStdict(term.standard);
    analysisNotes.push(...ktermResult.notes, ...stdictResult.notes);

    issues.push(
      buildIssue({
        category: "glossary",
        severity: "high",
        title: bannedHit ? "금지 용어 표기 사용" : "용어 표기 일관성 불일치",
        excerpt: paragraph ?? term.standard,
        rationale: bannedHit
          ? `금지 표기 \`${bannedHit}\`가 사용되었습니다. 표준 용어 \`${term.standard}\`로 통일해야 합니다.`
          : `같은 개념이 ${[...hits].join(", ")} 형태로 혼용되고 있습니다.`,
        groupKey: `glossary-${term.id}`,
        location: createLocation(
          document,
          paragraphPosition?.sectionIndex ?? 0,
          paragraphPosition?.paragraphIndex ?? 0,
          tokenStart,
          tokenStart + term.standard.length
        ),
        suggestions: [
          buildSuggestion(term.standard, `도서 기준 표준 용어는 \`${term.standard}\`입니다.`, "용어집", 0.98)
        ],
        evidences: ktermResult.evidences
      })
    );
  }

  for (const token of collectLatinTokens(document)) {
    const kornormResult = await searchKornorm(token);
    analysisNotes.push(...kornormResult.notes);

    if (kornormResult.evidences.length === 0) {
      continue;
    }

    const paragraphPosition = findParagraphPosition(document, (line) => line.includes(token));
    const paragraph = paragraphPosition?.paragraph;

    if (!paragraph) {
      continue;
    }

    const tokenStart = paragraph.indexOf(token);
    issues.push(
      buildIssue({
        category: "romanization",
        severity: "medium",
        title: "로마자 표기 기준 점검",
        excerpt: paragraph,
        rationale: `어문 규범 용례에서 \`${token}\`은(는) 오표기로 확인되었습니다.`,
        groupKey: `romanization-${token}`,
        location: createLocation(
          document,
          paragraphPosition?.sectionIndex ?? 0,
          paragraphPosition?.paragraphIndex ?? 0,
          tokenStart,
          tokenStart + token.length
        ),
        suggestions: kornormResult.evidences.map((evidence) =>
          buildSuggestion(
            evidence.title.split(" -> ")[1] ?? token,
            "한국어 어문 규범의 로마자 용례를 기준으로 수정합니다.",
            "한국어 어문 규범 Open API",
            0.94
          )
        ),
        evidences: kornormResult.evidences
      })
    );
  }

  const previousDecisions = new Map(
    document.issues
      .filter((issue) => issue.reviewStatus !== "pending")
      .map((issue) => [createIssueKey(issue), issue] as const)
  );

  const mergedIssues = issues.map((issue) => {
    const previous = previousDecisions.get(createIssueKey(issue));
    if (!previous) {
      return issue;
    }

    return {
      ...issue,
      reviewStatus: previous.reviewStatus,
      reviewedAt: previous.reviewedAt,
      reviewedBy: previous.reviewedBy,
      reviewMemo: previous.reviewMemo
    };
  });

  return {
    issues: mergedIssues,
    analysisNotes: [...new Set(analysisNotes)]
  };
}
