import { TransactionHistory } from "@/components/history/TransactionHistory";
import { SwapCard } from "@/components/swap/SwapCard";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getSearchParam(param?: string | string[]) {
  if (Array.isArray(param)) return param[0];
  return param;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const input = getSearchParam(resolvedSearchParams.input);
  const output = getSearchParam(resolvedSearchParams.output);

  const initialPair = input && output ? { input, output } : null;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-lg px-4 pt-8 md:pt-12">
        <SwapCard initialPair={initialPair} />
        <div className="mt-6">
          <TransactionHistory />
        </div>
      </div>
    </main>
  );
}

