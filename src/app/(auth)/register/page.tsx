import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký | ToyStore",
  description: "Tạo tài khoản ToyStore để mua sắm đồ chơi trẻ em chất lượng cao",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
