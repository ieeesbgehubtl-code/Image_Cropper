export function History() {
  return (
    <section className="glass p-8 dark:text-white">
      <h2 className="text-3xl font-bold">Processing History</h2>
      <p className="mt-4">
        Current-session results appear on the Home page after processing. Files
        remain downloadable until cleanup or backend restart cleanup policy is
        applied.
      </p>
    </section>
  );
}
