import LoginForm from "@/features/auth/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | ToyStore",
  description: "Sign in to ToyStore to shop for premium kids toys.",
};

export default function LoginPage() {
  return <LoginForm />;
}
