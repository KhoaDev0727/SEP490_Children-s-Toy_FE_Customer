import ProcessingCard from "./_components/ProcessingCard";

interface ProcessingPageProps {
  params: Promise<{
    withdrawalId: string;
  }>;
  searchParams: Promise<{
    amount?: string;
    bankName?: string;
    accountNumber?: string;
  }>;
}

export const metadata = {
  title: "Processing Transaction — ToyStore",
};

export default async function WithdrawalProcessingPage({
  params,
  searchParams,
}: ProcessingPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const initialAmount = resolvedSearchParams.amount
    ? Number(resolvedSearchParams.amount)
    : undefined;

  return (
    <main className="flex-grow flex flex-col items-center justify-center py-16 px-4 bg-slate-50 min-h-[70vh]">
      <ProcessingCard
        withdrawalId={resolvedParams.withdrawalId}
        initialAmount={initialAmount}
        initialBankName={resolvedSearchParams.bankName}
        initialAccountNumber={resolvedSearchParams.accountNumber}
      />
    </main>
  );
}
