"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProfileSidebar from "../_components/ProfileSidebar";
import { walletApi } from "@/features/wallet/services/wallet-api";
import {
  changeWalletPinSchema,
  createWalletSchema,
  resetForgotWalletPinSchema,
  verifyForgotWalletPinOtpSchema,
  verifyWalletPinSchema,
} from "@/features/wallet/types/wallet.schema";
import type { ApiErrorResponse, WalletDto } from "@/features/wallet/types/wallet";
import WalletActivationState from "./_components/WalletActivationState";
import WalletBreadcrumb from "./_components/WalletBreadcrumb";
import WalletOverview from "./_components/WalletOverview";
import WalletPinModal from "./_components/WalletPinModal";
import {
  DEFAULT_PIN_VISIBILITY,
  getValidationErrorMessage,
  mapWalletTransactionToUi,
  type PinModalMode,
  type PinVisibilityField,
  type UiTransaction,
} from "./_components/wallet-shared";

function getApiError(error: unknown) {
  const err = error as { response?: { status?: number; data?: ApiErrorResponse } };
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
  const [pinVisibility, setPinVisibility] = useState<Record<PinVisibilityField, boolean>>(
    () => ({ ...DEFAULT_PIN_VISIBILITY }),
  );

  const isWalletActivated = wallet !== null;
  const currentBalance = wallet?.balance ?? 0;

  const totalCredit = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions],
  );

  const loadWalletData = useCallback(async () => {
    setIsWalletLoading(true);

    try {
      const walletResponse = await walletApi.getMyWallet();
      setWallet(walletResponse);

      setIsTransactionsLoading(true);
      try {
        const transactionResponse = await walletApi.getTransactions(1, 10);
        setTransactions(transactionResponse.items.map(mapWalletTransactionToUi));
      } catch (transactionError) {
        const transactionApiError = getApiError(transactionError);
        setTransactions([]);
        toast.error(transactionApiError.message ?? "Unable to load transaction history.");
      } finally {
        setIsTransactionsLoading(false);
      }
    } catch (error) {
      const apiError = getApiError(error);
      if (apiError.status === 404 || apiError.code === "NOT_FOUND") {
        setWallet(null);
        setTransactions([]);
      } else {
        toast.error(apiError.message ?? "Unable to load wallet information.");
      }
    } finally {
      setIsWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadWalletData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadWalletData]);

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
    if (!force && (isSubmittingPin || isSendingForgotOtp || isResettingPin)) return;
    setIsPinModalOpen(false);
    resetPinModalFields();
  };

  const togglePinVisibility = (field: PinVisibilityField) => {
    setPinVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

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
        toast.error(apiError.message ?? "Unable to change PIN. Please try again.");
      } finally {
        setIsSubmittingPin(false);
      }
      return;
    }

    const activationValidation =
      pinModalMode === "activate" ? createWalletSchema.safeParse({ pin, confirmPin }) : null;
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
        const createdWallet = await walletApi.createWallet(activationValidation!.data);
        setWallet(createdWallet);
        setTransactions([]);
        toast.success("Wallet activated successfully.");
      } else if (pinModalMode === "topup") {
        await walletApi.verifyPin(topUpValidation!.data);
        toast.success("PIN verified successfully. You can continue top-up.");
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
        toast.success("You already have a wallet. Switched to wallet management mode.");
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

    const resetValidation = resetForgotWalletPinSchema.safeParse({ newPin, confirmNewPin });
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

  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      <WalletBreadcrumb />

      <ProfileSidebar />

      <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2bfb0]/30 flex justify-between items-center bg-white">
          <h1 className="text-2xl font-bold text-[#261812]">Wallet Management</h1>
        </div>

        {isWalletLoading ? (
          <div className="px-6 py-20 text-center text-[#5a4136] text-sm">Loading wallet information...</div>
        ) : !isWalletActivated ? (
          <WalletActivationState onActivate={() => openPinModal("activate")} />
        ) : (
          <WalletOverview
            isBalanceVisible={isBalanceVisible}
            currentBalance={currentBalance}
            totalCredit={totalCredit}
            transactions={transactions}
            isTransactionsLoading={isTransactionsLoading}
            onTopUp={() => openPinModal("topup")}
            onToggleBalanceVisibility={() => {
              if (isBalanceVisible) {
                setIsBalanceVisible(false);
                return;
              }
              openPinModal("viewBalance");
            }}
            onChangePin={() => openPinModal("changePin")}
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
