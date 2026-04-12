"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ProductCard = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  totalStock: number;
  active: boolean;
  featured: boolean;
  newArrival: boolean;
};

type Props = {
  products: ProductCard[];
};

export function AdminProductsGrid({ products }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [stockDraft, setStockDraft] = useState<Record<string, string>>({});

  const updateQuick = (id: string, payload: Record<string, unknown>) => {
    startTransition(async () => {
      await fetch(`/api/admin/products/${id}/quick`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      router.refresh();
    });
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {products.map((item) => {
        const outOfStock = item.totalStock <= 0;
        const lowStock = item.totalStock > 0 && item.totalStock < 10;

        return (
          <article
            key={item.id}
            className={`relative overflow-hidden border bg-[#111111] ${
              lowStock ? "border-[#8B0000]/70 border-b-2" : "border-[#F0EDE8]/15"
            }`}
          >
            <div className="relative aspect-[4/5] overflow-hidden border-b border-[#F0EDE8]/10">
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              {outOfStock ? (
                <div className="absolute inset-0 grid place-items-center bg-black/60 text-xs uppercase tracking-[0.22em] text-[#F0EDE8]/80">
                  Out of Stock
                </div>
              ) : null}
            </div>

            <div className="space-y-3 p-3">
              <div>
                <h3 className="text-sm font-medium uppercase tracking-[0.12em]">{item.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#F0EDE8]/70">
                  {item.compareAtPrice ? (
                    <>
                      <span className="mr-2 line-through text-[#F0EDE8]/45">{item.compareAtPrice} EGP</span>
                      <span>{item.price} EGP</span>
                    </>
                  ) : (
                    <span>{item.price} EGP</span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#F0EDE8]/55">Stock</p>
                <button
                  type="button"
                  onClick={() => {
                    const current = stockDraft[item.id];
                    if (current === undefined) {
                      setStockDraft((prev) => ({ ...prev, [item.id]: String(item.totalStock) }));
                    }
                  }}
                  className="mt-1 text-lg font-semibold"
                >
                  {item.totalStock}
                </button>

                {stockDraft[item.id] !== undefined ? (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={stockDraft[item.id]}
                      onChange={(event) =>
                        setStockDraft((prev) => ({ ...prev, [item.id]: event.target.value }))
                      }
                      className="w-20 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-2 py-1 text-sm"
                      inputMode="numeric"
                    />
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        const next = Number(stockDraft[item.id]);
                        if (!Number.isFinite(next) || next < 0) return;
                        updateQuick(item.id, { totalStock: Math.floor(next) });
                        setStockDraft((prev) => {
                          const copy = { ...prev };
                          delete copy[item.id];
                          return copy;
                        });
                      }}
                      className="border border-[#F0EDE8]/20 px-2 py-1 text-[11px] uppercase tracking-[0.14em]"
                    >
                      Save
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] uppercase tracking-[0.12em]">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => updateQuick(item.id, { active: !item.active })}
                  className={`border px-2 py-2 ${
                    item.active ? "border-[#F0EDE8]/30 text-[#F0EDE8]" : "border-[#F0EDE8]/15 text-[#F0EDE8]/55"
                  }`}
                >
                  Active: {item.active ? "On" : "Off"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => updateQuick(item.id, { featured: !item.featured })}
                  className={`border px-2 py-2 ${
                    item.featured ? "border-[#F0EDE8]/30 text-[#F0EDE8]" : "border-[#F0EDE8]/15 text-[#F0EDE8]/55"
                  }`}
                >
                  Featured: {item.featured ? "On" : "Off"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => updateQuick(item.id, { newArrival: !item.newArrival })}
                  className={`col-span-2 border px-2 py-2 ${
                    item.newArrival ? "border-[#F0EDE8]/30 text-[#F0EDE8]" : "border-[#F0EDE8]/15 text-[#F0EDE8]/55"
                  }`}
                >
                  New Arrival: {item.newArrival ? "On" : "Off"}
                </button>
              </div>

              <Link
                href={`/admin/products/${item.id}/edit`}
                className="block border border-[#F0EDE8]/20 px-3 py-2 text-center text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/85 hover:border-[#F0EDE8]/45"
              >
                Edit
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
