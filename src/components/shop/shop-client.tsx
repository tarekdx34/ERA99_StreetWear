"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, ChevronDown, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { formatEGP } from "@/lib/utils";
import type { ShopColorFacet, ShopDataResult, ShopProduct, ShopSort } from "@/lib/shop-data";

const SORT_OPTIONS: Array<{ value: ShopSort; label: string }> = [
  { value: "newest", label: "Newest First" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
];

const INTERACTION_LAYERS = {
  navigationZone: "z-10 pointer-events-auto",
  quickViewZone: "z-30 pointer-events-auto",
  quickAddZone: "z-30 pointer-events-none (container) + pointer-events-auto (buttons)",
} as const;

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
    if (i > 0 && prev && page - prev > 1) {
      withEllipsis.push("...");
    }
    withEllipsis.push(page);
  }

  return withEllipsis;
}

function getActiveFilterCount(params: URLSearchParams) {
  const keys = ["collection", "size", "color", "minPrice", "maxPrice", "availability", "sort", "search"];
  return keys.reduce((sum, key) => (params.get(key) ? sum + 1 : sum), 0);
}

function hasAnyActiveFilter(params: URLSearchParams) {
  return getActiveFilterCount(params) > 0;
}

function extractSizeOptions(product: ShopProduct) {
  const map = new Map<string, { stock: number; active: boolean }>();
  for (const variant of product.variants) {
    for (const size of variant.sizes) {
      const existing = map.get(size.size);
      if (!existing) {
        map.set(size.size, { stock: size.stock, active: size.active });
      } else {
        map.set(size.size, {
          stock: existing.stock + size.stock,
          active: existing.active || size.active,
        });
      }
    }
  }
  return Array.from(map.entries()).map(([size, data]) => ({ size, ...data }));
}

