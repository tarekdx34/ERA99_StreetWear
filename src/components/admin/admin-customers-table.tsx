"use client";

import { useMemo, useState } from "react";

type Customer = {
  name: string;
  phone: string;
  governorate: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  averageOrderValue: number;
  preferredPayment: string;
  sizesOrdered: string;
  addresses: string[];
  notes: string[];
  orderHistory: Array<{
    orderId: number;
    orderNumber: string;
    createdAt: string;
    total: number;
    paymentMethod: string;
    governorate: string;
    city: string;
    address: string;
  }>;
};

type Props = {
  customers: Customer[];
};

type SortKey = "name" | "phone" | "governorate" | "orders" | "totalSpent" | "lastOrder";

function formatEGP(value: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function AdminCustomersTable({ customers }: Props) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("totalSpent");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const rows = customers.filter((item) => {
      if (!q) return true;
      return item.name.toLowerCase().includes(q) || item.phone.toLowerCase().includes(q);
    });

    rows.sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      const av = a[sortBy];
      const bv = b[sortBy];

      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * direction;
      }

      return String(av).localeCompare(String(bv)) * direction;
    });

    return rows;
  }, [customers, query, sortBy, sortDirection]);

  const selected = filtered.find((item) => item.phone === selectedPhone) || null;

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(key);
    setSortDirection("desc");
  };

  const exportCsv = () => {
    const header = ["Name", "Phone", "Governorate", "Orders", "Total Spent EGP", "Last Order"];
    const rows = filtered.map((item) => [
      item.name,
      item.phone,
      item.governorate,
      String(item.orders),
      String(Math.round(item.totalSpent)),
      new Date(item.lastOrder).toISOString(),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((col) => `"${String(col).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-blackletter text-5xl">CUSTOMERS</h2>
        <button
          type="button"
          onClick={exportCsv}
          className="border border-[#F0EDE8]/25 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/85 hover:border-[#F0EDE8]/45"
        >
          Export CSV
        </button>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search name or phone"
        className="w-full border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2 text-sm"
      />

      <div className="overflow-x-auto border border-[#F0EDE8]/15 bg-[#111111] p-3">
        <table className="min-w-[1100px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.16em] text-[#F0EDE8]/55">
            <tr>
              <th className="py-2 pr-3"><button type="button" onClick={() => toggleSort("name")}>Name</button></th>
              <th className="py-2 pr-3"><button type="button" onClick={() => toggleSort("phone")}>Phone</button></th>
              <th className="py-2 pr-3"><button type="button" onClick={() => toggleSort("governorate")}>Governorate</button></th>
              <th className="py-2 pr-3"><button type="button" onClick={() => toggleSort("orders")}>Orders</button></th>
              <th className="py-2 pr-3"><button type="button" onClick={() => toggleSort("totalSpent")}>Total Spent EGP</button></th>
              <th className="py-2 pr-3"><button type="button" onClick={() => toggleSort("lastOrder")}>Last Order</button></th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.phone} className="border-t border-[#F0EDE8]/10">
                <td className="py-3 pr-3">{customer.name}</td>
                <td className="py-3 pr-3">{customer.phone}</td>
                <td className="py-3 pr-3">{customer.governorate}</td>
                <td className="py-3 pr-3">{customer.orders}</td>
                <td className="py-3 pr-3">{formatEGP(customer.totalSpent)}</td>
                <td className="py-3 pr-3">{new Date(customer.lastOrder).toLocaleDateString("en-GB")}</td>
                <td className="py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPhone(customer.phone)}
                    className="border border-[#F0EDE8]/20 px-3 py-1 text-xs uppercase tracking-[0.14em]"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <aside className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-[0.16em] text-[#F0EDE8]/75">Customer Detail</h3>
            <button type="button" onClick={() => setSelectedPhone(null)} className="border border-[#F0EDE8]/20 px-2 py-1 text-xs uppercase">Close</button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p><span className="text-[#F0EDE8]/55">Name:</span> {selected.name}</p>
              <p><span className="text-[#F0EDE8]/55">Phone:</span> {selected.phone}</p>
              <p><span className="text-[#F0EDE8]/55">Total spent:</span> {formatEGP(selected.totalSpent)}</p>
              <p><span className="text-[#F0EDE8]/55">Average order value:</span> {formatEGP(selected.averageOrderValue)}</p>
              <p><span className="text-[#F0EDE8]/55">Preferred payment:</span> {selected.preferredPayment}</p>
              <p><span className="text-[#F0EDE8]/55">Sizes ordered:</span> {selected.sizesOrdered || "-"}</p>
              <a
                href={`https://wa.me/2${selected.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block border border-[#F0EDE8]/20 px-3 py-1 text-xs uppercase tracking-[0.14em]"
              >
                WhatsApp
              </a>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#F0EDE8]/55">Addresses Used</p>
              <ul className="mt-2 space-y-1 text-sm">
                {selected.addresses.map((address) => (
                  <li key={address} className="border-b border-[#F0EDE8]/10 pb-1">{address}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[#F0EDE8]/55">Order History</p>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-[0.14em] text-[#F0EDE8]/55">
                  <tr>
                    <th className="py-2 pr-3">Order</th>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Total</th>
                    <th className="py-2 pr-3">Payment</th>
                    <th className="py-2">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.orderHistory.map((order) => (
                    <tr key={order.orderId} className="border-t border-[#F0EDE8]/10">
                      <td className="py-2 pr-3">{order.orderNumber}</td>
                      <td className="py-2 pr-3">{new Date(order.createdAt).toLocaleString("en-GB")}</td>
                      <td className="py-2 pr-3">{formatEGP(order.total)}</td>
                      <td className="py-2 pr-3">{order.paymentMethod}</td>
                      <td className="py-2">{order.governorate} - {order.city} - {order.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[#F0EDE8]/55">Notes</p>
            {selected.notes.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {selected.notes.map((note, index) => (
                  <li key={`${selected.phone}-note-${index}`}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-[#F0EDE8]/55">No notes.</p>
            )}
          </div>
        </aside>
      ) : null}
    </section>
  );
}
