import { MarketsTable } from "@/components/markets/MarketsTable";

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-3 py-4 md:px-6 md:py-6">
        <MarketsTable />
      </div>
    </main>
  );
}
