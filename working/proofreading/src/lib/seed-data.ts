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

export const seedDocuments: DocumentRecord[] = [
  {
    id: "doc-seed-1",
    bookTitle: "중학 수학 개념서",
    chapterTitle: "3-1 이차방정식",
    format: "txt",
    version: 3,
    status: "ready",
    uploadedAt: "2026-04-16T08:30:00.000Z",
    text: [
      "# 1. 이차방정식의 풀이",
      "2차방정식은 ax²+bx+c=0 꼴의 방정식이다.",
      "학생들은 2 차 방정식의 근을 구할 수 있어야한다.",
      "답을 구할때 단위를 빠뜨리지 않도록 한다.",
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
    reportReadyAt: "2026-04-16T09:00:00.000Z"
  }
];
