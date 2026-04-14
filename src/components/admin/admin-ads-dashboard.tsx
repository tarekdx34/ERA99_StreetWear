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

function formatEGP(value: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#F0EDE8]">{value}</p>
      {hint && <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#F0EDE8]/55">{hint}</p>}
    </article>
  );
}

export function AdminAdsDashboard({ data }: Props) {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-blackletter text-5xl">ADS PERFORMANCE</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Meta Events Sent" value={String(data.meta.total)} />
        <MetricCard label="Success Rate" value={`${data.meta.successRate.toFixed(1)}%`} />
        <MetricCard label="Ad-Attributed Purchases" value={String(data.attribution.purchaseFromAds)} />
        <MetricCard label="Ad Revenue" value={formatEGP(data.attribution.totalAdRevenue)} />
      </div>

      <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Meta Events by Day (30 Days)</p>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.meta.dailyMeta}>
              <CartesianGrid stroke="#2b2b2b" vertical={false} />
              <XAxis dataKey="label" stroke={PRIMARY} tick={{ fill: PRIMARY, fontSize: 10 }} />
              <YAxis stroke={PRIMARY} tick={{ fill: PRIMARY, fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: PRIMARY }} />
              <Legend wrapperStyle={{ color: PRIMARY, fontSize: 11 }} />
              <Bar dataKey="total" stackId="a" fill={PRIMARY} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Event Breakdown (30 Days)</p>
          <div className="mt-3 space-y-2 text-sm">
            {data.meta.breakdown.map((item: any) => (
              <div key={item.event} className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2">
                <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">{item.event}</span>
                <span>{item.count}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">Success / Fail</span>
              <span>
                <span className="text-green-400">{data.meta.successCount}</span> /{" "}
                <span className="text-red-400">{data.meta.failCount}</span>
              </span>
            </div>
          </div>
        </article>

        <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Revenue by Source</p>
          <div className="mt-3 space-y-2 text-sm">
            {data.attribution.revenueBySource.map((item: any) => (
              <div key={item.source} className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2">
                <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">{item.source}</span>
                <span>{formatEGP(item.revenue)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">Total</span>
              <span>{formatEGP(data.attribution.totalAdRevenue)}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
