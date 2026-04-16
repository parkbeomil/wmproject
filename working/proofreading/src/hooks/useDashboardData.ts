"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type {
  DashboardData,
  DocumentRecord,
  GlossaryTerm,
  ReviewDecision
} from "@/types/document";

const DASHBOARD_QUERY_KEY = ["dashboard-data"];

export function useDashboardData(initialData?: DashboardData) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => apiFetch<DashboardData>("/api/documents"),
    initialData
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      bookTitle: string;
      chapterTitle: string;
      format: "docx" | "hwp" | "txt";
      text?: string;
      fileName?: string;
      fileBase64?: string;
    }) =>
      apiFetch<DocumentRecord>("/api/documents", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: (document) => {
      queryClient.setQueryData<DashboardData | undefined>(DASHBOARD_QUERY_KEY, (current) => {
        if (!current) {
          return current;
        }

        const documents = [document, ...current.documents];
        return {
          ...current,
          documents,
          metrics: {
            ...current.metrics,
            totalDocuments: documents.length
          }
        };
      });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    }
  });
}

export function useRunAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) =>
      apiFetch<DocumentRecord>(`/api/documents/${documentId}/analyze`, {
        method: "POST",
        body: JSON.stringify({})
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    }
  });
}

export function useReviewIssue(documentId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewDecision & { documentId: string }) =>
      apiFetch(`/api/documents/${payload.documentId}/review`, {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      if (documentId) {
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      }
    }
  });
}

export function useAddGlossaryTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<GlossaryTerm, "id">) =>
      apiFetch<GlossaryTerm>("/api/glossary", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    }
  });
}
