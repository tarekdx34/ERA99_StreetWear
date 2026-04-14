"use client";

import { useState } from "react";

type Props = { data: any };

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#F0EDE8]">{value}</p>
      {hint && <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#F0EDE8]/55">{hint}</p>}
    </article>
  );
}

export function AdminCartAbandonment({ data }: Props) {
  const [sending, setSending] = useState<string | null>(null);

  const handleSendWhatsApp = async (phone: string, message: string) => {
    setSending(phone);
    try {
      // This would integrate with your existing WhatsApp admin notification system
      alert(`WhatsApp reminder would be sent to ${phone}: ${message}`);
    } catch {
      alert("Failed to send WhatsApp reminder");
    } finally {
      setSending(null);
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-blackletter text-4xl md:text-5xl">CART ABANDONMENT</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Cart Users" value={String(data.totalCartUsers)} />
        <MetricCard label="Purchasers" value={String(data.totalPurchasers)} />
        <MetricCard label="Abandoners" value={String(data.abandoners)} />
        <MetricCard label="Abandonment Rate" value={`${data.rate.toFixed(1)}%`} />
      </div>

      {data.recentAbandoners.length > 0 ? (
        <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
            Recent Abandoners (Last 7 Days) — {data.recentAbandoners.length} users
          </p>
          <div className="mt-4 max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F0EDE8]/15">
                  <th className="pb-2 uppercase tracking-[0.12em] text-[#F0EDE8]/55">User</th>
                  <th className="pb-2 uppercase tracking-[0.12em] text-[#F0EDE8]/55">Cart Value</th>
                  <th className="pb-2 uppercase tracking-[0.12em] text-[#F0EDE8]/55">Items</th>
                  <th className="pb-2 uppercase tracking-[0.12em] text-[#F0EDE8]/55">Last Active</th>
                  <th className="pb-2 uppercase tracking-[0.12em] text-[#F0EDE8]/55">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAbandoners.slice(0, 30).map((a: any, i: number) => {
                  const items = (a.data?.items as Array<any>) || [];
                  const totalItems = items.reduce((s: number, it: any) => s + (it.qty || 1), 0);
                  return (
                    <tr key={i} className="border-b border-[#F0EDE8]/10">
                      <td className="py-2 text-[#F0EDE8]/70">{a.userId || `anon...${a.sessionId?.slice(-6) || "unknown"}`}</td>
                      <td className="py-2 text-[#F0EDE8]/60">{a.value ? `${a.value} EGP` : "-"}</td>
                      <td className="py-2 text-[#F0EDE8]/60">{totalItems} items</td>
                      <td className="py-2 text-[#F0EDE8]/50">{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">
                        <button
                          disabled={sending === a.userId}
                          onClick={() =>
                            handleSendWhatsApp(
                              a.userId || "",
                              `Hi! You have ${totalItems} item(s) waiting in your cart. Complete your order now!`
                            )
                          }
                          className="border border-[#F0EDE8]/30 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#F0EDE8]/70 hover:border-[#F0EDE8]/60 disabled:opacity-40"
                        >
                          {sending === a.userId ? "Sending..." : "Send Reminder"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      ) : (
        <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
          <p className="text-sm text-[#F0EDE8]/55">No recent cart abandoners in the last 7 days.</p>
        </article>
      )}
    </section>
  );
}
