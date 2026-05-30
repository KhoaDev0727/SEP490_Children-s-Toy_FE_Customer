/**
 * Resolves the navigation target URL from a notification's actionType and actionTarget.
 *
 * After P1 BE changes, new campaigns store:
 *   actionType  = "ROUTE"
 *   actionTarget = full path e.g. "/profile/vouchers?code=XYZ", "/?flashSale=42"
 *
 * Legacy campaigns may still carry the old format:
 *   actionType  = "VOUCHER" | "SALE" | "PRODUCT" | "BLOG"
 *   actionTarget = raw ID string or old resolver paths like "/vouchers/{code}" or "/sale/{id}"
 *
 * Returns a same-origin path string or null if no target is determinable.
 */
export function resolveNotificationTarget(
  actionType?: string | null,
  actionTarget?: string | null,
): string | null {
  if (!actionTarget) return null;

  const target = actionTarget.trim();

  // Already a proper path — use directly (new ROUTE format or any existing /path)
  if (target.startsWith("/")) {
    // Alias: old BE resolver used "/vouchers/{code}" → rewrite to wallet page
    const voucherLegacy = target.match(/^\/vouchers\/([^/?#]+)/);
    if (voucherLegacy) {
      return `/profile/vouchers?code=${encodeURIComponent(voucherLegacy[1])}`;
    }

    // Alias: old BE resolver used "/sale/{id}" → rewrite to home flash sale
    const saleLegacy = target.match(/^\/sale\/(\d+)/);
    if (saleLegacy) {
      return `/?flashSale=${saleLegacy[1]}`;
    }

    return target;
  }

  // External URL — open in new tab (caller decides); return null so caller can handle
  if (target.startsWith("http")) return null;

  // Legacy: raw ID with known actionType
  const type = (actionType ?? "").toUpperCase();
  if (type === "PRODUCT") return `/products/${target}`;
  if (type === "BLOG") return `/blog/${target}`;
  if (type === "VOUCHER") return `/profile/vouchers`;
  if (type === "SALE") return `/`;

  return null;
}
