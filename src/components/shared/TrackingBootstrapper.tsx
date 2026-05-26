"use client";
import { useEffect } from "react";
import tracking from "@/lib/tracking";

/**
 * Component vô hình — mount trong root layout để bootstrap tracking collector.
 * - Khởi động timer batch (mỗi 30 giây).
 * - Đăng ký pagehide / visibilitychange để flush sendBeacon khi user rời trang.
 */
export default function TrackingBootstrapper() {
  useEffect(() => {
    tracking.start();
  }, []);
  return null;
}
