"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { formatEGP } from "@/lib/utils";
import type {
  ShopColorFacet,
  ShopDataResult,
  ShopProduct,
  ShopSort,
} from "@/lib/shop-data";

const SORT_OPTIONS: Array<{ value: ShopSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc", label: "Price Low" },
  { value: "price-desc", label: "Price High" },
  { value: "name", label: "Name" },
];

const ORDERED_SIZES = ["S", "M", "L", "XL", "XXL"];

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function buildPagination(current: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const normalized = Array.from(pages)
    .filter((value) => value >= 1 && value <= total)
    .sort((a, b) => a - b);

  const withEllipsis: Array<number | "..."> = [];
  for (let i = 0; i < normalized.length; i += 1) {
    const page = normalized[i];
    const prev = normalized[i - 1];
    if (i > 0 && prev && page - prev > 1) withEllipsis.push("...");
    withEllipsis.push(page);
  }

  return withEllipsis;
}

function getActiveFilterCount(params: URLSearchParams) {
  return [
    "collection",
    "size",
    "color",
    "minPrice",
    "maxPrice",
    "availability",
    "sort",
    "search",
  ].reduce((sum, key) => (params.get(key) ? sum + 1 : sum), 0);
}

function hasAnyActiveFilter(params: URLSearchParams) {
  return getActiveFilterCount(params) > 0;
}

function cardImagesForProduct(product: ShopProduct) {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.primaryImage, product.secondaryImage].filter(Boolean);

  return images.length > 0 ? images : ["/images/1.avif"];
}

function extractSizeOptions(product: ShopProduct) {
  const map = new Map<string, { stock: number; active: boolean }>();
  for (const variant of product.variants) {
    for (const size of variant.sizes) {
      const existing = map.get(size.size);
      map.set(size.size, {
        stock: (existing?.stock || 0) + size.stock,
        active: Boolean(existing?.active || size.active),
      });
    }
  }
  return Array.from(map.entries()).map(([size, data]) => ({ size, ...data }));
}

function findVariantForSize(product: ShopProduct, wantedSize: string) {
  for (const variant of product.variants) {
    const match = variant.sizes.find(
      (slot) => slot.size === wantedSize && slot.active && slot.stock > 0,
    );
    if (match) return { variant, size: match };
  }
  return null;
}

