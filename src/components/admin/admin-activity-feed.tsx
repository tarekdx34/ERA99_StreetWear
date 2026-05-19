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
  order: "border-[#EDE9E0]/25 bg-[#080808]",
  payment: "border-[#8B0000]/45 bg-[#8B0000]/10",
  inventory: "border-[#EDE9E0]/25 bg-[#080808]",
  security: "border-[#555555] bg-[#080808]",
};

const typeLabelMap: Record<FeedItem["type"], string> = {
  order: "ORDER",
  payment: "PAYMENT",
  inventory: "INVENTORY",
  security: "SECURITY",
};

export function AdminActivityFeed({ items }: Props) {
  return (
    <section className="mt-8 border border-[#EDE9E0]/12 bg-[#080808] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.22em] text-[#EDE9E0]/75">
          Activity Feed
        </h2>
        <p className="text-[11px] uppercase tracking-[0.14em] text-[#EDE9E0]/50">
          Latest events
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-[#EDE9E0]/55">No recent activity.</p>
        ) : (
          items.map((item) => {
            const body = (
              <div className={`border p-3 ${typeClassMap[item.type]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#EDE9E0]/55">
                      {typeLabelMap[item.type]}
                    </p>
                    <p className="mt-1 text-sm text-[#EDE9E0]">{item.title}</p>
                    <p className="mt-1 text-xs text-[#EDE9E0]/60">
                      {item.subtitle}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-[11px] text-[#EDE9E0]/45">
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
