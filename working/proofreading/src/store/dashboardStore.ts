import { create } from "zustand";

interface DashboardStore {
  selectedDocumentId: string | null;
  reviewerName: string;
  setSelectedDocumentId: (documentId: string | null) => void;
  setReviewerName: (reviewerName: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  selectedDocumentId: "doc-seed-1",
  reviewerName: "편집자 김",
  setSelectedDocumentId: (selectedDocumentId) => set({ selectedDocumentId }),
  setReviewerName: (reviewerName) => set({ reviewerName })
}));
