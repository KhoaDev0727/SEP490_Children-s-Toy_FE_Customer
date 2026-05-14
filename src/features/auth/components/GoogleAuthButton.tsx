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
      toast.error("Could not retrieve information from Google. Please try again.");
      return;
    }

    try {
      let response;
      if (mode === "register") {
        response = await authApi.googleRegister({
          idToken: credentialResponse.credential,
        });
        toast.success("Registration successful! Welcome to ToyStore.");
      } else {
        response = await authApi.googleLogin({
          idToken: credentialResponse.credential,
          roleId: CUSTOMER_ROLE_ID,
        });
        toast.success(`Welcome, ${response.account.accountName}!`);
      }

      setAuth(response.account, response.accessToken);
      router.push("/");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { code?: string; message?: string } } };
      const errorCode = err?.response?.data?.code;
      const errorMessage = err?.response?.data?.message;
      
      if (mode === "register") {
        // Register with Google
        if (errorCode === "CONFLICT" || errorMessage?.toLowerCase().includes("already registered")) {
          toast.error("This email is already registered. Please sign in.");
        } else {
          toast.error(errorMessage || "Registration failed. Please try again.");
        }
      } else {
        // Sign in with Google
        if (errorCode === "ACCOUNT_NOT_FOUND" || errorMessage?.toLowerCase().includes("no account found")) {
          toast.error("Account not found. Please sign up first.");
        } else if (errorCode === "ACCOUNT_INACTIVE") {
          toast.error("Your account has been deactivated. Please contact support.");
        } else if (errorCode === "ACCOUNT_DELETED") {
          toast.error("Your account has been deleted.");
        } else {
          toast.error(errorMessage || "Sign-in failed. Please try again.");
        }
      }
    }
  };

  const handleGoogleError = () => {
    toast.error("Google sign-in failed. Please try again.");
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      locale="en"
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
        Google OAuth is not configured. Please check .env.local
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} locale="en">
      <GoogleAuthButton {...props} />
    </GoogleOAuthProvider>
  );
}
