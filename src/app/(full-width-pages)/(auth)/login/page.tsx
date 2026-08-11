import LoginForm from "@/features/auth/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | children's toy store",
  description: "Sign in to children's toy store to shop for premium kids toys.",
};

export default function LoginPage() {
  return <LoginForm />;
}
