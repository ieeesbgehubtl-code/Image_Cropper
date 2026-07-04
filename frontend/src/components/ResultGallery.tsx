import { Download } from "lucide-react";
import { downloadUrl } from "../services/api";
import type { BatchResponse } from "../types/api";
export function ResultGallery({ data }: { data?: BatchResponse }) {
  if (!data) return null;
  return (
    <section className="glass p-6">
      <h2 className="text-2xl font-bold dark:text-white">Results</h2>
      <div className="my-4 grid grid-cols-3 gap-3">
        <Stat k="Total" v={data.total} />
        <Stat k="Success" v={data.succeeded} />
        <Stat k="Failed" v={data.failed} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.results.map((r) => (
          <article
            className="rounded-2xl bg-white/70 p-4 dark:bg-slate-800"
            key={r.original_filename}
          >
            <h3 className="font-semibold dark:text-white">
              {r.original_filename}
            </h3>
            <p className={r.success ? "text-green-600" : "text-red-500"}>
              {r.message}
            </p>
            {r.success && (
              <>
                <img
                  className="my-3 rounded-xl"
                  src={downloadUrl(r.download_url)}
                />
                <a className="btn w-full" href={downloadUrl(r.download_url)}>
                  <Download />
                  Download
                </a>
              </>
            )}
          </article>
        ))}
      </div>
      {data.zip_download_url && (
        <a className="btn mt-5" href={downloadUrl(data.zip_download_url)}>
          <Download />
          Download all ZIP
        </a>
      )}
    </section>
  );
}
function Stat({ k, v }: { k: string; v: number }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4 text-center dark:bg-slate-800">
      <b className="block text-2xl dark:text-white">{v}</b>
      <span className="text-slate-500">{k}</span>
    </div>
  );
}
