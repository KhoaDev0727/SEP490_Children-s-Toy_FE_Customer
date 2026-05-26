"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProfileSidebar from "../_components/ProfileSidebar";
import { walletApi } from "@/features/wallet/services/wallet-api";
import {
  changeWalletPinSchema,
  createSePayTopUpQrSchema,
  createWalletSchema,
  resetForgotWalletPinSchema,
  verifyForgotWalletPinOtpSchema,
  verifyWalletPinSchema,
} from "@/features/wallet/types/wallet.schema";
import type {
  ApiErrorResponse,
  WalletDto,
} from "@/features/wallet/types/wallet";
import WalletActivationState from "./_components/WalletActivationState";
import WalletOverview from "./_components/WalletOverview";
import WalletPinModal from "./_components/WalletPinModal";
import WalletTopUpSePayPanel from "./_components/WalletTopUpSePayPanel";
import {
  DEFAULT_PIN_VISIBILITY,
  getValidationErrorMessage,
  mapWalletTransactionToUi,
  type PinModalMode,
  type PinVisibilityField,
  type UiTransaction,
} from "./_components/wallet-shared";

const TOP_UP_QUICK_AMOUNTS = [
  2000, 20000, 50000, 100000, 200000, 500000,
] as const;
const DEFAULT_TOP_UP_AMOUNT = TOP_UP_QUICK_AMOUNTS[0];
const TRANSACTION_HISTORY_PAGE_SIZE = 10;
const SEP_BANK_NAME = process.env.NEXT_PUBLIC_SEPAY_BANK_NAME ?? "SePay";
const SEP_BANK_CODE = process.env.NEXT_PUBLIC_SEPAY_BANK_CODE ?? "";
const SEP_ACCOUNT_NUMBER = process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NUMBER ?? "";
const SEP_ACCOUNT_NAME = process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NAME ?? "";

