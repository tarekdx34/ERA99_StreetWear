"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
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

const COLORS = [PRIMARY, "#3A1111", "#513030", "#7A5050", "#2b2b2b", "#444444", "#666666", "#888888"];

export function AdminMarketingDashboard({ data }: Props) {
  const [tab, setTab] = useState<"overview" | "sources" | "pages">("overview");

  const sourcePieData = useMemo(
    () =>
      data.attribution.sources.map((s: any, i: number) => ({
        ...s,
        fill: COLORS[i % COLORS.length],
      })),
    [data.attribution.sources],
  );

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-blackletter text-5xl">MARKETING</h2>
        <div className="flex gap-2">
          {(["overview", "sources", "pages"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border px-3 py-2 text-[11px] uppercase tracking-[0.14em] ${
                tab === t ? "border-[#F0EDE8]/50 text-[#F0EDE8]" : "border-[#F0EDE8]/20 text-[#F0EDE8]/55"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Events" value={String(data.events.total)} />
            <MetricCard label="Last 30 Days" value={String(data.events.last30Days)} />
            <MetricCard label="Last 7 Days" value={String(data.events.last7Days)} />
            <MetricCard label="Meta Events" value={String(data.meta.total)} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Event Breakdown (30 Days)</p>
              <div className="mt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.events.recentBreakdown}>
                    <CartesianGrid stroke="#2b2b2b" vertical={false} />
                    <XAxis dataKey="event" stroke={PRIMARY} tick={{ fill: PRIMARY, fontSize: 9 }} angle={-30} textAnchor="end" height={80} />
                    <YAxis stroke={PRIMARY} tick={{ fill: PRIMARY, fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: PRIMARY }} />
                    <Bar dataKey="count" fill={PRIMARY} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Traffic Sources</p>
              <div className="mt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourcePieData} dataKey="count" nameKey="source" outerRadius={90} innerRadius={55}>
                      {sourcePieData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: PRIMARY }} />
                    <Legend wrapperStyle={{ color: PRIMARY, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>

          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Meta CAPI Events</p>
            <div className="mt-3 space-y-2 text-sm">
              {data.meta.breakdown.map((item: any) => (
                <div key={item.event} className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2">
                  <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">{item.event}</span>
                  <span>{item.count}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2">
                <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">Success Rate</span>
                <span>{data.meta.successCount} / {data.meta.total} ({data.meta.total > 0 ? ((data.meta.successCount / data.meta.total) * 100).toFixed(1) : 0}%)</span>
              </div>
            </div>
          </article>
        </>
      )}

      {tab === "sources" && (
        <>
          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Traffic Sources</p>
            <div className="mt-3 space-y-2 text-sm">
              {data.attribution.sources.map((s: any) => (
                <div key={s.source} className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2">
                  <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">{s.source}</span>
                  <span>{s.count} events</span>
                </div>
              ))}
            </div>
          </article>

          {data.attribution.campaigns.length > 0 && (
            <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Campaigns</p>
              <div className="mt-3 space-y-2 text-sm">
                {data.attribution.campaigns.map((c: any) => (
                  <div key={c.campaign} className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2">
                    <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">{c.campaign}</span>
                    <span>{c.count} events</span>
                  </div>
                ))}
              </div>
            </article>
          )}
        </>
      )}

      {tab === "pages" && (
        <>
          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Top Pages</p>
            <div className="mt-3 space-y-2 text-sm">
              {data.pages.topPages.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2">
                  <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">{p.page}</span>
                  <span>{p.views} views</span>
                </div>
              ))}
            </div>
          </article>

          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Top Search Terms</p>
            <div className="mt-3 space-y-2 text-sm">
              {data.pages.topSearchTerms.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2">
                  <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">{s.term}</span>
                  <span>{s.count} searches</span>
                </div>
              ))}
            </div>
          </article>
        </>
      )}
    </section>
  );
}
