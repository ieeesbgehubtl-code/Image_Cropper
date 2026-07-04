import type { ReactNode } from "react";
import { Navbar } from "../components/Navbar";
export function AppLayout({
  page,
  setPage,
  children,
}: {
  page: string;
  setPage: (p: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-8">
      <div className="pointer-events-none absolute left-10 top-28 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 right-10 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
      <Navbar page={page} setPage={setPage} />
      <main className="relative mx-auto mt-6 max-w-6xl space-y-6">{children}</main>
      <footer className="relative mx-auto max-w-6xl px-4 py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
        Offline-first local passport photo generation with a polished, private workflow.
      </footer>
    </div>
  );
}
