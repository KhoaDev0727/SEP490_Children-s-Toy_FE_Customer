import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password | children's toy store",
  description: "Reset your children's toy store account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
