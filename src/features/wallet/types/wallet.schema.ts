import { z } from "zod";

const PIN_REGEX = /^\d{6}$/;

export const createWalletSchema = z
  .object({
    pin: z.string().regex(PIN_REGEX, "PIN must be exactly 6 digits."),
    confirmPin: z.string().regex(PIN_REGEX, "Confirm PIN must be exactly 6 digits."),
  })
  .refine((data) => data.pin === data.confirmPin, {
    path: ["confirmPin"],
    message: "Confirm PIN does not match.",
  });

export const verifyWalletPinSchema = z.object({
  pin: z.string().regex(PIN_REGEX, "PIN must be exactly 6 digits."),
  actionType: z.enum(["PAYMENT", "VIEW_BALANCE", "TOP_UP"]),
});

export const changeWalletPinSchema = z
  .object({
    oldPin: z.string().regex(PIN_REGEX, "Old PIN must be exactly 6 digits."),
    newPin: z.string().regex(PIN_REGEX, "New PIN must be exactly 6 digits."),
    confirmNewPin: z.string().regex(PIN_REGEX, "Confirm new PIN must be exactly 6 digits."),
  })
  .refine((data) => data.newPin === data.confirmNewPin, {
    path: ["confirmNewPin"],
    message: "Confirm new PIN does not match.",
  })
  .refine((data) => data.oldPin !== data.newPin, {
    path: ["newPin"],
    message: "New PIN must be different from old PIN.",
  });

export const verifyForgotWalletPinOtpSchema = z.object({
  otpCode: z.string().regex(PIN_REGEX, "OTP must be exactly 6 digits."),
});

export const resetForgotWalletPinSchema = z
  .object({
    newPin: z.string().regex(PIN_REGEX, "New PIN must be exactly 6 digits."),
    confirmNewPin: z.string().regex(PIN_REGEX, "Confirm new PIN must be exactly 6 digits."),
  })
  .refine((data) => data.newPin === data.confirmNewPin, {
    path: ["confirmNewPin"],
    message: "Confirm new PIN does not match.",
  });

const QUICK_TOP_UP_AMOUNTS = [2000, 20000, 50000, 100000, 200000, 500000] as const;

export const createSePayTopUpQrSchema = z.object({
  amount: z
    .number({ required_error: "Top-up amount is required." })
    .refine((amount) => QUICK_TOP_UP_AMOUNTS.includes(amount as (typeof QUICK_TOP_UP_AMOUNTS)[number]), {
      message: "Top-up amount is not supported.",
    }),
  topUpToken: z.string().min(1, "Top-up token is required."),
});

export type CreateWalletFormValues = z.infer<typeof createWalletSchema>;
export type VerifyWalletPinFormValues = z.infer<typeof verifyWalletPinSchema>;
export type ChangeWalletPinFormValues = z.infer<typeof changeWalletPinSchema>;
export type VerifyForgotWalletPinOtpFormValues = z.infer<typeof verifyForgotWalletPinOtpSchema>;
export type ResetForgotWalletPinFormValues = z.infer<typeof resetForgotWalletPinSchema>;
export type CreateSePayTopUpQrFormValues = z.infer<typeof createSePayTopUpQrSchema>;
