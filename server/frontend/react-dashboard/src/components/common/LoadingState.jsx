export default function LoadingState() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-canvas px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-6" aria-label="대시보드 로딩 중">
        <div className="h-16 rounded-2xl bg-slate-200" />
        <div className="h-52 rounded-3xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-32 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    </main>
  );
}
