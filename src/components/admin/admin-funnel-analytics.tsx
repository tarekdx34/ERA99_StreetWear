"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = { data: any };

const PRIMARY = "#F0EDE8";

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#F0EDE8]">{value}</p>
      {hint && <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#F0EDE8]/55">{hint}</p>}
    </article>
  );
}

export function AdminFunnelAnalytics({ data }: Props) {
  const funnelSteps = data.funnel.steps;
  const counts = data.funnel.counts;

  // Build funnel chart data
  const chartData = funnelSteps.map((step: string) => {
    const found = counts.find((c: any) => c.step === step);
    return { step, count: found?.count || 0, recentCount: found?.recentCount || 0 };
  });

  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-blackletter text-4xl md:text-5xl">FUNNEL ANALYTICS</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Page Views" value={String(chartData[0]?.count || 0)} />
        <MetricCard label="Add to Cart" value={String(chartData.find((c: any) => c.step === "add_to_cart")?.count || 0)} />
        <MetricCard label="Checkout" value={String(chartData.find((c: any) => c.step === "begin_checkout")?.count || 0)} />
        <MetricCard label="Purchases" value={String(chartData.find((c: any) => c.step === "purchase")?.count || 0)} />
      </div>

      <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Funnel Drop-off (All Time)</p>
        <div className="mt-3 space-y-2 text-sm">
          {data.funnel.dropoffRates.map((d: any, i: number) => (
            <div key={i} className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2">
              <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">{d.step}</span>
              <div className="flex items-center gap-4">
                <span>{d.count}</span>
                {i > 0 && (
                  <span className="text-[#F0EDE8]/45">↓ {d.dropoffRate.toFixed(1)}% drop-off</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Funnel Visualization (30 Days)</p>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#2b2b2b" vertical={false} />
              <XAxis dataKey="step" stroke={PRIMARY} tick={{ fill: PRIMARY, fontSize: 9 }} angle={-30} textAnchor="end" height={80} />
              <YAxis stroke={PRIMARY} tick={{ fill: PRIMARY, fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: PRIMARY }} />
              <Legend wrapperStyle={{ color: PRIMARY, fontSize: 11 }} />
              <Bar dataKey="recentCount" fill={PRIMARY} name="Last 30 Days" />
              <Bar dataKey="count" fill="#513030" name="All Time" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Cart Abandonment</p>
          <p className="text-xl font-semibold text-[#F0EDE8]">{data.cartAbandonment.rate.toFixed(1)}%</p>
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#F0EDE8]/55">
          {data.cartAbandonment.abandoners} abandoners out of {data.cartAbandonment.totalCartUsers} cart users
        </p>

        {data.cartAbandonment.recentAbandoners.length > 0 && (
          <div className="mt-4 max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F0EDE8]/15">
                  <th className="pb-2 uppercase tracking-[0.12em] text-[#F0EDE8]/55">User</th>
                  <th className="pb-2 uppercase tracking-[0.12em] text-[#F0EDE8]/55">Page</th>
                  <th className="pb-2 uppercase tracking-[0.12em] text-[#F0EDE8]/55">Value</th>
                  <th className="pb-2 uppercase tracking-[0.12em] text-[#F0EDE8]/55">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.cartAbandonment.recentAbandoners.slice(0, 20).map((a: any, i: number) => (
                  <tr key={i} className="border-b border-[#F0EDE8]/10">
                    <td className="py-2 text-[#F0EDE8]/70">{a.userId || `anon...${a.sessionId?.slice(-6) || "unknown"}`}</td>
                    <td className="py-2 text-[#F0EDE8]/60">{a.page || "-"}</td>
                    <td className="py-2 text-[#F0EDE8]/60">{a.value ? `${a.value} EGP` : "-"}</td>
                    <td className="py-2 text-[#F0EDE8]/50">{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}
