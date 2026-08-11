import RegisterForm from "@/features/auth/components/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up | children's toy store",
  description: "Create a children's toy store account to shop for premium kids toys.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
