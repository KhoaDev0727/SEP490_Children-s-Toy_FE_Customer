import RegisterForm from "@/features/auth/components/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up | ToyStore",
  description: "Create a ToyStore account to shop for premium kids toys.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
