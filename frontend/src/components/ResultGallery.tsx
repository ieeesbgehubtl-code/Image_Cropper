import { Download } from "lucide-react";
import { downloadUrl } from "../services/api";
import type { BatchResponse } from "../types/api";
export function ResultGallery({ data }: { data?: BatchResponse }) {
  if (!data) return null;
  return (
    <section className="glass p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">Output</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Generated results</h2>
        </div>
        {data.zip_download_url && (
          <a className="btn" href={downloadUrl(data.zip_download_url)}>
            <Download className="h-5 w-5" />
            Download all ZIP
          </a>
        )}
      </div>
      <div className="my-5 grid grid-cols-3 gap-3">
        <Stat k="Total" v={data.total} />
        <Stat k="Success" v={data.succeeded} />
        <Stat k="Failed" v={data.failed} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.results.map((r) => (
          <article className="soft-card overflow-hidden p-4" key={r.original_filename}>
            <h3 className="truncate font-bold text-slate-950 dark:text-white">{r.original_filename}</h3>
            <p className={`mt-1 text-sm font-semibold ${r.success ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>
              {r.message}
            </p>
            {r.success && (
              <>
                <div className="my-4 rounded-2xl bg-slate-100 p-3 dark:bg-slate-950/60">
                  <img className="mx-auto max-h-72 rounded-xl shadow-lg" src={downloadUrl(r.download_url)} alt={`Generated result for ${r.original_filename}`} />
                </div>
                <a className="btn w-full" href={downloadUrl(r.download_url)}>
                  <Download className="h-5 w-5" />
                  Download
                </a>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
function Stat({ k, v }: { k: string; v: number }) {
  return (
    <div className="soft-card p-4 text-center">
      <b className="block text-3xl font-black text-slate-950 dark:text-white">{v}</b>
      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{k}</span>
    </div>
  );
}
