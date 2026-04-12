import Link from "next/link";

type AlertSeverity = "critical" | "warning" | "info";

export type DashboardAlert = {
  id: string;
  label: string;
  value: string;
  detail: string;
  severity: AlertSeverity;
  href?: string;
};

export type DashboardRecommendation = {
  id: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
};

type Props = {
  alerts: DashboardAlert[];
  recommendations: DashboardRecommendation[];
};

const severityClassMap: Record<AlertSeverity, string> = {
  critical: "border-[#8B0000]/65 bg-[#8B0000]/12",
  warning: "border-[#F0EDE8]/30 bg-[#1A1A1A]",
  info: "border-[#F0EDE8]/18 bg-[#151515]",
};

const severityTextMap: Record<AlertSeverity, string> = {
  critical: "CRITICAL",
  warning: "WARNING",
  info: "INFO",
};

export function AdminDashboardInsights({ alerts, recommendations }: Props) {
  return (
    <section className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <article className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.22em] text-[#F0EDE8]/75">Smart Alerts</h2>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#F0EDE8]/50">Rule-based</p>
        </div>

        <div className="mt-3 space-y-2">
          {alerts.map((alert) => {
            const body = (
              <div className={`border p-3 ${severityClassMap[alert.severity]}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#F0EDE8]/55">{alert.label}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#F0EDE8]/45">{severityTextMap[alert.severity]}</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-[#F0EDE8]">{alert.value}</p>
                <p className="mt-1 text-xs text-[#F0EDE8]/62">{alert.detail}</p>
              </div>
            );

            if (!alert.href) return <div key={alert.id}>{body}</div>;

            return (
              <Link key={alert.id} href={alert.href} className="block transition-opacity hover:opacity-90">
                {body}
              </Link>
            );
          })}
        </div>
      </article>

      <article className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
        <h2 className="text-xs uppercase tracking-[0.22em] text-[#F0EDE8]/75">Recommended Actions</h2>
        <div className="mt-3 space-y-3">
          {recommendations.map((item) => (
            <div key={item.id} className="border border-[#F0EDE8]/14 bg-[#151515] p-3">
              <p className="text-sm text-[#F0EDE8]">{item.title}</p>
              <p className="mt-1 text-xs text-[#F0EDE8]/60">{item.description}</p>
              <Link
                href={item.href}
                className="mt-3 inline-block text-[11px] uppercase tracking-[0.16em] text-[#F0EDE8]/76 transition-colors hover:text-[#F0EDE8]"
              >
                {item.actionLabel}
              </Link>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}