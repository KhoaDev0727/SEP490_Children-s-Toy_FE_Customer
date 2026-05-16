import { isAxiosError } from "axios";

import type { AuthApiErrorBody } from "../types/auth";

export const AUTH_ERROR_ACCOUNT_INACTIVE = "ACCOUNT_INACTIVE";

/** English message when account is deactivated (sync with login behavior). */
export const ACCOUNT_INACTIVE_VI_MESSAGE =
  "Your account has been deactivated. You cannot reset the password. Please contact support.";

export function getAuthApiErrorPayload(error: unknown): AuthApiErrorBody | undefined {
  if (!isAxiosError(error)) {
    return undefined;
  }
  const data = error.response?.data;
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    const code = (rec.code ?? rec.Code) as string | undefined;
    const message = (rec.message ?? rec.Message) as string | undefined;
    if (code !== undefined || message !== undefined) {
      return { code, message };
    }
  }
  return undefined;
}

export function resolveAuthOperationErrorMessage(
  error: unknown,
  fallbackMessage: string,
): { message: string; code?: string } {
  if (!isAxiosError(error)) {
    return { message: fallbackMessage };
  }

  const payload = getAuthApiErrorPayload(error);
  const status = error.response?.status;
  const code = payload?.code;

  if (status === 403 && code === AUTH_ERROR_ACCOUNT_INACTIVE) {
    return { message: ACCOUNT_INACTIVE_VI_MESSAGE, code };
  }

  return { message: payload?.message ?? fallbackMessage, code };
}
