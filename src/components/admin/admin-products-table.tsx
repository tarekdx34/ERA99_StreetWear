"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sizes } from "@/lib/products";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  color: string;
  price: number;
  stockBySize: Record<string, boolean>;
  hidden: boolean;
};

type Props = {
  products: ProductRow[];
};

type RowState = {
  price: string;
  hidden: boolean;
  stockBySize: Record<string, boolean>;
  notice: string;
};

export function AdminProductsTable({ products }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const initialState = useMemo(() => {
    const map: Record<string, RowState> = {};
    for (const item of products) {
      map[item.id] = {
        price: String(item.price),
        hidden: item.hidden,
        stockBySize: { ...item.stockBySize },
        notice: "",
      };
    }
    return map;
  }, [products]);

  const [rows, setRows] = useState<Record<string, RowState>>(initialState);

  const setRow = (id: string, update: Partial<RowState>) => {
    setRows((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...update,
      },
    }));
  };

  const saveRow = (id: string) => {
    const row = rows[id];
    if (!row) return;

    const parsedPrice = Number(row.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setRow(id, { notice: "Invalid price" });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            price: parsedPrice,
            hidden: row.hidden,
            stockBySize: row.stockBySize,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || "Save failed");
        }

        setRow(id, { notice: "Saved" });
        router.refresh();
      } catch (error) {
        setRow(id, {
          notice: error instanceof Error ? error.message : "Save failed",
        });
      }
    });
  };

  return (
    <div className="mt-6 overflow-x-auto border border-[#F0EDE8]/12 bg-[#111111] p-3">
      <table className="min-w-[1200px] text-left text-sm">
        <thead className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/50">
          <tr>
            <th className="py-2 pr-3">Product</th>
            <th className="py-2 pr-3">Slug</th>
            <th className="py-2 pr-3">Price (EGP)</th>
            <th className="py-2 pr-3">Visibility</th>
            <th className="py-2 pr-3">Stock by Size</th>
            <th className="py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item) => {
            const row = rows[item.id];
            return (
              <tr key={item.id} className="border-t border-[#F0EDE8]/10 align-top text-[#F0EDE8]/88">
                <td className="py-3 pr-3">
                  <p className="font-medium">{item.name} - {item.color}</p>
                </td>
                <td className="py-3 pr-3 text-xs text-[#F0EDE8]/60">{item.slug}</td>
                <td className="py-3 pr-3">
                  <input
                    value={row?.price || ""}
                    onChange={(event) => setRow(item.id, { price: event.target.value, notice: "" })}
                    className="w-28 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-2 py-1"
                    inputMode="numeric"
                  />
                </td>
                <td className="py-3 pr-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs uppercase tracking-[0.12em]">
                    <input
                      type="checkbox"
                      checked={!row?.hidden}
                      onChange={(event) => setRow(item.id, { hidden: !event.target.checked, notice: "" })}
                    />
                    {row?.hidden ? "Hidden" : "Visible"}
                  </label>
                </td>
                <td className="py-3 pr-3">
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <label
                        key={`${item.id}-${size}`}
                        className="inline-flex items-center gap-1 border border-[#F0EDE8]/15 px-2 py-1 text-[11px] uppercase tracking-[0.12em]"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(row?.stockBySize?.[size])}
                          onChange={(event) =>
                            setRow(item.id, {
                              stockBySize: {
                                ...(row?.stockBySize || {}),
                                [size]: event.target.checked,
                              },
                              notice: "",
                            })
                          }
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => saveRow(item.id)}
                      className="border border-[#F0EDE8]/25 px-3 py-1 text-[11px] uppercase tracking-[0.14em] hover:border-[#F0EDE8]/45 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {pending ? "Saving..." : "Save"}
                    </button>
                    {row?.notice ? <span className="text-[11px] text-[#F0EDE8]/60">{row.notice}</span> : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
