import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quên mật khẩu | ToyStore",
  description: "Đặt lại mật khẩu tài khoản ToyStore của bạn",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
