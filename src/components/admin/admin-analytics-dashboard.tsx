"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: any;
};

const PRIMARY = "#F0EDE8";
const OFFWHITE = "#F0EDE8";

function formatEGP(value: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[#F0EDE8]">{value}</p>
      {hint ? (
        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#F0EDE8]/55">
          {hint}
        </p>
      ) : null}
    </article>
  );
}

export function AdminAnalyticsDashboard({ data }: Props) {
  const [range, setRange] = useState<7 | 30 | 90>(30);

  const revenueSeries = useMemo(() => {
    return data.revenue.dailyRevenue.slice(-range);
  }, [data.revenue.dailyRevenue, range]);

  const statusBreakdown = (data.orders.statusBreakdown || []).map(
    (item: any, index: number) => ({
      ...item,
      fill: index % 2 === 0 ? PRIMARY : "#3A1111",
    }),
  );

  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-blackletter text-5xl">ANALYTICS</h2>
      </div>

      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
          Revenue
        </h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="All Time"
            value={formatEGP(data.revenue.totalAllTime)}
          />
          <MetricCard
            label="This Month"
            value={formatEGP(data.revenue.totalThisMonth)}
          />
          <MetricCard
            label="This Week"
            value={formatEGP(data.revenue.totalThisWeek)}
          />
          <MetricCard
            label="Month vs Last Month"
            value={`${data.revenue.monthVsLastMonthPercent.toFixed(1)}%`}
            hint={
              data.revenue.monthVsLastMonthPercent >= 0 ? "Growth" : "Decline"
            }
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
                Daily Revenue
              </p>
              <div className="flex items-center gap-2">
                {[7, 30, 90].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRange(item as 7 | 30 | 90)}
                    className={`border px-2 py-1 text-[11px] uppercase tracking-[0.14em] ${
                      range === item
                        ? "border-[#F0EDE8]/50 text-[#F0EDE8]"
                        : "border-[#F0EDE8]/20 text-[#F0EDE8]/55"
                    }`}
                  >
                    {item}D
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueSeries}>
                  <CartesianGrid stroke="#2b2b2b" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke={OFFWHITE}
                    tick={{ fill: OFFWHITE, fontSize: 11 }}
                  />
                  <YAxis
                    stroke={OFFWHITE}
                    tick={{ fill: OFFWHITE, fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0d0d0d",
                      border: "1px solid #2a2a2a",
                      color: OFFWHITE,
                    }}
                    formatter={(value) => formatEGP(Number(value || 0))}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={PRIMARY}
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Payment Method Revenue
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2">
                <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">
                  COD
                </span>
                <span>{formatEGP(data.revenue.byPaymentMethod.cod)}</span>
              </p>
              <p className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2">
                <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">
                  Online
                </span>
                <span>{formatEGP(data.revenue.byPaymentMethod.online)}</span>
              </p>
              <p className="flex items-center justify-between pt-2">
                <span className="uppercase tracking-[0.12em] text-[#F0EDE8]/65">
                  Average Order Value
                </span>
                <span>{formatEGP(data.revenue.averageOrderValue)}</span>
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
          Orders
        </h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="All Time"
            value={String(data.orders.totalAllTime)}
          />
          <MetricCard
            label="This Month"
            value={String(data.orders.totalThisMonth)}
          />
          <MetricCard
            label="This Week"
            value={String(data.orders.totalThisWeek)}
          />
          <MetricCard label="Today" value={String(data.orders.totalToday)} />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Order Status Breakdown
            </p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    outerRadius={90}
                    innerRadius={55}
                  >
                    {statusBreakdown.map((entry: any) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0d0d0d",
                      border: "1px solid #2a2a2a",
                      color: OFFWHITE,
                    }}
                  />
                  <Legend wrapperStyle={{ color: OFFWHITE, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#F0EDE8]/60">
              Cancellation: {data.orders.cancellationRate.toFixed(1)}% | Return:{" "}
              {data.orders.returnRate.toFixed(1)}%
            </p>
          </article>

          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Peak Ordering Hours
            </p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.orders.peakHours}>
                  <CartesianGrid stroke="#2b2b2b" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    stroke={OFFWHITE}
                    tick={{ fill: OFFWHITE, fontSize: 10 }}
                    interval={2}
                  />
                  <YAxis
                    stroke={OFFWHITE}
                    tick={{ fill: OFFWHITE, fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0d0d0d",
                      border: "1px solid #2a2a2a",
                      color: OFFWHITE,
                    }}
                  />
                  <Bar dataKey="orders" fill={PRIMARY} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Peak Ordering Days
            </p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.orders.peakDays}>
                  <CartesianGrid stroke="#2b2b2b" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke={OFFWHITE}
                    tick={{ fill: OFFWHITE, fontSize: 11 }}
                  />
                  <YAxis
                    stroke={OFFWHITE}
                    tick={{ fill: OFFWHITE, fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0d0d0d",
                      border: "1px solid #2a2a2a",
                      color: OFFWHITE,
                    }}
                  />
                  <Bar dataKey="orders" fill={PRIMARY} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
          Products
        </h3>
        <div className="grid gap-4 xl:grid-cols-3">
          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Best Selling
            </p>
            <ol className="mt-3 space-y-2 text-sm">
              {data.products.bestSelling.map((item: any, index: number) => (
                <li
                  key={`${item.productId}-${index}`}
                  className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2"
                >
                  <span>
                    #{index + 1} {item.name}
                  </span>
                  <span className="text-[#F0EDE8]/70">
                    {item.units} | {formatEGP(item.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          </article>

          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Worst Performing
            </p>
            <ol className="mt-3 space-y-2 text-sm">
              {data.products.worstPerforming.map((item: any, index: number) => (
                <li
                  key={`${item.productId}-${index}`}
                  className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2"
                >
                  <span>
                    #{index + 1} {item.name}
                  </span>
                  <span className="text-[#F0EDE8]/70">
                    {item.units} | {formatEGP(item.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          </article>

          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Size Distribution
            </p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.products.sizeDistribution}>
                  <CartesianGrid stroke="#2b2b2b" vertical={false} />
                  <XAxis
                    dataKey="size"
                    stroke={OFFWHITE}
                    tick={{ fill: OFFWHITE, fontSize: 11 }}
                  />
                  <YAxis
                    stroke={OFFWHITE}
                    tick={{ fill: OFFWHITE, fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0d0d0d",
                      border: "1px solid #2a2a2a",
                      color: OFFWHITE,
                    }}
                  />
                  <Bar dataKey="units" fill={PRIMARY} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Low Stock Alerts
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {data.products.lowStockAlerts.length === 0 ? (
                <li className="text-[#F0EDE8]/55">No low stock items.</li>
              ) : (
                data.products.lowStockAlerts.map((item: any) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2"
                  >
                    <span>{item.name}</span>
                    <span className="text-[#F0EDE8]/70">{item.stock}</span>
                  </li>
                ))
              )}
            </ul>
          </article>

          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Out of Stock
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {data.products.outOfStock.length === 0 ? (
                <li className="text-[#F0EDE8]/55">No out of stock items.</li>
              ) : (
                data.products.outOfStock.map((item: any) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2"
                  >
                    <span>{item.name}</span>
                    <span className="text-[#F0EDE8]/70">0</span>
                  </li>
                ))
              )}
            </ul>
            <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#F0EDE8]/60">
              Estimated lost revenue:{" "}
              {formatEGP(data.products.estimatedLostRevenue)}
            </p>
          </article>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
          Customers
        </h3>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          <MetricCard
            label="Unique Customers"
            value={String(data.customers.totalUnique)}
          />
          <MetricCard
            label="Repeat Customer Rate"
            value={`${data.customers.repeatCustomerRate.toFixed(1)}%`}
          />
          <MetricCard
            label="New This Month"
            value={String(data.customers.newCustomersThisMonth)}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4 xl:col-span-1">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Top Customers by Spend
            </p>
            <ol className="mt-3 space-y-2 text-sm">
              {data.customers.topCustomersBySpend.map(
                (item: any, index: number) => (
                  <li
                    key={`${item.phone}-${index}`}
                    className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2"
                  >
                    <span>
                      #{index + 1} {item.name}
                    </span>
                    <span className="text-[#F0EDE8]/70">
                      {formatEGP(item.spend)}
                    </span>
                  </li>
                ),
              )}
            </ol>
          </article>

          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4 xl:col-span-1">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Orders by Governorate
            </p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.customers.ordersByGovernorate}>
                  <CartesianGrid stroke="#2b2b2b" vertical={false} />
                  <XAxis
                    dataKey="governorate"
                    stroke={OFFWHITE}
                    tick={{ fill: OFFWHITE, fontSize: 11 }}
                  />
                  <YAxis
                    stroke={OFFWHITE}
                    tick={{ fill: OFFWHITE, fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0d0d0d",
                      border: "1px solid #2a2a2a",
                      color: OFFWHITE,
                    }}
                  />
                  <Bar dataKey="orders" fill={PRIMARY} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="border border-[#F0EDE8]/15 bg-[#111111] p-4 xl:col-span-1">
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              COD vs Online by Governorate
            </p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.customers.preferenceByGovernorate}>
                  <CartesianGrid stroke="#2b2b2b" vertical={false} />
                  <XAxis
                    dataKey="governorate"
                    stroke={OFFWHITE}
                    tick={{ fill: OFFWHITE, fontSize: 11 }}
                  />
                  <YAxis
                    stroke={OFFWHITE}
                    tick={{ fill: OFFWHITE, fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0d0d0d",
                      border: "1px solid #2a2a2a",
                      color: OFFWHITE,
                    }}
                  />
                  <Legend wrapperStyle={{ color: OFFWHITE, fontSize: 11 }} />
                  <Bar dataKey="cod" stackId="a" fill={PRIMARY} />
                  <Bar dataKey="online" stackId="a" fill="#513030" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>
      </section>
    </section>
  );
}