function getApiError(error: unknown) {
  const err = error as {
    response?: { status?: number; data?: ApiErrorResponse };
  };
  return {
    status: err?.response?.status,
    code: err?.response?.data?.code ?? err?.response?.data?.Code,
    message: err?.response?.data?.message ?? err?.response?.data?.Message,
  };
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletDto | null>(null);
  const [transactions, setTransactions] = useState<UiTransaction[]>([]);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [transactionPageNumber, setTransactionPageNumber] = useState(1);
  const [transactionTotalPages, setTransactionTotalPages] = useState(1);
  const [transactionTotalCount, setTransactionTotalCount] = useState(0);
  const [hasPreviousTransactionPage, setHasPreviousTransactionPage] =
    useState(false);
  const [hasNextTransactionPage, setHasNextTransactionPage] = useState(false);

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<PinModalMode>("activate");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [newChangePin, setNewChangePin] = useState("");
  const [confirmChangePin, setConfirmChangePin] = useState("");
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const [isSendingForgotOtp, setIsSendingForgotOtp] = useState(false);
  const [isForgotPinFlow, setIsForgotPinFlow] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [pinVisibility, setPinVisibility] = useState<
    Record<PinVisibilityField, boolean>
  >(() => ({ ...DEFAULT_PIN_VISIBILITY }));
  const [isTopUpPanelOpen, setIsTopUpPanelOpen] = useState(false);
  const [topUpToken, setTopUpToken] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(DEFAULT_TOP_UP_AMOUNT);
  const [topUpAttemptCode, setTopUpAttemptCode] = useState("");
  const [topUpQrImageUrl, setTopUpQrImageUrl] = useState("");
  const [topUpStatus, setTopUpStatus] = useState("PENDING");
  const [isCreatingTopUpQr, setIsCreatingTopUpQr] = useState(false);
  const [isCheckingTopUpStatus, setIsCheckingTopUpStatus] = useState(false);

  const isWalletActivated = wallet !== null;
  const currentBalance = wallet?.balance ?? 0;

  const totalCredit = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions],
  );

  const loadTransactionPage = useCallback(async (pageNumber: number) => {
    setIsTransactionsLoading(true);
    try {
      const transactionResponse = await walletApi.getTransactions(
        pageNumber,
        TRANSACTION_HISTORY_PAGE_SIZE,
      );
      setTransactions(transactionResponse.items.map(mapWalletTransactionToUi));
      setTransactionPageNumber(transactionResponse.pageNumber);
      setTransactionTotalPages(transactionResponse.totalPages || 1);
      setTransactionTotalCount(transactionResponse.totalCount);
      setHasPreviousTransactionPage(transactionResponse.hasPreviousPage);
      setHasNextTransactionPage(transactionResponse.hasNextPage);
    } catch (transactionError) {
      const transactionApiError = getApiError(transactionError);
      setTransactions([]);
      toast.error(
        transactionApiError.message ?? "Unable to load transaction history.",
      );
    } finally {
      setIsTransactionsLoading(false);
    }
  }, []);

  const loadWalletData = useCallback(async () => {
    setIsWalletLoading(true);

    try {
      const walletResponse = await walletApi.getMyWallet();
      setWallet(walletResponse);
      await loadTransactionPage(1);
    } catch (error) {
      const apiError = getApiError(error);
      if (apiError.status === 404 || apiError.code === "NOT_FOUND") {
        setWallet(null);
        setTransactions([]);
        setTransactionPageNumber(1);
        setTransactionTotalPages(1);
        setTransactionTotalCount(0);
        setHasPreviousTransactionPage(false);
        setHasNextTransactionPage(false);
      } else {
        toast.error(apiError.message ?? "Unable to load wallet information.");
      }
    } finally {
      setIsWalletLoading(false);
    }
  }, [loadTransactionPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadWalletData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadWalletData]);

  const handleTransactionPageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > transactionTotalPages) return;
    if (nextPage === transactionPageNumber) return;
    void loadTransactionPage(nextPage);
  };

  const resetPinModalFields = () => {
    setPin("");
    setConfirmPin("");
    setOldPin("");
    setNewChangePin("");
    setConfirmChangePin("");
    setOtpCode("");
    setNewPin("");
    setConfirmNewPin("");
    setIsForgotPinFlow(false);
    setPinVisibility({ ...DEFAULT_PIN_VISIBILITY });
  };

  const openPinModal = (mode: PinModalMode) => {
    setPinModalMode(mode);
    resetPinModalFields();
    setIsPinModalOpen(true);
  };

  const closePinModal = (force = false) => {
    if (!force && (isSubmittingPin || isSendingForgotOtp || isResettingPin))
      return;
    setIsPinModalOpen(false);
    resetPinModalFields();
  };

  const togglePinVisibility = (field: PinVisibilityField) => {
    setPinVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const resetTopUpPanelState = () => {
    setIsTopUpPanelOpen(false);
    setTopUpToken(null);
    setTopUpAmount(DEFAULT_TOP_UP_AMOUNT);
    setTopUpAttemptCode("");
    setTopUpQrImageUrl("");
    setTopUpStatus("PENDING");
    setIsCreatingTopUpQr(false);
    setIsCheckingTopUpStatus(false);
  };

  const createTopUpQrForAmount = useCallback(
    async (amount: number, tokenOverride?: string) => {
      const activeTopUpToken = tokenOverride ?? topUpToken;
      if (!activeTopUpToken) {
        toast.error("Top-up session has expired. Please verify PIN again.");
        resetTopUpPanelState();
        return;
      }

      const validation = createSePayTopUpQrSchema.safeParse({
        amount,
        topUpToken: activeTopUpToken,
      });
      if (!validation.success) {
        toast.error(getValidationErrorMessage(validation.error));
        return;
      }

      setIsCreatingTopUpQr(true);
      try {
        const response = await walletApi.createSePayTopUpQr(validation.data);
        setTopUpAmount(response.amount);
        setTopUpAttemptCode(response.attemptCode);
        setTopUpQrImageUrl(response.qrImageUrl);
        setTopUpStatus("PENDING");
      } catch (error: unknown) {
        const apiError = getApiError(error);
        toast.error(apiError.message ?? "Unable to create SePay top-up QR.");
      } finally {
        setIsCreatingTopUpQr(false);
      }
    },
    [topUpToken],
  );

  const checkTopUpStatus = useCallback(async () => {
    if (!topUpAttemptCode) return false;

    setIsCheckingTopUpStatus(true);
    try {
      const statusResponse =
        await walletApi.getSePayTopUpStatus(topUpAttemptCode);
      const normalizedStatus = (
        statusResponse.status || "PENDING"
      ).toUpperCase();
      setTopUpStatus(normalizedStatus);

      if (normalizedStatus === "PAID") {
        toast.success("Top-up payment confirmed. Wallet balance updated.");
        await loadWalletData();
        resetTopUpPanelState();
        return true;
      }

      if (normalizedStatus === "FAILED") {
        toast.error(
          "Top-up payment failed. Please generate a new QR and try again.",
        );
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.message ?? "Unable to check top-up payment status.");
    } finally {
      setIsCheckingTopUpStatus(false);
    }

    return false;
  }, [loadWalletData, topUpAttemptCode]);

  const handleSubmitPinModal = async () => {
    if (pinModalMode === "changePin") {
      const changePinValidation = changeWalletPinSchema.safeParse({
        oldPin,
        newPin: newChangePin,
        confirmNewPin: confirmChangePin,
      });
      if (!changePinValidation.success) {
        toast.error(getValidationErrorMessage(changePinValidation.error));
        return;
      }

      setIsSubmittingPin(true);
      try {
        await walletApi.changePin(changePinValidation.data);
        toast.success("Wallet PIN changed successfully.");
        closePinModal();
      } catch (error: unknown) {
        const apiError = getApiError(error);
        toast.error(
          apiError.message ?? "Unable to change PIN. Please try again.",
        );
      } finally {
        setIsSubmittingPin(false);
      }
      return;
    }

    const activationValidation =
      pinModalMode === "activate"
        ? createWalletSchema.safeParse({ pin, confirmPin })
        : null;
    const topUpValidation =
      pinModalMode === "topup"
        ? verifyWalletPinSchema.safeParse({ pin, actionType: "TOP_UP" })
        : null;
    const viewBalanceValidation =
      pinModalMode === "viewBalance"
        ? verifyWalletPinSchema.safeParse({ pin, actionType: "VIEW_BALANCE" })
        : null;

    if (activationValidation && !activationValidation.success) {
      toast.error(getValidationErrorMessage(activationValidation.error));
      return;
    }

    if (topUpValidation && !topUpValidation.success) {
      toast.error(getValidationErrorMessage(topUpValidation.error));
      return;
    }

    if (viewBalanceValidation && !viewBalanceValidation.success) {
      toast.error(getValidationErrorMessage(viewBalanceValidation.error));
      return;
    }

    setIsSubmittingPin(true);
    try {
      if (pinModalMode === "activate") {
        const createdWallet = await walletApi.createWallet(
          activationValidation!.data,
        );
        setWallet(createdWallet);
        setTransactions([]);
        toast.success("Wallet activated successfully.");
      } else if (pinModalMode === "topup") {
        const verifyResponse = await walletApi.verifyPin(topUpValidation!.data);
        const newTopUpToken = verifyResponse.topUpToken;
        if (!newTopUpToken) {
          toast.error("Unable to start top-up session. Please try again.");
          return;
        }

        setTopUpToken(newTopUpToken);
        setIsTopUpPanelOpen(true);
        setTopUpAmount(DEFAULT_TOP_UP_AMOUNT);
        setTopUpAttemptCode("");
        setTopUpQrImageUrl("");
        setTopUpStatus("PENDING");
        toast.success("PIN verified. Creating top-up QR...");

        await createTopUpQrForAmount(DEFAULT_TOP_UP_AMOUNT, newTopUpToken);
      } else {
        await walletApi.verifyPin(viewBalanceValidation!.data);
        setIsBalanceVisible(true);
        toast.success("PIN verified successfully. Balance is now visible.");
      }
      closePinModal();
    } catch (error: unknown) {
      const apiError = getApiError(error);
      if (pinModalMode === "activate" && apiError.code === "CONFLICT") {
        await loadWalletData();
        toast.success(
          "You already have a wallet. Switched to wallet management mode.",
        );
        closePinModal();
        return;
      }
      toast.error(apiError.message ?? "Operation failed. Please try again.");
    } finally {
      setIsSubmittingPin(false);
    }
  };

  const handleSendForgotPinOtp = async () => {
    if (pinModalMode === "activate") return;

    setIsSendingForgotOtp(true);
    try {
      await walletApi.sendForgotPinOtp();
      setIsForgotPinFlow(true);
      setOtpCode("");
      setNewPin("");
      setConfirmNewPin("");
      toast.success("A 6-digit OTP has been sent to your email.");
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.message ?? "Unable to send OTP. Please try again.");
    } finally {
      setIsSendingForgotOtp(false);
    }
  };

  const handleResetPinWithOtp = async () => {
    const otpValidation = verifyForgotWalletPinOtpSchema.safeParse({ otpCode });
    if (!otpValidation.success) {
      toast.error(getValidationErrorMessage(otpValidation.error));
      return;
    }

    const resetValidation = resetForgotWalletPinSchema.safeParse({
      newPin,
      confirmNewPin,
    });
    if (!resetValidation.success) {
      toast.error(getValidationErrorMessage(resetValidation.error));
      return;
    }

    setIsResettingPin(true);
    try {
      await walletApi.verifyForgotPinOtp(otpValidation.data);
      await walletApi.resetForgotPin(resetValidation.data);
      toast.success("PIN reset successfully. Please use your new PIN.");
      closePinModal(true);
      await loadWalletData();
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.message ?? "Unable to reset PIN. Please try again.");
    } finally {
      setIsResettingPin(false);
    }
  };

  useEffect(() => {
    if (!isTopUpPanelOpen || !topUpAttemptCode) return;

    const timer = window.setInterval(() => {
      void checkTopUpStatus();
    }, 4000);

    return () => window.clearInterval(timer);
  }, [checkTopUpStatus, isTopUpPanelOpen, topUpAttemptCode]);

  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      <ProfileSidebar />

      <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-white">
          <h1 className="text-2xl font-bold text-[#0f172a]">My Wallet</h1>
          <p className="mt-1 text-sm text-[#475569]">
            Manage your wallet balance, PIN code, and transaction history.
          </p>
        </div>

        {isWalletLoading ? (
          <div className="px-6 py-20 text-center text-slate-500 text-sm">
            Loading wallet information...
          </div>
        ) : !isWalletActivated ? (
          <WalletActivationState onActivate={() => openPinModal("activate")} />
        ) : isTopUpPanelOpen ? (
          <WalletTopUpSePayPanel
            quickAmounts={[...TOP_UP_QUICK_AMOUNTS]}
            selectedAmount={topUpAmount}
            attemptCode={topUpAttemptCode}
            qrImageUrl={topUpQrImageUrl}
            status={topUpStatus}
            isCreatingQr={isCreatingTopUpQr}
            isCheckingStatus={isCheckingTopUpStatus}
            bankName={SEP_BANK_NAME}
            bankCode={SEP_BANK_CODE}
            accountNumber={SEP_ACCOUNT_NUMBER}
            accountName={SEP_ACCOUNT_NAME}
            onSelectAmount={(amount) => {
              void createTopUpQrForAmount(amount);
            }}
            onRefreshQr={() => {
              void createTopUpQrForAmount(topUpAmount);
            }}
            onCheckStatus={() => {
              void checkTopUpStatus();
            }}
            onBack={() => {
              resetTopUpPanelState();
            }}
          />
        ) : (
          <WalletOverview
            isBalanceVisible={isBalanceVisible}
            currentBalance={currentBalance}
            totalCredit={totalCredit}
            transactions={transactions}
            isTransactionsLoading={isTransactionsLoading}
            transactionPageNumber={transactionPageNumber}
            transactionTotalPages={transactionTotalPages}
            transactionTotalCount={transactionTotalCount}
            hasPreviousTransactionPage={hasPreviousTransactionPage}
            hasNextTransactionPage={hasNextTransactionPage}
            onTopUp={() => openPinModal("topup")}
            onToggleBalanceVisibility={() => {
              if (isBalanceVisible) {
                setIsBalanceVisible(false);
                return;
              }
              openPinModal("viewBalance");
            }}
            onChangePin={() => openPinModal("changePin")}
            onTransactionPageChange={handleTransactionPageChange}
          />
        )}
      </section>

      <WalletPinModal
        isOpen={isPinModalOpen}
        pinModalMode={pinModalMode}
        isForgotPinFlow={isForgotPinFlow}
        pin={pin}
        confirmPin={confirmPin}
        oldPin={oldPin}
        newChangePin={newChangePin}
        confirmChangePin={confirmChangePin}
        otpCode={otpCode}
        newPin={newPin}
        confirmNewPin={confirmNewPin}
        pinVisibility={pinVisibility}
        isSubmittingPin={isSubmittingPin}
        isSendingForgotOtp={isSendingForgotOtp}
        isResettingPin={isResettingPin}
        onClose={() => closePinModal()}
        onSubmitPinModal={handleSubmitPinModal}
        onSendForgotPinOtp={handleSendForgotPinOtp}
        onResetPinWithOtp={handleResetPinWithOtp}
        onTogglePinVisibility={togglePinVisibility}
        onPinChange={setPin}
        onConfirmPinChange={setConfirmPin}
        onOldPinChange={setOldPin}
        onNewChangePinChange={setNewChangePin}
        onConfirmChangePinChange={setConfirmChangePin}
        onOtpCodeChange={setOtpCode}
        onNewPinChange={setNewPin}
        onConfirmNewPinChange={setConfirmNewPin}
      />
    </main>
  );
}
