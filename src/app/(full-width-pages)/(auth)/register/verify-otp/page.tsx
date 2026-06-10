import VerifyRegisterOtpForm from "@/features/auth/components/VerifyRegisterOtpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify email | ToyStore",
  description: "Verify your email to complete ToyStore account registration.",
};

interface VerifyRegisterOtpPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerifyRegisterOtpPage({ searchParams }: VerifyRegisterOtpPageProps) {
  const resolvedParams = await searchParams;
  const emailParam = resolvedParams.email;
  const email = Array.isArray(emailParam) ? emailParam[0] ?? "" : emailParam ?? "";

  return <VerifyRegisterOtpForm email={email} />;
}
