import { createId } from "@/lib/id";
import type { ExternalEvidence } from "@/types/document";

interface KtermItem {
  word: string;
  definition: string;
  category_main: string;
  category_sub: string;
  glossary: string;
}

interface KornormItem {
  korean_mark: string;
  roman_mark: string;
  relate_mark_o: string;
  regltn_path: string;
}

interface ExternalLookupResult {
  evidences: ExternalEvidence[];
  notes: string[];
}

export async function searchKterm(term: string): Promise<ExternalLookupResult> {
  const key = process.env.ONTERM_API_KEY;

  if (!key) {
    return { evidences: [], notes: ["온용어 API 키가 설정되지 않았습니다."] };
  }

  const params = new URLSearchParams({
    key,
    apiSearchWord: term,
    num: "3"
  });

  const response = await fetch(`https://kli.korean.go.kr/term/api/search.do?${params.toString()}`, {
    cache: "no-store"
  });
  const payload = (await response.json()) as {
    channel?: { return_object?: Array<{ resultlist?: KtermItem[] }> };
  };

  const items = payload.channel?.return_object?.[0]?.resultlist ?? [];

  return {
    evidences: items.map((item) => ({
      id: createId("evidence"),
      source: "kterm",
      title: item.word.replace(/\^/g, ""),
      description: `${item.category_main} > ${item.category_sub} 용어집(${item.glossary}) 기준 용어입니다.${item.definition ? ` ${item.definition}` : ""}`,
      status: "supported",
      link: "https://kli.korean.go.kr/term/main.do"
    })),
    notes: []
  };
}

export async function searchKornorm(term: string): Promise<ExternalLookupResult> {
  const key = process.env.KORNORM_API_KEY;

  if (!key) {
    return { evidences: [], notes: ["한국어 어문 규범 API 키가 설정되지 않았습니다."] };
  }

  const params = new URLSearchParams({
    serviceKey: key,
    pageNo: "1",
    numOfRows: "3",
    langType: "0004",
    resultType: "json",
    searchCondition: "relate_mark_o",
    searchEquals: "like",
    searchKeyword: term
  });

  const response = await fetch(`https://korean.go.kr/kornorms/exampleReqList.do?${params.toString()}`, {
    cache: "no-store"
  });
  const payload = (await response.json()) as {
    response?: { items?: KornormItem[] };
  };

  const items = payload.response?.items ?? [];

  return {
    evidences: items.map((item) => ({
      id: createId("evidence"),
      source: "kornorm",
      title: `${term} -> ${item.roman_mark}`,
      description: `${item.korean_mark}의 로마자 표기는 ${item.roman_mark}입니다. 오표기 예시: ${item.relate_mark_o}`,
      status: "supported",
      link: `https://www.korean.go.kr/kornorms/regltn/regltnView.do`
    })),
    notes: []
  };
}

export async function searchStdict(term: string): Promise<ExternalLookupResult> {
  const key = process.env.STDICT_API_KEY;

  if (!key) {
    return { evidences: [], notes: ["표준국어대사전 API 키가 설정되지 않았습니다."] };
  }

  const params = new URLSearchParams({
    key,
    q: term,
    req_type: "json",
    num: "3"
  });

  const response = await fetch(`https://stdict.korean.go.kr/api/search.do?${params.toString()}`, {
    cache: "no-store"
  });
  const raw = await response.text();

  if (raw.includes("시스템 오류") || raw.includes("<html")) {
    return {
      evidences: [],
      notes: ["표준국어대사전 API가 현재 정상 응답을 주지 않아 이번 분석에서는 제외했습니다."]
    };
  }

  return { evidences: [], notes: [] };
}
