import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { adsOverview } from "@/lib/ads-overview.functions";
import type { Integration } from "@/lib/data";

const fmt = (n: number, digits = 0) =>
  n.toLocaleString("ar-EG", { maximumFractionDigits: digits });

/**
 * نتائج الإعلانات الحقيقية لآخر ٣٠ يوماً (حساب ميتا المرتبط).
 * لا تظهر البطاقة إطلاقاً بلا بيانات فعلية — لا أرقام تجريبية.
 */
const channels = [
  { providers: ["google-ads"], label: "Google Ads", code: "GOOGLE" },
  { providers: ["facebook", "meta-ads"], label: "فيسبوك", code: "META / FB" },
  { providers: ["instagram", "meta-ads"], label: "إنستجرام", code: "META / IG" },
  { providers: ["tiktok"], label: "تيك توك", code: "TIKTOK" },
  { providers: ["linkedin"], label: "لينكدإن", code: "LINKEDIN" },
  { providers: ["x"], label: "إكس", code: "X ADS" },
] as const;

export function AdsResultsCard({
  workspaceId,
  integrations = [],
}: {
  workspaceId: string;
  integrations?: Integration[];
}) {
  const fetchAds = useServerFn(adsOverview);
  const { data } = useQuery({
    queryKey: ["ads-overview", workspaceId],
    queryFn: () => fetchAds({ data: { workspaceId } }),
    staleTime: 10 * 60_000,
    retry: false,
  });

  const cost = data?.conversions ? data.spend / data.conversions : 0;
  const metrics = data ? [
    { k: "الإنفاق", v: `${fmt(data.spend)} ${data.currency}` },
    { k: "النقرات", v: fmt(data.clicks) },
    { k: "نسبة النقر", v: `${fmt(data.ctr, 2)}%` },
    { k: "التحويلات", v: fmt(data.conversions) },
  ] : [];
  const maxSpend = Math.max(...(data?.campaigns ?? []).map((campaign) => campaign.spend), 1);
  const isConnected = (providers: readonly string[]) =>
    integrations.some((row) => providers.includes(row.provider) && row.status === "connected");

  return (
    <section className="ads-report" aria-labelledby="ads-command-title">
      <div className="ads-report-head">
        <div>
          <p>مركز قيادة موحّد · بيانات فعلية فقط</p>
          <h2 id="ads-command-title">أداء الإعلانات عبر المنصات</h2>
        </div>
        <span>{data ? `${data.account} · آخر ٣٠ يوماً` : "في انتظار أول مصدر بيانات"}</span>
      </div>

      <div className="ads-platform-rail" aria-label="حالة منصات الإعلانات">
        {channels.map((channel) => {
          const connected = isConnected(channel.providers);
          return (
            <div key={channel.code} className={connected ? "is-connected" : undefined}>
              <small>{channel.code}</small>
              <b>{channel.label}</b>
              <span>{connected ? "متصل" : "غير متصل"}</span>
            </div>
          );
        })}
      </div>

      {data ? (
        <>
          <div className="ads-report-metrics">
            {metrics.map((m) => (
              <div key={m.k}>
                <p>{m.k}</p>
                <strong>{m.v}</strong>
              </div>
            ))}
          </div>

          <div className="ads-analysis-grid">
            <div className="ads-chart" aria-label="مقارنة إنفاق أعلى الحملات">
              <div className="ads-chart-title">
                <span>توزيع الإنفاق</span>
                <small>ميتا · مباشر</small>
              </div>
              <div className="ads-chart-bars" aria-hidden="true">
                {data.campaigns.map((campaign) => (
                  <i key={campaign.name} style={{ height: `${Math.max(12, (campaign.spend / maxSpend) * 100)}%` }} />
                ))}
              </div>
              {data.conversions ? (
                <p>تكلفة التحويل <b>{fmt(cost, 2)} {data.currency}</b></p>
              ) : <p>لم تُسجّل تحويلات في هذه الفترة</p>}
            </div>

            <div className="ads-campaign-board">
              <div className="ads-report-label"><span>أعلى الحملات</span><span>الإنفاق / النقرات</span></div>
              <ol className="ads-campaigns">
                {data.campaigns.map((campaign, index) => (
                  <li key={campaign.name}>
                    <span className="ads-campaign-rank">{String(index + 1).padStart(2, "0")}</span>
                    <div className="ads-campaign-copy">
                      <div className="ads-campaign-line">
                        <span>{campaign.name}</span>
                        <b>{fmt(campaign.spend)} {data.currency} · {fmt(campaign.clicks)}</b>
                      </div>
                      <span className="ads-campaign-track" aria-hidden="true">
                        <i style={{ width: `${Math.max(5, (campaign.spend / maxSpend) * 100)}%` }} />
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </>
      ) : (
        <div className="ads-empty-state">
          <div>
            <small>لا نعرض بيانات تجريبية</small>
            <h3>اربط منصة إعلانية لتظهر النتائج هنا تلقائيًا.</h3>
            <p>ستظهر المقارنة والإنفاق والنقرات والتحويلات فور توفر بيانات حقيقية من الحساب.</p>
          </div>
          <Link to="/app/integrations">إدارة المنصات <span aria-hidden="true">←</span></Link>
        </div>
      )}
    </section>
  );
}
