"use client";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { authApi } from "../services/auth-api";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const CUSTOMER_ROLE_ID = 1;

interface GoogleAuthButtonProps {
  mode: "login" | "register";
}

function GoogleAuthButton({ mode }: GoogleAuthButtonProps) {
  const { setAuth } = useAuthContext();
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      toast.error("Không nhận được thông tin từ Google. Vui lòng thử lại.");
      return;
    }

    try {
      let response;
      if (mode === "register") {
        response = await authApi.googleRegister({
          idToken: credentialResponse.credential,
        });
        toast.success("Đăng ký thành công! Chào mừng bạn đến với ToyStore.");
      } else {
        response = await authApi.googleLogin({
          idToken: credentialResponse.credential,
          roleId: CUSTOMER_ROLE_ID,
        });
        toast.success(`Chào mừng, ${response.account.accountName}!`);
      }

      setAuth(response.account, response.accessToken);
      router.push("/");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { code?: string; message?: string } } };
      const errorCode = err?.response?.data?.code;
      const errorMessage = err?.response?.data?.message;
      
      if (mode === "register") {
        // Đăng ký bằng Google
        if (errorCode === "CONFLICT" || errorMessage?.toLowerCase().includes("already registered")) {
          toast.error("Email này đã được đăng ký trong hệ thống. Vui lòng đăng nhập.");
        } else {
          toast.error(errorMessage || "Đăng ký thất bại. Vui lòng thử lại.");
        }
      } else {
        // Đăng nhập bằng Google
        if (errorCode === "ACCOUNT_NOT_FOUND" || errorMessage?.toLowerCase().includes("no account found")) {
          toast.error("Tài khoản chưa tồn tại trong hệ thống. Vui lòng đăng ký trước.");
        } else if (errorCode === "ACCOUNT_INACTIVE") {
          toast.error("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.");
        } else if (errorCode === "ACCOUNT_DELETED") {
          toast.error("Tài khoản đã bị xóa.");
        } else {
          toast.error(errorMessage || "Đăng nhập thất bại. Vui lòng thử lại.");
        }
      }
    }
  };

  const handleGoogleError = () => {
    toast.error("Đăng nhập Google thất bại. Vui lòng thử lại.");
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      text={mode === "register" ? "signup_with" : "signin_with"}
      shape="rectangular"
      size="large"
      width="100%"
      logo_alignment="left"
    />
  );
}

export default function GoogleAuthButtonWrapper(props: GoogleAuthButtonProps) {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
    return (
      <div className="w-full p-3 text-center text-sm text-gray-500 border border-gray-300 rounded-lg">
        Google OAuth chưa được cấu hình. Vui lòng kiểm tra .env.local
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleAuthButton {...props} />
    </GoogleOAuthProvider>
  );
}
