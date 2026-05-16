import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password | ToyStore",
  description: "Reset your ToyStore account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
