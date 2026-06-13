import Link from "next/link";

interface ResultPageProps {
  params: {
    withdrawalId: string;
  };
  searchParams: {
    status?: "success" | "failed";
    amount?: string;
    bankName?: string;
    accountNumber?: string;
  };
}

export const metadata = {
  title: "Transaction Result — ToyStore",
};

function formatVND(value: number): string {
  return value.toLocaleString("vi-VN") + " ₫";
}

function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return "";
  const cleaned = accountNumber.trim();
  if (cleaned.length <= 4) return cleaned;
  return cleaned.slice(-4);
}

export default function WithdrawalResultPage({
  params,
  searchParams,
}: ResultPageProps) {
  const status = searchParams.status || "success";
  const amount = Number(searchParams.amount || "0");
  const bankName = searchParams.bankName || "";
  const accountNumber = searchParams.accountNumber || "";
  const last4 = maskAccountNumber(accountNumber);

  const isSuccess = status === "success";

  return (
    <main className="flex-grow flex flex-col items-center justify-center py-16 px-4 bg-slate-50 min-h-[70vh]">
      <div className="bg-white w-full max-w-xl rounded-xl p-8 shadow-sm border border-slate-200 text-center flex flex-col items-center mx-auto animate-in fade-in duration-200">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[#dcfce7] flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[#16a34a]" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Withdrawal Successful!</h1>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Your withdrawal request has been processed successfully.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 border border-red-100">
              <span className="material-symbols-outlined text-red-500" style={{ fontSize: "32px" }}>
                cancel
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Withdrawal Failed</h1>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Your withdrawal transaction was unsuccessful. Please contact support or try again later.
            </p>
          </>
        )}

        {/* Details card */}
        <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-200 text-left w-full max-w-md space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Transaction ID:</span>
            <span className="font-semibold text-slate-800 font-mono">{params.withdrawalId}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Withdraw Amount:</span>
            <span className="font-bold text-[#ff4f00]">{formatVND(amount)}</span>
          </div>
          {bankName && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Recipient Account:</span>
              <span className="font-semibold text-slate-800">
                {bankName} {last4 ? `(***${last4})` : ""}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Status:</span>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {isSuccess ? "Success" : "Failed"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center w-full max-w-md">
          <Link
            href="/profile/wallet"
            className="flex-1 px-6 py-3 bg-[#ff4f00] hover:bg-[#e64700] text-white font-semibold rounded-xl transition-colors shadow-sm text-sm text-center"
          >
            Back to Wallet
          </Link>
        </div>
      </div>
    </main>
  );
}
