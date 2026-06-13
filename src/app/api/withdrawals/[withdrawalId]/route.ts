import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Keep a simple in-memory request counter for simulating the PayOS polling states
const pollCounters: Record<string, number> = {};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ withdrawalId: string }> }
) {
  const { withdrawalId } = await params;

  if (!pollCounters[withdrawalId]) {
    pollCounters[withdrawalId] = 0;
  }

  pollCounters[withdrawalId] += 1;
  const count = pollCounters[withdrawalId];

  // Parse the query parameters to echo them back in the polling response
  const { searchParams } = new URL(request.url);
  const amount = Number(searchParams.get("amount") || "500000");
  const bankName = searchParams.get("bankName") || "Vietcombank";
  const accountNumber = searchParams.get("accountNumber") || "1234567890";

  // Simulate pending status for the first 2 ticks, then return SUCCESS on the 3rd tick
  const status = count >= 3 ? "SUCCESS" : "PROCESSING";

  return NextResponse.json({
    withdrawalId,
    amount,
    toBankName: bankName,
    toAccountNumber: accountNumber,
    status,
  });
}
