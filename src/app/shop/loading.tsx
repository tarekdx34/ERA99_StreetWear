export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-[#080808] px-4 pb-24 pt-24 text-[#F0EDE8] md:px-8 md:pt-28">
      <section className="mx-auto max-w-[1480px]">
        <div className="h-16 w-40 animate-pulse bg-[#111111]" />
        <div className="mt-4 h-px w-full bg-[#F0EDE8]/15" />
        <div className="mt-4 h-13 w-full border-[0.5px] border-[#F0EDE8]/25 bg-[#0D0D0D]" />

        <div className="mt-6 grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden h-screen border-[0.5px] border-[#F0EDE8]/15 bg-[#0D0D0D] p-4 md:block">
            <div className="space-y-4">
              <div className="h-3 w-20 bg-[#111111]" />
              <div className="h-8 w-full bg-[#111111]" />
              <div className="h-px w-full bg-[#F0EDE8]/15" />
              <div className="h-8 w-full bg-[#111111]" />
            </div>
          </aside>

          <div className="grid grid-cols-2 gap-px bg-[#F0EDE8]/20 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-[#080808]">
                <div className="relative aspect-3/4 bg-[#111111]" />
                <div className="space-y-2 py-3">
                  <div className="h-3 w-3/4 bg-[#111111]" />
                  <div className="h-3 w-1/2 bg-[#111111]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
