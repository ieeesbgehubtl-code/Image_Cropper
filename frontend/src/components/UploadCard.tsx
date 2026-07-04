import { useDropzone } from "react-dropzone";
import { FileArchive, ImagePlus, UploadCloud, X } from "lucide-react";
export function UploadCard({
  files,
  setFiles,
}: {
  files: File[];
  setFiles: (f: File[]) => void;
}) {
  const dz = useDropzone({
    onDrop: (a) => setFiles([...files, ...a]),
    multiple: true,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"],
      "application/zip": [".zip"],
    },
  });
  return (
    <section className="glass p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">Upload</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Add portraits or a ZIP file</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {files.length} selected
        </span>
      </div>
      <div
        {...dz.getRootProps()}
        className={`group cursor-pointer rounded-[2rem] border-2 border-dashed p-10 text-center transition duration-200 ${
          dz.isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
            : "border-blue-200 bg-gradient-to-br from-white/80 to-blue-50/70 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-400/30 dark:from-white/5 dark:to-blue-500/10"
        }`}
      >
        <input {...dz.getInputProps()} />
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/25 transition group-hover:-translate-y-1">
          <UploadCloud className="h-10 w-10" />
        </div>
        <h2 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
          Drag & drop photos or ZIP
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-slate-600 dark:text-slate-300">
          Browse images, HEIC files, or a compressed folder. We will generate clean 413 × 531 JPEG passport photos.
        </p>
      </div>
      {files.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f, i) => (
            <div className="soft-card flex items-center justify-between gap-3 p-3" key={f.name + i}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-200">
                  {f.name.toLowerCase().endsWith(".zip") ? <FileArchive className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{f.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                onClick={() => setFiles(files.filter((_, n) => n !== i))}
                aria-label={`Remove ${f.name}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
