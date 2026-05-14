import ProductDetailsView from "@/features/products/components/ProductDetailsView";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ productId: string | string[] }>;
}) {
  const resolvedParams = await params;
  const rawProductId = Array.isArray(resolvedParams.productId)
    ? resolvedParams.productId[0]
    : resolvedParams.productId;
  const productId = Number(rawProductId);

  if (Number.isNaN(productId) || productId <= 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Invalid product ID.
      </div>
    );
  }

  return <ProductDetailsView productId={productId} />;
}