function ProductTile({
  product,
  onQuickView,
  onQuickAdd,
  addedKey,
}: {
  product: ShopProduct;
  onQuickView: (product: ShopProduct) => void;
  onQuickAdd: (product: ShopProduct, size: string) => void;
  addedKey: string | null;
}) {
  const images = cardImagesForProduct(product);
  const sizes = extractSizeOptions(product);

  return (
    <article className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[3/4] overflow-hidden bg-[#EDE8DF]"
      >
        <Image
          src={images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.03] group-hover:opacity-0"
        />
        <Image
          src={images[1] || images[0]}
          alt={`${product.name} detail`}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover opacity-0 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
        />

        {product.newArrival ? (
          <span className="absolute left-4 top-4 bg-[#FAF8F4]/90 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#111111]">
            New
          </span>
        ) : null}
        {product.soldOut ? (
          <span className="absolute left-4 top-4 bg-[#111111]/80 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#FAF8F4]">
            Sold Out
          </span>
        ) : null}
      </Link>

      <div className="mt-5">
        <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#111111]/35">
          {product.collection}
        </p>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <Link
            href={`/product/${product.slug}`}
            className="font-brand-serif text-[18px] leading-tight text-[#111111] hover:opacity-70"
          >
            {product.name}
          </Link>
          <p className="text-sm text-[#111111] sm:text-right">
            {product.compareAtPrice ? (
              <>
                <span className="mr-2 text-[#7C7C75] line-through">
                  {formatEGP(product.compareAtPrice)}
                </span>
                {formatEGP(product.price)}
              </>
            ) : (
              formatEGP(product.price)
            )}
          </p>
        </div>
        <p className="mt-1 text-sm font-light text-[#7C7C75]">
          {product.fabric}
        </p>

        <div className="mt-3 flex items-center gap-1.5">
          {product.variants.slice(0, 5).map((variant) => (
            <span
              key={variant.id}
              className="h-3.5 w-3.5 border border-[#111111]/20"
              style={{ backgroundColor: variant.colorHex || "#EDE8DF" }}
              title={variant.colorName}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="border-b border-[#111111]/40 pb-1 text-[11px] uppercase tracking-[0.16em] text-[#111111] transition-opacity hover:opacity-60"
          >
            Quick View
          </button>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const disabled = !size.active || size.stock <= 0;
              const marker = `${product.id}-${size.size}`;
              return (
                <button
                  key={size.size}
                  disabled={disabled}
                  onClick={() => onQuickAdd(product, size.size)}
                  className={`h-7 min-w-7 border px-2 text-[10px] uppercase tracking-[0.12em] transition-colors ${
                    addedKey === marker
                      ? "border-[#111111] bg-[#111111] text-[#FAF8F4]"
                      : disabled
                        ? "border-[#111111]/10 text-[#111111]/25 line-through"
                        : "border-[#111111]/20 text-[#111111] hover:border-[#111111]"
                  }`}
                >
                  {addedKey === marker ? "Added" : size.size}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

function FilterPanel({
  data,
  selectedCollection,
  selectedSizes,
  selectedColors,
  selectedAvailability,
  onCollectionChange,
  onSizeToggle,
  onColorToggle,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  onPriceApply,
  onAvailabilityChange,
  clearVisible,
  onClear,
}: {
  data: ShopDataResult;
  selectedCollection: string;
  selectedSizes: string[];
  selectedColors: string[];
  selectedAvailability: string;
  onCollectionChange: (value: string) => void;
  onSizeToggle: (value: string) => void;
  onColorToggle: (value: ShopColorFacet) => void;
  priceMin: number;
  priceMax: number;
  setPriceMin: (value: number) => void;
  setPriceMax: (value: number) => void;
  onPriceApply: () => void;
  onAvailabilityChange: (value: "all" | "in-stock") => void;
  clearVisible: boolean;
  onClear: () => void;
}) {
  const sizeAvailability = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const size of ORDERED_SIZES) {
      map.set(size, data.availableSizes.includes(size));
    }
    return map;
  }, [data.availableSizes]);

  return (
    <div className="space-y-8">
      <section>
        <p className="qutb-eyebrow text-[#7C7C75]">Collection</p>
        <div className="mt-4 flex flex-col items-start gap-3 text-sm">
          <button
            onClick={() => onCollectionChange("all")}
            className={
              selectedCollection === "all" ? "text-[#111111]" : "text-[#7C7C75]"
            }
          >
            All
          </button>
          {data.collections.map((item) => (
            <button
              key={item.slug}
              onClick={() => onCollectionChange(item.slug)}
              className={
                selectedCollection === item.slug
                  ? "text-[#111111]"
                  : "text-[#7C7C75]"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="border-t border-[#111111]/10 pt-7">
        <p className="qutb-eyebrow text-[#7C7C75]">Size</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ORDERED_SIZES.map((size) => {
            const enabled = sizeAvailability.get(size);
            const selected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                disabled={!enabled}
                onClick={() => onSizeToggle(size)}
                className={`h-9 min-w-9 border px-2 text-[11px] uppercase tracking-[0.12em] ${
                  selected
                    ? "border-[#111111] bg-[#111111] text-[#FAF8F4]"
                    : enabled
                      ? "border-[#111111]/25 text-[#111111]"
                      : "border-[#111111]/10 text-[#111111]/25 line-through"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[#111111]/10 pt-7">
        <p className="qutb-eyebrow text-[#7C7C75]">Color</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {data.colors.map((color) => {
            const selected = selectedColors.includes(color.slug);
            return (
              <button
                key={color.slug}
                onClick={() => onColorToggle(color)}
                aria-label={color.label}
                title={color.label}
                className={`h-6 w-6 border border-[#111111]/20 ${
                  selected ? "ring-1 ring-[#111111] ring-offset-2" : ""
                }`}
                style={{
                  backgroundColor: color.hex,
                  ["--tw-ring-offset-color" as string]: "#FAF8F4",
                }}
              />
            );
          })}
        </div>
      </section>

      <section className="border-t border-[#111111]/10 pt-7">
        <p className="qutb-eyebrow text-[#7C7C75]">Price</p>
        <p className="mt-3 text-sm text-[#7C7C75]">
          {Math.floor(priceMin)} EGP - {Math.floor(priceMax)} EGP
        </p>
        <div className="mt-4 space-y-3">
          <input
            type="range"
            min={data.minPriceBound}
            max={data.maxPriceBound}
            value={priceMin}
            onChange={(event) =>
              setPriceMin(Math.min(Number(event.target.value), priceMax))
            }
            onMouseUp={onPriceApply}
            onTouchEnd={onPriceApply}
            className="w-full accent-[#111111]"
          />
          <input
            type="range"
            min={data.minPriceBound}
            max={data.maxPriceBound}
            value={priceMax}
            onChange={(event) =>
              setPriceMax(Math.max(Number(event.target.value), priceMin))
            }
            onMouseUp={onPriceApply}
            onTouchEnd={onPriceApply}
            className="w-full accent-[#111111]"
          />
        </div>
      </section>

      <section className="border-t border-[#111111]/10 pt-7">
        <p className="qutb-eyebrow text-[#7C7C75]">Availability</p>
        <div className="mt-4 flex flex-col items-start gap-3 text-sm">
          <button
            onClick={() => onAvailabilityChange("in-stock")}
            className={
              selectedAvailability === "in-stock"
                ? "text-[#111111]"
                : "text-[#7C7C75]"
            }
          >
            In Stock
          </button>
          <button
            onClick={() => onAvailabilityChange("all")}
            className={
              selectedAvailability === "all" ? "text-[#111111]" : "text-[#7C7C75]"
            }
          >
            All
          </button>
        </div>
      </section>

      {clearVisible ? (
        <button
          onClick={onClear}
          className="border-b border-[#111111]/35 pb-1 text-[11px] uppercase tracking-[0.16em] text-[#111111]"
        >
          Clear All
        </button>
      ) : null}
    </div>
  );
}

function QuickView({
  product,
  onClose,
  onQuickAdd,
}: {
  product: ShopProduct;
  onClose: () => void;
  onQuickAdd: (product: ShopProduct, size: string) => void;
}) {
  const images = cardImagesForProduct(product);
  const [imageIndex, setImageIndex] = useState(0);
  const activeImage = images[imageIndex] || images[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <motion.button
        aria-label="Close quick view"
        className="fixed inset-0 z-[65] bg-[#111111]/45 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-x-4 bottom-0 z-[66] max-h-[88vh] overflow-y-auto bg-[#FAF8F4] p-5 text-[#111111] shadow-[0_24px_80px_rgba(17,17,17,0.2)] md:bottom-auto md:left-1/2 md:top-1/2 md:w-[min(940px,92vw)] md:-translate-x-1/2 md:-translate-y-1/2 md:p-8"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#7C7C75] hover:text-[#111111]"
          aria-label="Close quick view"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        <div className="grid gap-8 md:grid-cols-[56%_44%]">
          <div>
            <div className="relative aspect-[3/4] overflow-hidden bg-[#EDE8DF]">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 52vw"
                className="object-cover"
              />
            </div>
            {images.length > 1 ? (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((image, index) => (
                  <button
                    key={image}
                    onClick={() => setImageIndex(index)}
                    className={`relative aspect-[3/4] overflow-hidden border ${
                      index === imageIndex
                        ? "border-[#111111]"
                        : "border-[#111111]/10"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col justify-center">
            <p className="qutb-eyebrow text-[#7C7C75]">
              {product.collection}
            </p>
            <h2 className="mt-3 font-brand-serif text-[clamp(2rem,4vw,3.4rem)] leading-none">
              {product.name}
            </h2>
            <p className="mt-4 text-lg">
              {product.compareAtPrice ? (
                <>
                  <span className="mr-3 text-[#7C7C75] line-through">
                    {formatEGP(product.compareAtPrice)}
                  </span>
                  {formatEGP(product.price)}
                </>
              ) : (
                formatEGP(product.price)
              )}
            </p>
            <p className="mt-5 text-[15px] font-light leading-[1.8] text-[#7C7C75]">
              {product.shortDescription || product.fabric}
            </p>

            <div className="mt-7 border-t border-[#111111]/10 pt-6">
              <p className="qutb-eyebrow text-[#7C7C75]">Add Size</p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {extractSizeOptions(product).map((size) => {
                  const disabled = !size.active || size.stock <= 0;
                  return (
                    <button
                      key={size.size}
                      disabled={disabled}
                      onClick={() => onQuickAdd(product, size.size)}
                      className={`h-10 border text-[11px] uppercase tracking-[0.14em] ${
                        disabled
                          ? "border-[#111111]/10 text-[#111111]/25 line-through"
                          : "border-[#111111]/30 text-[#111111] hover:border-[#111111]"
                      }`}
                    >
                      {size.size}
                    </button>
                  );
                })}
              </div>
            </div>

            <Link
              href={`/product/${product.slug}`}
              className="qutb-link-underline mt-7 inline-block text-[12px] uppercase tracking-[0.16em] text-[#111111]"
            >
              View Full Product
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export function ShopClient({ data }: { data: ShopDataResult }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { addItem } = useCart();
  const { trackEvent } = useAnalytics();
  const { track } = useMetaPixel();

  const [searchInput, setSearchInput] = useState(data.query.search);
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ShopProduct | null>(
    null,
  );
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState(data.query.minPrice);
  const [priceMax, setPriceMax] = useState(data.query.maxPrice);

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    setSearchInput(data.query.search);
    setPriceMin(data.query.minPrice);
    setPriceMax(data.query.maxPrice);
  }, [data.query.search, data.query.minPrice, data.query.maxPrice]);

  const replaceParams = useCallback(
    (
      updater: (params: URLSearchParams) => void,
      options?: {
        resetPage?: boolean;
        event?: { name: string; payload?: Record<string, unknown> };
      },
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      if (options?.resetPage) params.delete("page");

      if (options?.event?.name) {
        trackEvent(options.event.name, options.event.payload || {});
      }

      const next = params.toString();
      startTransition(() => {
        router.replace(next ? `${pathname}?${next}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams, trackEvent],
  );

  useEffect(() => {
    const current = searchParams.get("search") || "";
    const next = debouncedSearch.trim();
    if (current === next) return;

    replaceParams(
      (params) => {
        if (next) params.set("search", next);
        else params.delete("search");
      },
      {
        resetPage: true,
        event: { name: "search", payload: { search_term: next } },
      },
    );

    if (next) track("Search", { search_string: next });
  }, [debouncedSearch, replaceParams, searchParams, track]);

  const currentParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );
  const selectedSizes = useMemo(
    () => (currentParams.get("size") || "").split(",").filter(Boolean),
    [currentParams],
  );
  const selectedColors = useMemo(
    () => (currentParams.get("color") || "").split(",").filter(Boolean),
    [currentParams],
  );
  const selectedCollection = currentParams.get("collection") || "all";
  const selectedSort = (currentParams.get("sort") as ShopSort) || "newest";
  const selectedAvailability = currentParams.get("availability") || "all";
  const activeFilterCount = getActiveFilterCount(currentParams);
  const paginationItems = buildPagination(data.page, data.totalPages);

  const addToCartQuick = (product: ShopProduct, size: string) => {
    const match = findVariantForSize(product, size);
    if (!match) return;

    addItem({
      productId: product.id,
      variantId: `${match.variant.id}:${size}`,
      slug: product.slug,
      name: product.name,
      color: match.variant.colorName,
      size,
      qty: 1,
      unitPrice: product.price,
      image: match.variant.images[0] || product.primaryImage,
    });

    trackEvent("add_to_cart", {
      product: product.name,
      size,
      price: product.price,
    });
    track("AddToCart", {
      content_ids: [product.id],
      content_name: product.name,
      value: product.price,
      currency: "EGP",
    });

    const marker = `${product.id}-${size}`;
    setAddedKey(marker);
    window.setTimeout(() => {
      setAddedKey((current) => (current === marker ? null : current));
    }, 1800);
  };

  const applySort = (sort: ShopSort) => {
    replaceParams(
      (params) => {
        if (sort === "newest") params.delete("sort");
        else params.set("sort", sort);
      },
      {
        resetPage: true,
        event: { name: "sort_applied", payload: { sort } },
      },
    );
    setSortOpen(false);
  };

  const toggleSizeFilter = (size: string) => {
    replaceParams(
      (params) => {
        const values = (params.get("size") || "").split(",").filter(Boolean);
        const next = values.includes(size)
          ? values.filter((value) => value !== size)
          : [...values, size];
        if (next.length) params.set("size", next.join(","));
        else params.delete("size");
      },
      {
        resetPage: true,
        event: { name: "filter_applied", payload: { filter: "size", value: size } },
      },
    );
  };

  const toggleColorFilter = (color: ShopColorFacet) => {
    replaceParams(
      (params) => {
        const values = (params.get("color") || "").split(",").filter(Boolean);
        const next = values.includes(color.slug)
          ? values.filter((value) => value !== color.slug)
          : [...values, color.slug];
        if (next.length) params.set("color", next.join(","));
        else params.delete("color");
      },
      {
        resetPage: true,
        event: {
          name: "filter_applied",
          payload: { filter: "color", value: color.slug },
        },
      },
    );
  };

  const applyPriceRange = () => {
    replaceParams(
      (params) => {
        params.set("minPrice", String(Math.floor(priceMin)));
        params.set("maxPrice", String(Math.floor(priceMax)));
      },
      {
        resetPage: true,
        event: {
          name: "filter_applied",
          payload: {
            filter: "price",
            minPrice: Math.floor(priceMin),
            maxPrice: Math.floor(priceMax),
          },
        },
      },
    );
  };

  const clearAllFilters = () => {
    replaceParams((params) => {
      [
        "collection",
        "size",
        "color",
        "minPrice",
        "maxPrice",
        "sort",
        "search",
        "page",
        "availability",
      ].forEach((key) => params.delete(key));
    });
    setSearchInput("");
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] pb-24 pt-32 text-[#111111]">
      <section className="px-6 pb-16 md:px-12 md:pb-20">
        <div className="mx-auto max-w-[1400px]">
          <p className="qutb-eyebrow text-[#7C7C75]">03 - The Uniform</p>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="md:col-span-6">
              <h1 className="font-brand-serif text-[clamp(3rem,8vw,7rem)] font-medium leading-none tracking-[-0.01em]">
                The Uniform.
              </h1>
            </div>
            <div className="flex items-end md:col-span-4 md:col-start-8">
              <p className="max-w-md text-[15px] font-light leading-[1.85] text-[#7C7C75]">
                A permanent collection of essentials refined through fabric,
                fit, and repetition. These are not seasonal pieces. They are
                yours to keep.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-y border-[#111111]/10 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7C7C75]" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search products"
                className="h-11 w-full bg-transparent pl-7 pr-8 text-sm font-light outline-none placeholder:text-[#7C7C75]"
              />
              {searchInput ? (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-[#7C7C75] hover:text-[#111111]"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-4 lg:justify-end">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-[#111111] lg:hidden"
              >
                <SlidersHorizontal size={15} strokeWidth={1.5} />
                Filters {activeFilterCount ? `(${activeFilterCount})` : ""}
              </button>

              <div className="relative">
                <button
                  onClick={() => setSortOpen((value) => !value)}
                  className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-[#111111]"
                >
                  Sort:{" "}
                  {SORT_OPTIONS.find((item) => item.value === selectedSort)
                    ?.label || "Newest"}
                  <ChevronDown
                    size={13}
                    strokeWidth={1.5}
                    className={sortOpen ? "rotate-180" : ""}
                  />
                </button>
                {sortOpen ? (
                  <div className="absolute right-0 top-8 z-20 min-w-40 border border-[#111111]/10 bg-[#FAF8F4] p-2 shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => applySort(option.value)}
                        className={`block w-full px-3 py-2 text-left text-[12px] ${
                          selectedSort === option.value
                            ? "text-[#111111]"
                            : "text-[#7C7C75]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <FilterPanel
                data={data}
                selectedCollection={selectedCollection}
                selectedSizes={selectedSizes}
                selectedColors={selectedColors}
                selectedAvailability={selectedAvailability}
                onCollectionChange={(value) =>
                  replaceParams(
                    (params) => {
                      if (value === "all") params.delete("collection");
                      else params.set("collection", value);
                    },
                    {
                      resetPage: true,
                      event: {
                        name: "filter_applied",
                        payload: { filter: "collection", value },
                      },
                    },
                  )
                }
                onSizeToggle={toggleSizeFilter}
                onColorToggle={toggleColorFilter}
                priceMin={priceMin}
                priceMax={priceMax}
                setPriceMin={setPriceMin}
                setPriceMax={setPriceMax}
                onPriceApply={applyPriceRange}
                onAvailabilityChange={(value) =>
                  replaceParams(
                    (params) => {
                      if (value === "all") params.delete("availability");
                      else params.set("availability", "in-stock");
                    },
                    {
                      resetPage: true,
                      event: {
                        name: "filter_applied",
                        payload: { filter: "availability", value },
                      },
                    },
                  )
                }
                clearVisible={hasAnyActiveFilter(currentParams)}
                onClear={clearAllFilters}
              />
            </div>
          </aside>

          <div>
            <div className="mb-10 flex items-center justify-between border-b border-[#111111]/10 pb-5">
              <p className="qutb-eyebrow text-[#7C7C75]">The Uniform</p>
              <p className="text-[12px] font-light text-[#7C7C75]">
                {data.total} {data.total === 1 ? "style" : "styles"}
              </p>
            </div>

            {data.products.length === 0 ? (
              <div className="grid min-h-[360px] place-items-center bg-[#F5F0E8] px-6 text-center">
                <div>
                  <p className="font-brand-serif text-4xl text-[#111111]">
                    No styles found.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="qutb-link-underline mt-6 text-[12px] uppercase tracking-[0.16em] text-[#111111]"
                  >
                    View All Products
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8 md:gap-y-20 ${
                  isPending ? "opacity-60" : ""
                }`}
              >
                {data.products.map((product) => (
                  <ProductTile
                    key={product.id}
                    product={product}
                    onQuickView={(item) => {
                      setQuickViewProduct(item);
                      trackEvent("view_item", {
                        name: item.name,
                        price: item.price,
                        id: item.id,
                      });
                    }}
                    onQuickAdd={addToCartQuick}
                    addedKey={addedKey}
                  />
                ))}
              </div>
            )}

            {data.totalPages > 1 ? (
              <div className="mt-16 flex items-center justify-center gap-2">
                {paginationItems.map((item, index) =>
                  item === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-[#7C7C75]">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() =>
                        replaceParams((params) => {
                          if (item === 1) params.delete("page");
                          else params.set("page", String(item));
                        })
                      }
                      className={`h-9 min-w-9 border px-3 text-[12px] ${
                        data.page === item
                          ? "border-[#111111] bg-[#111111] text-[#FAF8F4]"
                          : "border-[#111111]/15 text-[#111111]"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-24 bg-[#111111] px-6 py-24 text-[#FAF8F4] md:px-12">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="qutb-eyebrow text-[#FAF8F4]/35">
              Material Standard
            </p>
            <h2 className="mt-6 font-brand-serif text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.05]">
              Fabric Before Fashion.
            </h2>
          </div>
          <p className="max-w-md text-[16px] font-light leading-[1.9] text-[#FAF8F4]/60 lg:col-span-4 lg:col-start-8">
            Every QUTB piece begins with the fabric. We specify the GSM, weave,
            yarn count, and finish before designing a single line.
          </p>
        </div>
      </section>

      <AnimatePresence>
        {mobileFiltersOpen ? (
          <>
            <motion.button
              aria-label="Close filters"
              className="fixed inset-0 z-[55] bg-[#111111]/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed left-0 top-0 z-[56] h-full w-full max-w-[360px] overflow-y-auto bg-[#FAF8F4] p-6 text-[#111111]"
            >
              <div className="mb-8 flex items-center justify-between border-b border-[#111111]/10 pb-5">
                <p className="qutb-eyebrow text-[#7C7C75]">Filters</p>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              <FilterPanel
                data={data}
                selectedCollection={selectedCollection}
                selectedSizes={selectedSizes}
                selectedColors={selectedColors}
                selectedAvailability={selectedAvailability}
                onCollectionChange={(value) =>
                  replaceParams(
                    (params) => {
                      if (value === "all") params.delete("collection");
                      else params.set("collection", value);
                    },
                    { resetPage: true },
                  )
                }
                onSizeToggle={toggleSizeFilter}
                onColorToggle={toggleColorFilter}
                priceMin={priceMin}
                priceMax={priceMax}
                setPriceMin={setPriceMin}
                setPriceMax={setPriceMax}
                onPriceApply={applyPriceRange}
                onAvailabilityChange={(value) =>
                  replaceParams(
                    (params) => {
                      if (value === "all") params.delete("availability");
                      else params.set("availability", "in-stock");
                    },
                    { resetPage: true },
                  )
                }
                clearVisible={hasAnyActiveFilter(currentParams)}
                onClear={clearAllFilters}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {quickViewProduct ? (
          <QuickView
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onQuickAdd={addToCartQuick}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
