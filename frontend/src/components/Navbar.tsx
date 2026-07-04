import { Camera, History, Info, Settings, SunMoon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
export function Navbar({
  page,
  setPage,
}: {
  page: string;
  setPage: (p: string) => void;
}) {
  const { toggle } = useTheme();
  const items = [
    ["home", Camera],
    ["about", Info],
    ["settings", Settings],
    ["history", History],
  ] as const;
  return (
    <nav className="sticky top-4 z-20 mx-auto mt-4 flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-white/70 bg-white/85 px-5 py-4 shadow-xl shadow-slate-200/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/75 dark:shadow-black/30">
      <button
        onClick={() => setPage("home")}
        className="flex items-center gap-3 text-left"
        aria-label="Go to home"
      >
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
          <Camera className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-lg font-black tracking-tight text-slate-950 dark:text-white">
            Passport Studio
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            AI photo cropper
          </span>
        </span>
      </button>
      <div className="flex flex-wrap items-center gap-2">
        {items.map(([id, Icon]) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-semibold capitalize transition ${
              page === id
                ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-950"
                : "text-slate-600 hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" /> {id}
          </button>
        ))}
        <button
          onClick={toggle}
          className="grid h-10 w-10 place-items-center rounded-2xl text-slate-600 transition hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Toggle theme"
        >
          <SunMoon className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}
