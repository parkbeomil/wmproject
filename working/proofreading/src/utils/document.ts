import type { DocumentSection } from "@/types/document";
import { createId } from "@/lib/id";

function isHeading(line: string) {
  return /^#{1,3}\s+/.test(line) || /^\d+(\.\d+)*\.\s+/.test(line.trim());
}

function stripHeadingMarker(line: string) {
  return line.replace(/^#{1,3}\s+/, "").trim();
}

export function splitIntoSections(text: string): DocumentSection[] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd());

  const sections: DocumentSection[] = [];
  let current: DocumentSection = {
    id: createId("section"),
    heading: "문서 서두",
    level: 1,
    paragraphs: []
  };

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    if (isHeading(line)) {
      if (current.paragraphs.length > 0 || current.heading !== "문서 서두") {
        sections.push(current);
      }

      current = {
        id: createId("section"),
        heading: stripHeadingMarker(line),
        level: line.startsWith("##") ? 2 : 1,
        paragraphs: []
      };
      continue;
    }

    current.paragraphs.push(line.trim());
  }

  if (current.paragraphs.length > 0 || current.heading !== "문서 서두") {
    sections.push(current);
  }

  return sections;
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
