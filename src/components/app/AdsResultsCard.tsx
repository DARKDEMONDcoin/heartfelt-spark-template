import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
  const maxSpend = Math.max(...data.campaigns.map((campaign) => campaign.spend), 1);

  return (
    <section className="ads-report">
      <div className="ads-report-head">
        <div>
          <p>تقرير مباشر · آخر ٣٠ يوماً</p>
          <h2>أداء الإعلانات</h2>
        </div>
        <span>{data.account}</span>
      </div>

      <div className="ads-report-metrics">
        {metrics.map((m) => (
          <div key={m.k}>
            <p>{m.k}</p>
            <strong>{m.v}</strong>
          </div>
        ))}
      </div>

      {data.conversions ? (
        <p className="ads-report-cost">
          تكلفة التحويل الواحد <b>{fmt(cost, 2)} {data.currency}</b>
        </p>
      ) : null}

      <div className="ads-report-label"><span>أعلى الحملات</span><span>الإنفاق / النقرات</span></div>
      <ul className="ads-campaigns">
        {data.campaigns.map((c) => (
          <li key={c.name}>
            <div className="ads-campaign-line">
              <span>{c.name}</span>
              <b>{fmt(c.spend)} {data.currency} · {fmt(c.clicks)}</b>
            </div>
            <span className="ads-campaign-track" aria-hidden="true">
              <i style={{ width: `${Math.max(5, (c.spend / maxSpend) * 100)}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
