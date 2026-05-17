import { Suspense } from "react";
import OrderSuccessPage from "@/components/OrderSuccessPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderSuccessPage />
    </Suspense>
  );
}
