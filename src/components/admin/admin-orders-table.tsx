"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { ORDER_STATUSES, getAllowedOrderStatuses } from "@/lib/order-status";

type OrderRow = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  total: number;
  totalLabel: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

type Props = {
  orders: OrderRow[];
};

export function AdminOrdersTable({ orders }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] =
    useState<(typeof ORDER_STATUSES)[number]>("preparing");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [printing, setPrinting] = useState(false);

  const allIds = useMemo(() => orders.map((item) => item.id), [orders]);
  const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const bulkStatuses = useMemo(() => {
    const selectedOrders = orders.filter((order) => selectedIds.includes(order.id));
    if (selectedOrders.length === 0) return ORDER_STATUSES;

    return ORDER_STATUSES.filter((status) =>
      selectedOrders.every((order) =>
        (getAllowedOrderStatuses(order.paymentMethod) as readonly string[]).includes(
          status,
        ),
      ),
    );
  }, [orders, selectedIds]);

  const toggleOrder = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    setNotice(null);
  };

  const toggleAll = () => {
    setSelectedIds((current) =>
      current.length === allIds.length ? [] : allIds,
    );
    setNotice(null);
  };

  const runBulkUpdate = () => {
    if (selectedIds.length === 0) {
      setNotice("Select at least one order");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/orders/bulk-status", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderIds: selectedIds,
            orderStatus: bulkStatus,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || "Bulk update failed");
        }

        setNotice(`Updated ${selectedIds.length} order(s)`);
        setSelectedIds([]);
        router.refresh();
      } catch (error) {
        setNotice(
          error instanceof Error ? error.message : "Bulk update failed",
        );
      }
    });
  };

  useEffect(() => {
    if (!(bulkStatuses as readonly string[]).includes(bulkStatus)) {
      setBulkStatus(bulkStatuses[0] || "preparing");
    }
  }, [bulkStatus, bulkStatuses]);

  const escapeHtml = (value: string | null | undefined) => {
    const str = String(value ?? "");
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  };

  const parseItems = (items: unknown) => {
    if (!Array.isArray(items)) {
      return [] as Array<{
        name: string;
        color: string;
        size: string;
        qty: number;
        unitPrice: number;
        slug: string;
      }>;
    }

    return items
      .map((item) => {
        const row = item as any;
        return {
          name: String(row?.name ?? "Item"),
          color: String(row?.color ?? "-"),
          size: String(row?.size ?? "-"),
          qty: Number(row?.qty ?? row?.quantity ?? 1),
          unitPrice: Number(row?.unitPrice ?? row?.price ?? 0),
          slug: String(row?.slug ?? "-"),
        };
      })
      .filter((item) => item && item.name);
  };

  const openPrintWindow = async (ids: number[]) => {
    if (!ids.length) {
      setNotice("Select at least one order to print");
      return;
    }

    setPrinting(true);
    setNotice(null);

    try {
      // Open print page in new window
      const idsParam = ids.join(",");
      const printUrl = `/admin/print-orders?ids=${idsParam}`;
      const printWindow = window.open(printUrl, "_blank", "noopener,noreferrer,width=900,height=700");

      if (!printWindow) {
        setNotice("Pop-up blocked. Please allow pop-ups for this site.");
        setPrinting(false);
        return;
      }

      setNotice(`Opened ${ids.length} order(s) for printing — select "Save as PDF" in the print dialog`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setNotice(`Print failed: ${message}`);
      console.error("Print error:", error);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-2 border border-[#EDE9E0]/12 bg-[#080808] p-3">
        <button
          type="button"
          onClick={toggleAll}
          className="border border-[#EDE9E0]/25 px-3 py-2 text-xs uppercase tracking-[0.16em] hover:border-[#EDE9E0]/45"
        >
          {allSelected ? "Unselect all" : "Select all"}
        </button>

        <select
          value={bulkStatus}
          onChange={(event) =>
            setBulkStatus(event.target.value as (typeof ORDER_STATUSES)[number])
          }
          className="min-w-[220px] border border-[#EDE9E0]/20 bg-[#080808] px-3 py-2 text-xs uppercase tracking-[0.08em]"
        >
          {bulkStatuses.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={pending || selectedIds.length === 0}
          onClick={runBulkUpdate}
          className="border border-[#EDE9E0]/25 px-4 py-2 text-xs uppercase tracking-[0.16em] hover:border-[#EDE9E0]/45 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending
            ? "Updating..."
            : `Apply to selected (${selectedIds.length})`}
        </button>

        <button
          type="button"
          disabled={printing || selectedIds.length === 0}
          onClick={() => openPrintWindow(selectedIds)}
          className="border border-[#EDE9E0]/25 px-4 py-2 text-xs uppercase tracking-[0.16em] hover:border-[#EDE9E0]/45 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {printing ? "Opening..." : `Print / PDF (${selectedIds.length})`}
        </button>

        {notice ? (
          <p className="text-xs uppercase tracking-[0.12em] text-[#EDE9E0]/60">
            {notice}
          </p>
        ) : null}
      </div>

      <div className="mt-3 overflow-x-auto border border-[#EDE9E0]/12 bg-[#080808] p-3">
        <table className="min-w-full text-left text-sm md:min-w-[1220px]">
          <thead className="text-[11px] uppercase tracking-[0.18em] text-[#EDE9E0]/50">
            <tr>
              <th className="py-2 pr-3">Sel</th>
              <th className="py-2 pr-3">Order</th>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3">Phone</th>
              <th className="py-2 pr-3">City</th>
              <th className="py-2 pr-3">Total</th>
              <th className="py-2 pr-3">Payment</th>
              <th className="py-2 pr-3">Payment Status</th>
              <th className="py-2 pr-3">Order Status</th>
              <th className="py-2 pr-3">Actions</th>
              <th className="py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const selected = selectedIds.includes(order.id);
              return (
                <tr
                  key={order.id}
                  className="border-t border-[#EDE9E0]/10 align-top text-[#EDE9E0]/88"
                >
                  <td className="py-3 pr-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleOrder(order.id)}
                      aria-label={`Select ${order.orderNumber}`}
                      className="h-4 w-4 border border-[#EDE9E0]/30 bg-[#080808]"
                    />
                  </td>
                  <td className="py-3 pr-3 font-medium">{order.orderNumber}</td>
                  <td className="py-3 pr-3">{order.customerName}</td>
                  <td className="py-3 pr-3">{order.phone}</td>
                  <td className="py-3 pr-3">{order.city}</td>
                  <td className="py-3 pr-3">{order.totalLabel}</td>
                  <td className="py-3 pr-3">{order.paymentMethod}</td>
                  <td className="py-3 pr-3 uppercase tracking-[0.08em] text-[#EDE9E0]/70">
                    {order.paymentStatus.replaceAll("_", " ")}
                  </td>
                  <td className="py-3 pr-3">
                    <OrderStatusControl
                      orderId={order.id}
                      currentStatus={order.orderStatus}
                      paymentMethod={order.paymentMethod}
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <button
                      type="button"
                      onClick={() => openPrintWindow([order.id])}
                      className="border border-[#EDE9E0]/20 px-2 py-1 text-[10px] uppercase tracking-[0.14em] hover:border-[#EDE9E0]/45"
                    >
                      Print / PDF
                    </button>
                  </td>
                  <td className="py-3 text-[#EDE9E0]/55">
                    {new Date(order.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="py-10 text-center text-sm text-[#EDE9E0]/45"
                >
                  No orders match the current filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
