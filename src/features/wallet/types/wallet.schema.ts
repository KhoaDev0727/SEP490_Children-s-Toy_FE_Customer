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

export type CreateWalletFormValues = z.infer<typeof createWalletSchema>;
export type VerifyWalletPinFormValues = z.infer<typeof verifyWalletPinSchema>;
export type ChangeWalletPinFormValues = z.infer<typeof changeWalletPinSchema>;
export type VerifyForgotWalletPinOtpFormValues = z.infer<typeof verifyForgotWalletPinOtpSchema>;
export type ResetForgotWalletPinFormValues = z.infer<typeof resetForgotWalletPinSchema>;
