import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(45,212,191,0.16),_transparent_28%),linear-gradient(180deg,_#fffdf8_0%,_#fff7ed_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">{children}</div>
    </div>
  );
}
