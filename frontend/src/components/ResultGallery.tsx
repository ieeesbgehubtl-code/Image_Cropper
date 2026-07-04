import { useMemo, useState } from "react";
import { Download, Pencil } from "lucide-react";
import {
  downloadUrl,
  downloadUrlWithFilename,
  downloadZipUrlWithFilenames,
} from "../services/api";
import type { BatchResponse } from "../types/api";

const invalidFilenameChars = /[<>:"/\\|?*\x00-\x1F]/g;

function defaultDownloadName(original: string, output?: string) {
  const fallback = output || original || "passport_photo.jpg";
  const base = fallback.replace(/\.[^.]+$/, "");
  return `${base || "passport_photo"}.jpg`;
}

function normalizeDownloadName(value: string) {
  const cleaned = value.trim().replace(invalidFilenameChars, "_");
  const withoutExtension = cleaned.replace(/\.[^.]+$/, "");
  return `${withoutExtension || "passport_photo"}.jpg`;
}

export function ResultGallery({ data }: { data?: BatchResponse }) {
  const [filenames, setFilenames] = useState<Record<string, string>>({});
  const defaultNames = useMemo(() => {
    if (!data) return {};
    return Object.fromEntries(
      data.results
        .filter((r) => r.success && r.output_filename)
        .map((r) => [
          r.output_filename!,
          defaultDownloadName(r.original_filename, r.output_filename),
        ]),
    );
  }, [data]);

  if (!data) return null;

  const zipFilenames = Object.fromEntries(
    data.results
      .filter((r) => r.success && r.output_filename)
      .map((r) => {
        const key = r.output_filename!;
        return [key, normalizeDownloadName(filenames[key] ?? defaultNames[key])];
      }),
  );

  return (
    <section className="glass p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">Output</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Generated results</h2>
        </div>
        {data.zip_download_url && (
          <a className="btn" href={downloadZipUrlWithFilenames(data.zip_download_url, zipFilenames)}>
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
        {data.results.map((r) => {
          const filenameKey = r.output_filename ?? r.original_filename;
          const editedName = filenames[filenameKey] ?? defaultNames[filenameKey] ?? "passport_photo.jpg";
          const downloadName = normalizeDownloadName(editedName);
          return (
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
                  <label className="mb-3 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <span className="mb-1 flex items-center gap-2">
                      <Pencil className="h-4 w-4" /> Download filename
                    </span>
                    <input
                      className="input w-full"
                      value={editedName}
                      onChange={(event) =>
                        setFilenames((current) => ({
                          ...current,
                          [filenameKey]: event.target.value,
                        }))
                      }
                      onBlur={() =>
                        setFilenames((current) => ({
                          ...current,
                          [filenameKey]: downloadName,
                        }))
                      }
                      placeholder="passport_photo.jpg"
                    />
                  </label>
                  <a
                    className="btn w-full"
                    href={downloadUrlWithFilename(r.download_url, downloadName)}
                    download={downloadName}
                  >
                    <Download className="h-5 w-5" />
                    Download as {downloadName}
                  </a>
                </>
              )}
            </article>
          );
        })}
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