function findVariantForSize(product: ShopProduct, wantedSize: string) {
  for (const variant of product.variants) {
    const match = variant.sizes.find((slot) => slot.size === wantedSize && slot.active && slot.stock > 0);
    if (match) {
      return { variant, size: match };
    }
  }
  return null;
}

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-[1px] bg-[#F0EDE8]/20 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-[#080808] p-0">
          <div className="shop-skeleton relative aspect-[3/4] bg-[#111111]" />
          <div className="space-y-2 py-3">
            <div className="h-3 w-3/4 bg-[#111111]" />
            <div className="h-3 w-1/2 bg-[#111111]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="grid min-h-[420px] place-items-center border border-[#F0EDE8]/15 bg-[#080808] px-6 text-center">
      <div>
        <div className="font-blackletter text-[120px] leading-none text-[#F0EDE8]/6">0</div>
        <p className="text-base text-[#F0EDE8]/70">No products found</p>
        {search ? (
          <p className="mt-2 text-sm text-[#F0EDE8]/55">No results for "{search}"</p>
        ) : null}
        <div className="mt-6 flex flex-col items-center gap-2 text-sm uppercase tracking-[0.18em]">
          <button onClick={onClear} className="text-[#F0EDE8]">CLEAR FILTERS -&gt;</button>
          <button onClick={onClear} className="text-[#F0EDE8]">VIEW ALL PRODUCTS -&gt;</button>
        </div>
      </div>
    </div>
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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const [priceMin, setPriceMin] = useState(data.query.minPrice);
  const [priceMax, setPriceMax] = useState(data.query.maxPrice);

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    setSearchInput(data.query.search);
    setPriceMin(data.query.minPrice);
    setPriceMax(data.query.maxPrice);
  }, [data.query.search, data.query.minPrice, data.query.maxPrice]);

  useEffect(() => {
    trackEvent("page_view", {
      page_path: `${pathname}?${searchParams.toString()}`,
      page_title: "Shop - 6 STREET",
    });
  }, [trackEvent, pathname, searchParams]);

  const replaceParams = useCallback(
    (
      updater: (params: URLSearchParams) => void,
      options?: { resetPage?: boolean; event?: { name: string; payload?: Record<string, unknown> } },
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);

      if (options?.resetPage) {
        params.delete("page");
      }

      const next = params.toString();

      if (options?.event?.name) {
        trackEvent(options.event.name, options.event.payload || {});
      }

      startTransition(() => {
        router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams, trackEvent],
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

    if (next) {
      track("Search", { search_string: next });
    }
  }, [debouncedSearch, replaceParams, searchParams, track]);

  const currentParams = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);
  const selectedSizes = useMemo(() => (currentParams.get("size") || "").split(",").filter(Boolean), [currentParams]);
  const selectedColors = useMemo(() => (currentParams.get("color") || "").split(",").filter(Boolean), [currentParams]);
  const selectedCollection = currentParams.get("collection") || "all";
  const selectedSort = (currentParams.get("sort") as ShopSort) || "newest";
  const selectedAvailability = currentParams.get("availability") || "all";
  const activeFilterCount = getActiveFilterCount(currentParams);

  const quickViewProduct = useMemo(
    () => data.products.find((product) => product.id === quickViewProductId) || null,
    [data.products, quickViewProductId],
  );

  const quickViewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!quickViewProduct) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (sizeGuideOpen) {
          setSizeGuideOpen(false);
        } else {
          setQuickViewProductId(null);
        }
      }

      if (event.key === "Tab" && quickViewRef.current) {
        const focusable = quickViewRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [quickViewProduct, sizeGuideOpen]);

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
        const next = values.includes(size) ? values.filter((value) => value !== size) : [...values, size];
        if (next.length > 0) params.set("size", next.join(","));
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
        if (next.length > 0) params.set("color", next.join(","));
        else params.delete("color");
      },
      {
        resetPage: true,
        event: { name: "filter_applied", payload: { filter: "color", value: color.slug } },
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
          payload: { filter: "price", minPrice: Math.floor(priceMin), maxPrice: Math.floor(priceMax) },
        },
      },
    );
  };

  const clearAllFilters = () => {
    replaceParams((params) => {
      ["collection", "size", "color", "minPrice", "maxPrice", "sort", "search", "page", "availability"].forEach((key) =>
        params.delete(key),
      );
    });
    setSearchInput("");
  };

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
      setHoveredCard((current) => (current === product.id ? null : current));
    }, 2000);
  };

  const paginationItems = buildPagination(data.page, data.totalPages);
  const showingStart = data.total === 0 ? 0 : (data.page - 1) * data.perPage + 1;
  const showingEnd = Math.min(data.total, data.page * data.perPage);

  return (
    <main className="min-h-screen bg-[#080808] px-4 pb-24 pt-24 text-[#F0EDE8] md:px-8 md:pt-28">
      <style jsx global>{`
        .shop-skeleton::after {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 120%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(240, 237, 232, 0.04), transparent);
          animation: shop-shimmer 1.5s ease-out infinite;
        }
        @keyframes shop-shimmer {
          100% {
            left: 120%;
          }
        }
        @media (hover: none) {
          .shop-hover-quick-add {
            display: none;
          }
          .shop-touch-quick-add {
            display: block;
          }
        }
        @media (hover: hover) {
          .shop-touch-quick-add {
            display: none;
          }
        }
      `}</style>

      <section className="mx-auto max-w-[1480px]">
        <header>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-blackletter text-[48px] leading-none md:text-[72px]">SHOP</h1>
            <p className="pb-2 text-[11px] uppercase tracking-[0.3em] text-[#F0EDE8]/55">{data.total} PRODUCTS</p>
          </div>
          <div className="mt-4 h-px w-full bg-[#F0EDE8]/15" />

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F0EDE8]/45" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="SEARCH PRODUCTS..."
              className="h-[52px] w-full border-[0.5px] border-[#F0EDE8]/25 bg-[#0D0D0D] pl-11 pr-10 text-[12px] uppercase tracking-[0.24em] outline-none placeholder:text-[#F0EDE8]/45"
            />
            {searchInput ? (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F0EDE8]/55"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </header>

        <div className="mt-6 grid gap-6 md:grid-cols-[260px_minmax(0,1fr)] md:gap-6">
          <aside className="hidden h-screen sticky top-0 overflow-y-auto border-[0.5px] border-[#F0EDE8]/15 bg-[#0D0D0D] p-4 md:block">
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
                  { resetPage: true, event: { name: "filter_applied", payload: { filter: "collection", value } } },
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
                  { resetPage: true, event: { name: "filter_applied", payload: { filter: "availability", value } } },
                )
              }
              clearVisible={hasAnyActiveFilter(currentParams)}
              onClear={clearAllFilters}
            />
          </aside>

          <section>
            <div className="mb-3 flex items-center justify-end">
              <div className="relative">
                <button
                  onClick={() => setSortOpen((value) => !value)}
                  className="flex h-10 items-center gap-2 border-[0.5px] border-[#F0EDE8]/25 bg-[#111111] px-4 text-[11px] uppercase tracking-[0.22em]"
                >
                  SORT: {SORT_OPTIONS.find((item) => item.value === selectedSort)?.label?.toUpperCase() || "NEWEST"}
                  <ChevronDown className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {sortOpen ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-11 z-40 min-w-[240px] border-[0.5px] border-[#F0EDE8]/25 bg-[#111111]"
                    >
                      {SORT_OPTIONS.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => applySort(item.value)}
                          className={`block w-full px-4 py-3 text-left text-[11px] uppercase tracking-[0.2em] ${
                            item.value === selectedSort ? "text-[#F0EDE8]" : "text-[#F0EDE8]/65"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            {isPending ? <ProductSkeletonGrid /> : null}

            {!isPending && data.products.length === 0 ? (
              <EmptyState search={data.query.search} onClear={clearAllFilters} />
            ) : null}

            {!isPending && data.products.length > 0 ? (
              <div className="grid grid-cols-2 gap-[1px] bg-[#F0EDE8]/20 md:grid-cols-4">
                {data.products.map((product, index) => {
                  const sizeOptions = extractSizeOptions(product);
                  const inStockSizes = sizeOptions.filter((size) => size.active && size.stock > 0);
                  const singleQuickAdd = inStockSizes.length === 1;

                  return (
                    <motion.article
                      key={product.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                      onHoverStart={() => setHoveredCard(product.id)}
                      onHoverEnd={() => setHoveredCard((value) => (value === product.id ? null : value))}
                      className="bg-[#080808]"
                    >
                      <div className="relative">
                        <Link
                          href={`/product/${product.slug}`}
                          className={`${INTERACTION_LAYERS.navigationZone} block`}
                          onClick={() =>
                            trackEvent("select_item", {
                              name: product.name,
                              price: product.price,
                              collection: product.collection,
                            })
                          }
                        >
                          <div className="relative aspect-[3/4] overflow-hidden">
                            <Image
                              src={product.primaryImage}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className={`object-cover transition-opacity duration-400 ease-out ${
                                hoveredCard === product.id ? "opacity-0" : "opacity-100"
                              }`}
                            />
                            <Image
                              src={product.secondaryImage}
                              alt={`${product.name} secondary`}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className={`object-cover transition-opacity duration-400 ease-out ${
                                hoveredCard === product.id ? "opacity-100" : "opacity-0"
                              }`}
                            />

                            {product.newArrival ? (
                              <span className="absolute left-2 top-2 bg-[#080808] px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-[#F0EDE8]">
                                NEW
                              </span>
                            ) : null}

                            {product.soldOut ? (
                              <div className="absolute inset-0 grid place-items-center bg-[#080808]/72 text-[11px] uppercase tracking-[0.24em] text-[#F0EDE8]/65">
                                SOLD OUT
                              </div>
                            ) : null}

                            {!product.soldOut && product.lowStock ? (
                              <span className="absolute left-2 top-9 bg-[#080808] px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-[#8B0000]">
                                ALMOST GONE
                              </span>
                            ) : null}
                          </div>

                          <div className="bg-[#080808] px-3 py-3">
                            <h3 className="truncate text-sm font-medium text-[#F0EDE8]">{product.name}</h3>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[#F0EDE8]/55">
                              {product.collection.toUpperCase()}
                            </p>
                            <p className="mt-2 text-sm font-medium text-[#F0EDE8]">
                              {product.compareAtPrice ? (
                                <>
                                  <span className="mr-2 text-[#F0EDE8]/45 line-through">{formatEGP(product.compareAtPrice)}</span>
                                  <span className="text-[#8B0000]">{formatEGP(product.price)}</span>
                                </>
                              ) : (
                                formatEGP(product.price)
                              )}
                            </p>
                          </div>
                        </Link>

                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredCard === product.id ? 1 : 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          onClick={() => {
                            setQuickViewProductId(product.id);
                            setQuickViewImageIndex(0);
                            trackEvent("view_item", { name: product.name, price: product.price, id: product.id });
                          }}
                          className={`${INTERACTION_LAYERS.quickViewZone} absolute right-2 top-2 bg-[#080808]/80 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#F0EDE8]`}
                        >
                          QUICK VIEW
                        </motion.button>

                        <div className="shop-hover-quick-add pointer-events-none absolute inset-x-0 bottom-0 z-30 overflow-hidden">
                          <motion.div
                            initial={false}
                            animate={{ y: hoveredCard === product.id ? 0 : "100%" }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="pointer-events-auto h-12 bg-[#111111] px-2"
                          >
                            {singleQuickAdd ? (
                              <button
                                onClick={() => addToCartQuick(product, inStockSizes[0].size)}
                                className="h-full w-full border-[0.5px] border-[#F0EDE8]/80 text-[11px] uppercase tracking-[0.18em]"
                              >
                                ADD TO CART
                              </button>
                            ) : (
                              <div className="grid h-full grid-cols-5 gap-1 py-1">
                                {sizeOptions.map((size) => {
                                  const key = `${product.id}-${size.size}`;
                                  const disabled = !size.active || size.stock <= 0;
                                  return (
                                    <button
                                      key={size.size}
                                      disabled={disabled}
                                      onClick={() => addToCartQuick(product, size.size)}
                                      className={`border-[0.5px] text-[11px] uppercase tracking-[0.18em] ${
                                        disabled
                                          ? "border-[#F0EDE8]/20 text-[#F0EDE8]/35 line-through"
                                          : "border-[#F0EDE8]/80 text-[#F0EDE8]"
                                      }`}
                                    >
                                      {addedKey === key ? "✓ ADDED" : size.size}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </motion.div>
                        </div>

                        <div className="shop-touch-quick-add bg-[#111111] p-1">
                          <div className="grid h-10 grid-cols-5 gap-1">
                            {sizeOptions.map((size) => {
                              const key = `${product.id}-${size.size}`;
                              const disabled = !size.active || size.stock <= 0;
                              return (
                                <button
                                  key={size.size}
                                  disabled={disabled}
                                  onClick={() => addToCartQuick(product, size.size)}
                                  className={`border-[0.5px] text-[11px] uppercase tracking-[0.18em] ${
                                    disabled
                                      ? "border-[#F0EDE8]/20 text-[#F0EDE8]/35 line-through"
                                      : "border-[#F0EDE8]/80 text-[#F0EDE8]"
                                  }`}
                                >
                                  {addedKey === key ? "✓" : size.size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            ) : null}

            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={data.page <= 1}
                onClick={() =>
                  replaceParams((params) => {
                    params.set("page", String(Math.max(1, data.page - 1)));
                  })
                }
                className={`text-xs uppercase tracking-[0.2em] ${
                  data.page <= 1 ? "text-[#F0EDE8]/35" : "text-[#F0EDE8]/75"
                }`}
              >
                ← PREV
              </button>

              {paginationItems.map((item, index) =>
                item === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-[#F0EDE8]/45">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() =>
                      replaceParams((params) => {
                        params.set("page", String(item));
                      })
                    }
                    className={`h-8 w-8 border-[0.5px] text-xs ${
                      item === data.page
                        ? "border-[#F0EDE8] bg-[#F0EDE8] text-[#080808]"
                        : "border-[#F0EDE8]/70 text-[#F0EDE8]"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                disabled={data.page >= data.totalPages}
                onClick={() =>
                  replaceParams((params) => {
                    params.set("page", String(Math.min(data.totalPages, data.page + 1)));
                  })
                }
                className={`text-xs uppercase tracking-[0.2em] ${
                  data.page >= data.totalPages ? "text-[#F0EDE8]/35" : "text-[#F0EDE8]/75"
                }`}
              >
                NEXT →
              </button>
            </div>

            <p className="mt-3 text-center text-[12px] text-[#F0EDE8]/55">
              Showing {showingStart}-{showingEnd} of {data.total} products
            </p>
          </section>
        </div>

        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="fixed bottom-5 right-5 z-40 border-[0.5px] border-[#F0EDE8]/35 bg-[#111111] px-4 py-2 text-[11px] uppercase tracking-[0.22em] md:hidden"
        >
          FILTER {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
        </button>

        <AnimatePresence>
          {mobileFiltersOpen ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 z-50 bg-black/60"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed left-0 top-0 z-[55] h-full w-full max-w-[360px] overflow-y-auto bg-[#0D0D0D] p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#F0EDE8]/65">Filters</p>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <X className="h-5 w-5" />
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
                      { resetPage: true, event: { name: "filter_applied", payload: { filter: "collection", value } } },
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
                      { resetPage: true, event: { name: "filter_applied", payload: { filter: "availability", value } } },
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
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 z-[65] bg-black/75 backdrop-blur-[2px]"
                onClick={() => setQuickViewProductId(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-x-4 bottom-0 z-[66] max-h-[85vh] overflow-y-auto border-[0.5px] border-[#F0EDE8]/25 bg-[#111111] p-4 md:inset-x-[max(4vw,24px)] md:bottom-auto md:top-1/2 md:max-h-[86vh] md:w-[min(900px,92vw)] md:-translate-y-1/2 md:p-6"
                ref={quickViewRef}
                role="dialog"
                aria-modal="true"
              >
                <button className="absolute right-3 top-3" onClick={() => setQuickViewProductId(null)}>
                  <X className="h-5 w-5" />
                </button>

                <div className="grid gap-5 md:grid-cols-[55%_45%]">
                  <div>
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={quickViewProduct.images[quickViewImageIndex] || quickViewProduct.primaryImage}
                        alt={quickViewProduct.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 55vw"
                        className="object-cover"
                      />
                      <button
                        onClick={() =>
                          setQuickViewImageIndex((value) => (value - 1 + quickViewProduct.images.length) % quickViewProduct.images.length)
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 border-[0.5px] border-[#F0EDE8]/45 bg-[#080808]/80 p-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setQuickViewImageIndex((value) => (value + 1) % quickViewProduct.images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 border-[0.5px] border-[#F0EDE8]/45 bg-[#080808]/80 p-2"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 grid grid-cols-4 gap-1">
                      {quickViewProduct.images.slice(0, 4).map((image, index) => (
                        <button
                          key={image}
                          onClick={() => setQuickViewImageIndex(index)}
                          className={`relative aspect-[3/4] border-[0.5px] ${
                            index === quickViewImageIndex ? "border-[#F0EDE8]" : "border-[#F0EDE8]/25"
                          }`}
                        >
                          <Image src={image} alt={`${quickViewProduct.name} ${index + 1}`} fill sizes="120px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-blackletter text-[32px] leading-none">{quickViewProduct.name}</h2>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#F0EDE8]/55">
                      {quickViewProduct.collection}
                    </p>
                    <p className="mt-4 text-2xl font-semibold">
                      {quickViewProduct.compareAtPrice ? (
                        <>
                          <span className="mr-3 text-[#F0EDE8]/45 line-through">{formatEGP(quickViewProduct.compareAtPrice)}</span>
                          <span>{formatEGP(quickViewProduct.price)}</span>
                        </>
                      ) : (
                        formatEGP(quickViewProduct.price)
                      )}
                    </p>

                    <p className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#8B0000]">
                      <span className="inline-block h-2 w-2 animate-pulse bg-[#8B0000]" />
                      99 - LIMITED
                    </p>

                    <div className="mt-4 grid grid-cols-5 gap-1">
                      {extractSizeOptions(quickViewProduct).map((size) => {
                        const disabled = !size.active || size.stock <= 0;
                        return (
                          <button
                            key={size.size}
                            disabled={disabled}
                            onClick={() => addToCartQuick(quickViewProduct, size.size)}
                            className={`h-9 border-[0.5px] text-[11px] uppercase tracking-[0.18em] ${
                              disabled
                                ? "border-[#F0EDE8]/20 text-[#F0EDE8]/35 line-through"
                                : "border-[#F0EDE8]/75 text-[#F0EDE8]"
                            }`}
                          >
                            {size.size}
                          </button>
                        );
                      })}
                    </div>

                    <button className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#F0EDE8]/75" onClick={() => setSizeGuideOpen(true)}>
                      SIZE GUIDE →
                    </button>

                    <div className="mt-4 flex items-center gap-3">
                      <button className="border-[0.5px] border-[#F0EDE8]/45 p-2">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm">1</span>
                      <button className="border-[0.5px] border-[#F0EDE8]/45 p-2">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const firstAvailable = extractSizeOptions(quickViewProduct).find((size) => size.active && size.stock > 0);
                        if (firstAvailable) addToCartQuick(quickViewProduct, firstAvailable.size);
                      }}
                      className="mt-4 h-11 w-full bg-[#F0EDE8] text-[11px] font-bold uppercase tracking-[0.2em] text-[#080808]"
                    >
                      ADD TO CART
                    </button>

                    <Link
                      href={`/product/${quickViewProduct.slug}`}
                      onClick={() => setQuickViewProductId(null)}
                      className="mt-3 inline-block text-[11px] uppercase tracking-[0.2em] text-[#F0EDE8]"
                    >
                      VIEW FULL DETAILS →
                    </Link>

                    <p className="mt-4 text-sm text-[#F0EDE8]/65">{quickViewProduct.shortDescription}</p>

                    <div className="mt-4 space-y-1 text-[11px] uppercase tracking-[0.2em] text-[#F0EDE8]/65">
                      <p>Free Alex Delivery</p>
                      <p>Limited Stock</p>
                      <p>220GSM Heavyweight</p>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {sizeGuideOpen ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute inset-0 z-[3] bg-black/60"
                        onClick={() => setSizeGuideOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-1/2 top-1/2 z-[4] w-[min(520px,90vw)] -translate-x-1/2 -translate-y-1/2 border-[0.5px] border-[#F0EDE8]/25 bg-[#0D0D0D] p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-[0.2em]">Size Guide (cm)</p>
                          <button onClick={() => setSizeGuideOpen(false)}>
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <table className="w-full text-left text-[12px]">
                          <thead>
                            <tr className="text-[#F0EDE8]/55">
                              <th className="py-2">Size</th>
                              <th className="py-2">Chest</th>
                              <th className="py-2">Length</th>
                              <th className="py-2">Sleeve</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ["S", "58", "68", "22"],
                              ["M", "60", "70", "23"],
                              ["L", "62", "72", "24"],
                              ["XL", "64", "74", "25"],
                              ["XXL", "66", "76", "26"],
                            ].map((row) => (
                              <tr key={row[0]} className="border-t border-[#F0EDE8]/15">
                                {row.map((value) => (
                                  <td key={value} className="py-2">{value}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    </>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </section>
    </main>
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
    for (const size of ["S", "M", "L", "XL", "XXL"]) {
      map.set(size, data.availableSizes.includes(size));
    }
    return map;
  }, [data.availableSizes]);

  return (
    <div className="space-y-5">
      <section>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#F0EDE8]/55">Collection</p>
        <div className="mt-3 space-y-2 text-[12px] uppercase tracking-[0.2em]">
          <button
            onClick={() => onCollectionChange("all")}
            className={selectedCollection === "all" ? "text-[#F0EDE8]" : "text-[#F0EDE8]/55"}
          >
            All
          </button>
          {data.collections.map((item) => (
            <div key={item.slug}>
              <button
                onClick={() => onCollectionChange(item.slug)}
                className={selectedCollection === item.slug ? "text-[#F0EDE8]" : "text-[#F0EDE8]/55"}
              >
                {item.label}
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[#F0EDE8]/15" />

      <section>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#F0EDE8]/55">Size</p>
        <div className="mt-3 flex gap-2">
          {["S", "M", "L", "XL", "XXL"].map((size) => {
            const enabled = sizeAvailability.get(size);
            const selected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                disabled={!enabled}
                onClick={() => onSizeToggle(size)}
                className={`h-9 w-9 border-[0.5px] text-[11px] uppercase ${
                  selected
                    ? "border-[#F0EDE8] bg-[#F0EDE8] text-[#080808]"
                    : enabled
                      ? "border-[#F0EDE8]/55 text-[#F0EDE8]"
                      : "border-[#F0EDE8]/20 text-[#F0EDE8]/35 line-through"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </section>

      <div className="h-px bg-[#F0EDE8]/15" />

      <section>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#F0EDE8]/55">Color</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.colors.map((color) => {
            const selected = selectedColors.includes(color.slug);
            return (
              <motion.button
                key={color.slug}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={() => onColorToggle(color)}
                className="group relative"
              >
                <span
                  className={`block h-6 w-6 border-[0.5px] border-[#F0EDE8]/35 ${selected ? "ring-2 ring-[#F0EDE8]" : ""}`}
                  style={{ backgroundColor: color.hex }}
                />
                <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap bg-[#080808] px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-[#F0EDE8] group-hover:block">
                  {color.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <div className="h-px bg-[#F0EDE8]/15" />

      <section>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#F0EDE8]/55">Price</p>
        <p className="mt-2 text-[12px] text-[#F0EDE8]/75">
          {Math.floor(priceMin)} EGP - {Math.floor(priceMax)} EGP
        </p>

        <div className="relative mt-3 h-8">
          <div className="absolute top-3 h-[2px] w-full bg-[#1F1F1F]" />
          <div
            className="absolute top-3 h-[2px] bg-[#F0EDE8]"
            style={{
              left: `${((priceMin - data.minPriceBound) / (data.maxPriceBound - data.minPriceBound || 1)) * 100}%`,
              right: `${100 - ((priceMax - data.minPriceBound) / (data.maxPriceBound - data.minPriceBound || 1)) * 100}%`,
            }}
          />
          <input
            type="range"
            min={data.minPriceBound}
            max={data.maxPriceBound}
            value={priceMin}
            onChange={(event) => setPriceMin(Math.min(Number(event.target.value), priceMax))}
            onMouseUp={onPriceApply}
            onTouchEnd={onPriceApply}
            className="absolute h-8 w-full appearance-none bg-transparent"
          />
          <input
            type="range"
            min={data.minPriceBound}
            max={data.maxPriceBound}
            value={priceMax}
            onChange={(event) => setPriceMax(Math.max(Number(event.target.value), priceMin))}
            onMouseUp={onPriceApply}
            onTouchEnd={onPriceApply}
            className="absolute h-8 w-full appearance-none bg-transparent"
          />
        </div>
      </section>

      <div className="h-px bg-[#F0EDE8]/15" />

      <section>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#F0EDE8]/55">Availability</p>
        <div className="mt-3 space-y-2 text-[12px] uppercase tracking-[0.2em]">
          <button
            onClick={() => onAvailabilityChange("in-stock")}
            className={selectedAvailability === "in-stock" ? "text-[#F0EDE8]" : "text-[#F0EDE8]/55"}
          >
            In Stock
          </button>
          <div>
            <button
              onClick={() => onAvailabilityChange("all")}
              className={selectedAvailability === "all" ? "text-[#F0EDE8]" : "text-[#F0EDE8]/55"}
            >
              All
            </button>
          </div>
        </div>
      </section>

      {clearVisible ? (
        <button onClick={onClear} className="text-[11px] uppercase tracking-[0.25em] text-[#8B0000]">
          CLEAR ALL
        </button>
      ) : null}
    </div>
  );
}
