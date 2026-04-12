import Link from "next/link";

type FeedItem = {
  id: string;
  type: "order" | "payment" | "inventory" | "security";
  title: string;
  subtitle: string;
  at: string;
  href?: string;
};

type Props = {
  items: FeedItem[];
};

const typeClassMap: Record<FeedItem["type"], string> = {
  order: "border-[#F0EDE8]/25 bg-[#171717]",
  payment: "border-[#8B0000]/45 bg-[#8B0000]/10",
  inventory: "border-[#F0EDE8]/25 bg-[#171717]",
  security: "border-[#3a3a3a] bg-[#121212]",
};

const typeLabelMap: Record<FeedItem["type"], string> = {
  order: "ORDER",
  payment: "PAYMENT",
  inventory: "INVENTORY",
  security: "SECURITY",
};

export function AdminActivityFeed({ items }: Props) {
  return (
    <section className="mt-8 border border-[#F0EDE8]/12 bg-[#111111] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.22em] text-[#F0EDE8]/75">
          Activity Feed
        </h2>
        <p className="text-[11px] uppercase tracking-[0.14em] text-[#F0EDE8]/50">
          Latest events
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-[#F0EDE8]/55">No recent activity.</p>
        ) : (
          items.map((item) => {
            const body = (
              <div className={`border p-3 ${typeClassMap[item.type]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">
                      {typeLabelMap[item.type]}
                    </p>
                    <p className="mt-1 text-sm text-[#F0EDE8]">{item.title}</p>
                    <p className="mt-1 text-xs text-[#F0EDE8]/60">
                      {item.subtitle}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-[11px] text-[#F0EDE8]/45">
                    {item.at}
                  </p>
                </div>
              </div>
            );

            if (!item.href) return <div key={item.id}>{body}</div>;

            return (
              <Link
                key={item.id}
                href={item.href}
                className="block transition-opacity hover:opacity-90"
              >
                {body}
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
