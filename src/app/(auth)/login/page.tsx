import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | ToyStore",
  description: "Đăng nhập vào ToyStore để mua sắm đồ chơi trẻ em chất lượng cao",
};

export default function LoginPage() {
  return <LoginForm />;
}
