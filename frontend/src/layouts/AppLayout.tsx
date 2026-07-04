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
    <>
      <Navbar page={page} setPage={setPage} />
      <main className="mx-auto max-w-6xl space-y-6 p-4">{children}</main>
      <footer className="p-8 text-center text-slate-600 dark:text-slate-300">
        Offline-first local passport photo generation.
      </footer>
    </>
  );
}
