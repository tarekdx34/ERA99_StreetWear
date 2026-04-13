"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OrderStatusControl } from "@/components/admin/order-status-control";

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

const BULK_STATUSES = [
  "pending_confirmation",
  "pending_payment",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "payment_failed",
  "cancelled",
] as const;

export function AdminOrdersTable({ orders }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] =
    useState<(typeof BULK_STATUSES)[number]>("preparing");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [printing, setPrinting] = useState(false);

  const allIds = useMemo(() => orders.map((item) => item.id), [orders]);
  const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;

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

  const escapeHtml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(value);

  const parseItems = (items: unknown) => {
    if (!Array.isArray(items)) return [] as Array<{ name: string; size: string; qty: number; unitPrice: number }>;

    return items
      .map((item) => {
        const row = item as any;
        return {
          name: String(row?.name || "Item"),
          size: String(row?.size || "-"),
          qty: Number(row?.qty || row?.quantity || 1),
          unitPrice: Number(row?.unitPrice || row?.price || 0),
        };
      })
      .filter((item) => item.name);
  };

  const buildPrintHtml = (printOrders: any[]) => {
    const sections = printOrders
      .map((order) => {
        const items = parseItems(order.items);
        const rows = items
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.size)}</td>
                <td>${item.qty}</td>
                <td>${escapeHtml(formatCurrency(item.unitPrice))}</td>
                <td>${escapeHtml(formatCurrency(item.unitPrice * item.qty))}</td>
              </tr>`,
          )
          .join("");

        return `
          <section class="print-order">
            <h1>Order ${escapeHtml(order.orderNumber)}</h1>
            <p><strong>Created:</strong> ${new Date(order.createdAt).toLocaleString("en-GB")}</p>
            <p><strong>Customer:</strong> ${escapeHtml(order.customerName)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(order.phone)}</p>
            <p><strong>Address:</strong> ${escapeHtml(order.governorate)}, ${escapeHtml(order.city)}, ${escapeHtml(order.address)}${order.building ? `, ${escapeHtml(order.building)}` : ""}</p>
            <p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod)} (${escapeHtml(order.paymentStatus)})</p>
            <p><strong>Status:</strong> ${escapeHtml(order.orderStatus)}</p>
            ${order.notes ? `<p><strong>Notes:</strong> ${escapeHtml(String(order.notes))}</p>` : ""}

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                ${rows || '<tr><td colspan="5">No items</td></tr>'}
              </tbody>
            </table>

            <div class="totals">
              <p><strong>Subtotal:</strong> ${escapeHtml(formatCurrency(Number(order.subtotal || 0)))}</p>
              <p><strong>Delivery:</strong> ${escapeHtml(formatCurrency(Number(order.deliveryFee || 0)))}</p>
              <p><strong>Total:</strong> ${escapeHtml(formatCurrency(Number(order.total || 0)))}</p>
            </div>
          </section>
        `;
      })
      .join("");

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Order Print</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
            .print-order { page-break-after: always; margin-bottom: 30px; }
            .print-order:last-child { page-break-after: auto; }
            h1 { margin: 0 0 12px; font-size: 22px; }
            p { margin: 4px 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f2f2f2; }
            .totals { margin-top: 12px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${sections}
        </body>
      </html>
    `;
  };

  const printOrders = async (ids: number[]) => {
    if (!ids.length) {
      setNotice("Select at least one order to print");
      return;
    }

    setPrinting(true);
    setNotice(null);

    try {
      const res = await fetch("/api/admin/orders/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: ids }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Unable to load order print data");
      }

      const payload = await res.json();
      const printableOrders = Array.isArray(payload?.orders) ? payload.orders : [];
      if (!printableOrders.length) {
        throw new Error("No printable orders found");
      }

      const printWindow = window.open("", "_blank", "noopener,noreferrer");
      if (!printWindow) {
        throw new Error("Pop-up blocked. Please allow pop-ups and try again.");
      }

      printWindow.document.open();
      printWindow.document.write(buildPrintHtml(printableOrders));
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      setNotice(`Prepared ${printableOrders.length} order(s) for printing`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Print failed");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-2 border border-[#F0EDE8]/12 bg-[#111111] p-3">
        <button
          type="button"
          onClick={toggleAll}
          className="border border-[#F0EDE8]/25 px-3 py-2 text-xs uppercase tracking-[0.16em] hover:border-[#F0EDE8]/45"
        >
          {allSelected ? "Unselect all" : "Select all"}
        </button>

        <select
          value={bulkStatus}
          onChange={(event) =>
            setBulkStatus(event.target.value as (typeof BULK_STATUSES)[number])
          }
          className="min-w-[220px] border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2 text-xs uppercase tracking-[0.08em]"
        >
          {BULK_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={pending || selectedIds.length === 0}
          onClick={runBulkUpdate}
          className="border border-[#F0EDE8]/25 px-4 py-2 text-xs uppercase tracking-[0.16em] hover:border-[#F0EDE8]/45 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending
            ? "Updating..."
            : `Apply to selected (${selectedIds.length})`}
        </button>

        <button
          type="button"
          disabled={printing || selectedIds.length === 0}
          onClick={() => printOrders(selectedIds)}
          className="border border-[#F0EDE8]/25 px-4 py-2 text-xs uppercase tracking-[0.16em] hover:border-[#F0EDE8]/45 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {printing ? "Preparing print..." : `Print selected (${selectedIds.length})`}
        </button>

        {notice ? (
          <p className="text-xs uppercase tracking-[0.12em] text-[#F0EDE8]/60">
            {notice}
          </p>
        ) : null}
      </div>

      <div className="mt-3 overflow-x-auto border border-[#F0EDE8]/12 bg-[#111111] p-3">
        <table className="min-w-[1220px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/50">
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
                  className="border-t border-[#F0EDE8]/10 align-top text-[#F0EDE8]/88"
                >
                  <td className="py-3 pr-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleOrder(order.id)}
                      aria-label={`Select ${order.orderNumber}`}
                      className="h-4 w-4 border border-[#F0EDE8]/30 bg-[#111111]"
                    />
                  </td>
                  <td className="py-3 pr-3 font-medium">{order.orderNumber}</td>
                  <td className="py-3 pr-3">{order.customerName}</td>
                  <td className="py-3 pr-3">{order.phone}</td>
                  <td className="py-3 pr-3">{order.city}</td>
                  <td className="py-3 pr-3">{order.totalLabel}</td>
                  <td className="py-3 pr-3">{order.paymentMethod}</td>
                  <td className="py-3 pr-3 uppercase tracking-[0.08em] text-[#F0EDE8]/70">
                    {order.paymentStatus.replaceAll("_", " ")}
                  </td>
                  <td className="py-3 pr-3">
                    <OrderStatusControl
                      orderId={order.id}
                      currentStatus={order.orderStatus}
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <button
                      type="button"
                      onClick={() => printOrders([order.id])}
                      className="border border-[#F0EDE8]/20 px-2 py-1 text-[10px] uppercase tracking-[0.14em] hover:border-[#F0EDE8]/45"
                    >
                      Print Order
                    </button>
                  </td>
                  <td className="py-3 text-[#F0EDE8]/55">
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
                  className="py-10 text-center text-sm text-[#F0EDE8]/45"
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
