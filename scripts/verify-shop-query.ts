import { getShopData } from "../src/lib/shop-data";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const base = await getShopData({});
  assert(base.total === 6, `Expected 6 products, got ${base.total}`);

  const search = await getShopData({ search: "heavyweight" });
  assert(search.total === 4, `Search expected 4 products, got ${search.total}`);

  const collection = await getShopData({ collection: "drop-002" });
  assert(collection.total === 2, `Collection drop-002 expected 2 products, got ${collection.total}`);

  const sizeFilter = await getShopData({ size: "XL" });
  assert(sizeFilter.total === 3, `Size XL expected 3 products, got ${sizeFilter.total}`);

  const inStock = await getShopData({ availability: "in-stock" });
  assert(inStock.total === 5, `In-stock expected 5 products, got ${inStock.total}`);

  const color = await getShopData({ color: "red" });
  assert(color.total === 1 && color.products[0]?.id === "shop-test-5", "Color red filter did not return expected product");

  const priceAsc = await getShopData({ sort: "price-asc" });
  assert(priceAsc.products[0]?.price === 390, `Price asc expected first price 390, got ${priceAsc.products[0]?.price}`);

  const priceDesc = await getShopData({ sort: "price-desc" });
  assert(priceDesc.products[0]?.price === 530, `Price desc expected first price 530, got ${priceDesc.products[0]?.price}`);

  const bestSelling = await getShopData({ sort: "best-selling" });
  assert(bestSelling.products[0]?.id === "shop-test-4", `Best-selling expected shop-test-4 first, got ${bestSelling.products[0]?.id}`);

  const paged = await getShopData({ page: "2" });
  assert(paged.page === 1, `With 6 products and page size 16, page should clamp to 1, got ${paged.page}`);

  console.log("Shop query verification passed.");
  console.log(
    JSON.stringify(
      {
        totals: {
          all: base.total,
          searchHeavyweight: search.total,
          drop002: collection.total,
          xl: sizeFilter.total,
          inStock: inStock.total,
        },
        sorting: {
          priceAscFirst: priceAsc.products[0]?.id,
          priceDescFirst: priceDesc.products[0]?.id,
          bestSellingFirst: bestSelling.products[0]?.id,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
