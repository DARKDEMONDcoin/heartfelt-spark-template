import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Megaphone } from "lucide-react";

import { adsOverview } from "@/lib/ads-overview.functions";

const fmt = (n: number, digits = 0) =>
  n.toLocaleString("ar-EG", { maximumFractionDigits: digits });

/**
 * نتائج الإعلانات الحقيقية لآخر ٣٠ يوماً (حساب ميتا المرتبط).
 * لا تظهر البطاقة إطلاقاً بلا بيانات فعلية — لا أرقام تجريبية.
 */
export function AdsResultsCard({ workspaceId }: { workspaceId: string }) {
  const fetchAds = useServerFn(adsOverview);
  const { data } = useQuery({
    queryKey: ["ads-overview", workspaceId],
    queryFn: () => fetchAds({ data: { workspaceId } }),
    staleTime: 10 * 60_000,
    retry: false,
  });

  if (!data) return null;

  const cost = data.conversions ? data.spend / data.conversions : 0;
  const metrics = [
    { k: "الإنفاق", v: `${fmt(data.spend)} ${data.currency}` },
    { k: "النقرات", v: fmt(data.clicks) },
    { k: "نسبة النقر", v: `${fmt(data.ctr, 2)}%` },
    { k: "التحويلات", v: fmt(data.conversions) },
  ];

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
          <Megaphone className="size-4" />
        </span>
        <h2 className="font-display text-base font-black sm:text-lg">نتائج إعلاناتك — آخر ٣٠ يوماً</h2>
        <span className="ms-auto truncate text-xs text-muted-foreground">{data.account}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.k} className="rounded-2xl border border-border/70 p-3">
            <p className="text-[0.7rem] text-muted-foreground">{m.k}</p>
            <p className="mt-1 font-display text-lg font-black tabular-nums">{m.v}</p>
          </div>
        ))}
      </div>

      {data.conversions ? (
        <p className="mt-3 text-xs text-ink-soft">
          تكلفة التحويل الواحد: <b className="text-foreground">{fmt(cost, 2)} {data.currency}</b>
        </p>
      ) : null}

      <ul className="mt-4 space-y-2">
        {data.campaigns.map((c) => (
          <li
            key={c.name}
            className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2 text-sm"
          >
            <span className="min-w-0 flex-1 truncate font-semibold">{c.name}</span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {fmt(c.spend)} {data.currency} · {fmt(c.clicks)} نقرة
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
