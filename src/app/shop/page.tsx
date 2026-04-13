import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/shop-client";
import { getShopData, type ShopQueryParams } from "@/lib/shop-data";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function toSingleSearchParams(input: {
  [key: string]: string | string[] | undefined;
}): ShopQueryParams {
  const out: ShopQueryParams = {};
  for (const key of [
    "collection",
    "size",
    "color",
    "minPrice",
    "maxPrice",
    "sort",
    "search",
    "page",
    "availability",
  ] as const) {
    const value = input[key];
    if (typeof value === "string") {
      out[key] = value;
    } else if (Array.isArray(value) && typeof value[0] === "string") {
      out[key] = value[0];
    }
  }
  return out;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = toSingleSearchParams(await searchParams);
  const collection = params.collection;
  const search = params.search;

  const title = search
    ? `"${search}" - ERA 99`
    : collection && collection !== "all"
      ? `${collection} - ERA 99`
      : "Shop - ERA 99";

  return {
    title,
    description:
      "ERA 99 — Alexandria streetwear. Heavyweight boxy fit t-shirts from Alexandria, Egypt.",
    openGraph: {
      title,
      images: ["/og-shop.jpg"],
    },
  };
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = toSingleSearchParams(await searchParams);
  const data = await getShopData(params);

  return <ShopClient data={data} />;
}
