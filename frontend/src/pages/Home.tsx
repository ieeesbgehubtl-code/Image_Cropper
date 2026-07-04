import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2, Palette, Play, ShieldCheck, Sparkles, Trash2, Wand2 } from "lucide-react";
import { UploadCard } from "../components/UploadCard";
import { ResultGallery } from "../components/ResultGallery";
import { useProcessing } from "../hooks/useProcessing";
export function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [bg, setBg] = useState("#FFFFFF");
  const mutation = useProcessing(bg);
  const started = useMemo(() => Date.now(), [mutation.isPending]);
  async function run() {
    if (!files.length) return toast.error("Add at least one file");
    try {
      await mutation.mutateAsync(files);
      toast.success("Processing complete");
    } catch (e) {
      toast.error("Processing failed");
    }
  }
  return (
    <>
      <section className="glass overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200">
              <Sparkles className="h-4 w-4" /> Clean AI passport workflow
            </div>
            <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
              Create polished passport photos in one click.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Upload portraits or a ZIP, choose a background color, and let the app detect, remove, crop, resize, and export compliant 413 × 531 JPEG results locally.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <label className="btn-secondary cursor-pointer">
                <Palette className="h-5 w-5" />
                <span>Background</span>
                <input
                  className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  type="color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  aria-label="Background color"
                />
              </label>
              <button className="btn" disabled={mutation.isPending} onClick={run}>
                {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                Generate photos
              </button>
              <button className="btn-secondary" onClick={() => setFiles([])}>
                <Trash2 className="h-5 w-5" />
                Clear
              </button>
            </div>
            {mutation.isPending && (
              <p className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">
                Processing {files.length} file(s). Elapsed {Math.round((Date.now() - started) / 1000)}s. Refresh the page to cancel before completion.
              </p>
            )}
          </div>
          <div className="soft-card p-5">
            <div className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 to-blue-950 p-6 text-white shadow-2xl shadow-blue-950/20">
              <Wand2 className="mb-12 h-10 w-10 text-blue-200" />
              <div className="space-y-4">
                {["Largest face detection", "RMBG-2.0 background removal", "Compliant JPEG export"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm text-blue-100">
                <ShieldCheck className="h-4 w-4" /> Runs against your local backend
              </div>
            </div>
          </div>
        </div>
      </section>
      <UploadCard files={files} setFiles={setFiles} />
      <ResultGallery data={mutation.data} />
    </>
  );
}
