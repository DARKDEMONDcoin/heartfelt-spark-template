import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle, CircleCheck, Clock3, Link2, PlayCircle } from "lucide-react";

import { ActivationMap } from "@/components/app/ActivationMap";
import { AdsResultsCard } from "@/components/app/AdsResultsCard";
import { AppShell } from "@/components/app/AppShell";
import { BusinessProfileCard } from "@/components/app/BusinessProfileCard";
import { AppIcon, appLabel } from "@/components/site/AppIcon";
import { getMember, team } from "@/data/team";
import { taskStatusLabel } from "@/data/app";
import { useIntegrations, useProfile, useTasks, useWorkspace } from "@/lib/data";
import { Portrait } from "@/components/site/Portrait";
import { BrandLoader } from "@/components/site/BrandLoader";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "مساحة عملك | سهل" },
      { name: "description", content: "نظرة عامة على عمل فريقك الرقمي اليوم." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppHome,
});

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `قبل ${hrs} ساعة`;
  return `قبل ${Math.round(hrs / 24)} يوم`;
}

/** شاشة أول يوم: لا أرقام صفرية ولا لوحات فارغة — طلب واحد فقط يبدأ كل شيء. */
function FirstRun({ workspace }: { workspace: { id: string } | null }) {
  return (
    <>
      <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <p className="text-[0.7rem] font-bold tracking-wide text-primary">ابدأ من هنا</p>
        <h2 className="mt-1.5 font-display text-xl font-black sm:text-2xl">
          اطلب أول عمل من فريقك
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          اكتب طلبك بالعربية كما تكلّم موظفاً — واختر من يبدأ. لا يُنشر شيء قبل موافقتك.
        </p>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((m) => (
            <Link
              key={m.id}
              to="/app/chat/$id"
              params={{ id: m.id }}
              className="group flex items-center gap-3 rounded-2xl border border-border/70 p-3 transition-colors hover:bg-secondary/45"
            >
              <span className="block size-11 shrink-0 overflow-hidden rounded-xl shadow-sm">
                <Portrait memberId={m.id} name={m.name} className="size-full" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{m.name}</span>
                <span className="block truncate text-[0.72rem] text-muted-foreground">{m.role}</span>
              </span>
              <ArrowLeft className="size-4 shrink-0 text-primary transition-transform group-hover:-translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {workspace ? (
        <div className="mt-4">
          <BusinessProfileCard
            workspaceId={workspace.id}
            website={(workspace as { website?: string | null }).website}
            profile={(workspace as { profile?: Record<string, unknown> }).profile as never}
          />
        </div>
      ) : null}
    </>
  );
}

function AppHome() {
  const { data: profile } = useProfile();
  const { data: workspace } = useWorkspace();
  const { data: tasks, isLoading } = useTasks(workspace?.id);
  const { data: integrations } = useIntegrations(workspace?.id);

  const list = tasks ?? [];
  const review = list.filter((t) => t.status === "review");
  const running = list.filter((t) => t.status === "running");
  const done = list.filter((t) => t.status === "done");
  const connected = (integrations ?? []).filter((i) => i.status === "connected").length;
  const broken = (integrations ?? []).filter((i) => i.status === "error");
  const started = list.length > 0;

  // أرقام صفرية لا تُعرض: لوحة نظيفة تعرض ما حدث فعلاً فقط.
  const kpis = [
    { k: "مهام منجزة", n: done.length, d: "منذ انطلاق مساحتك", icon: CircleCheck, tone: "bg-jade/12 text-jade" },
    { k: "قيد التنفيذ", n: running.length, d: "فريقك يعمل الآن", icon: PlayCircle, tone: "bg-amber/15 text-amber" },
    { k: "بانتظار موافقتك", n: review.length, d: "تحتاج قرارك", icon: Clock3, tone: "bg-coral/12 text-coral" },
    { k: "حسابات مرتبطة", n: connected, d: `من أصل ${integrations?.length ?? 0}`, icon: Link2, tone: "bg-sky/15 text-ink-soft" },
  ].filter((k) => k.n > 0);

  const lead = started
    ? `${review.length} بانتظار موافقتك · ${running.length} قيد التنفيذ`
    : "فريقك جاهز — ابدأ بطلب واحد.";

  return (
    <AppShell title={`أهلاً ${profile?.full_name ?? ""} 👋`} lead={lead}>
      {broken.length ? (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-coral/30 bg-coral/8 p-4">
          <AlertTriangle className="size-5 shrink-0 text-coral" />
          <p className="flex-1 text-sm font-semibold">
            {broken.length} حساب يحتاج إعادة ربط — المهام المرتبطة به متوقفة.
          </p>
          <Link
            to="/app/integrations"
            className="rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background"
          >
            إصلاح الربط
          </Link>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid min-h-[40vh] place-items-center">
          <BrandLoader size="sm" />
        </div>
      ) : !started ? (
        <FirstRun workspace={workspace ?? null} />
      ) : (
        <div className="space-y-4">
          {kpis.length ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
              {kpis.map((k) => (
                <div
                  key={k.k}
                  className="rounded-2xl border border-border/70 bg-card p-4 shadow-card transition-colors hover:border-primary/25"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[0.72rem] font-semibold text-muted-foreground">{k.k}</p>
                    <span className={`grid size-8 shrink-0 place-items-center rounded-xl ${k.tone}`}>
                      <k.icon className="size-4" strokeWidth={2.2} />
                    </span>
                  </div>
                  <p className="mt-1.5 font-display text-3xl font-black leading-none tabular-nums">
                    {k.n}
                  </p>
                  <p className="mt-1.5 truncate text-[0.7rem] text-muted-foreground">{k.d}</p>
                </div>
              ))}
            </div>
          ) : null}

          <ActivationMap variant="compact" />

          {workspace ? <AdsResultsCard workspaceId={workspace.id} /> : null}

          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] [&>*]:min-w-0">
            <section className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-black sm:text-lg">آخر ما أنجزه فريقك</h2>
                <Link to="/app/tasks" className="text-sm font-bold text-primary">
                  كل المهام
                </Link>
              </div>
              <ul className="mt-4 space-y-3">
                {list.slice(0, 5).map((t) => {
                  const member = getMember(t.employee_id);
                  return (
                    <li
                      key={t.id}
                      className="rounded-2xl border border-border/70 p-4 transition-colors hover:bg-secondary/35"
                    >
                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        {member ? (
                          <span className="inline-flex items-center gap-1.5 font-bold">
                            <span
                              className="size-6 overflow-hidden rounded-lg"
                              style={{ background: member.tintSoft }}
                            >
                              <Portrait memberId={member.id} name={member.name} className="size-full" />
                            </span>
                            {member.name}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <AppIcon name={t.channel} className="size-3.5" />
                          {appLabel(t.channel)}
                        </span>
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 font-bold">
                          {taskStatusLabel[t.status as keyof typeof taskStatusLabel] ?? t.status}
                        </span>
                        <span className="ms-auto text-muted-foreground">{timeAgo(t.created_at)}</span>
                      </div>
                      <p className="mt-2.5 break-words font-bold">{t.title}</p>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
              <h2 className="font-display text-base font-black sm:text-lg">مهام جارية</h2>
              <ul className="mt-4 space-y-3">
                {running.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 text-sm">
                    <span className="size-2 shrink-0 rounded-full bg-amber" />
                    <span className="min-w-0 flex-1 truncate font-semibold">{t.title}</span>
                  </li>
                ))}
                {running.length === 0 ? (
                  <li className="text-sm text-muted-foreground">لا توجد مهام جارية.</li>
                ) : null}
              </ul>
              <Link
                to="/app/chat"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary"
              >
                اطلب مهمة جديدة <ArrowLeft className="size-4" />
              </Link>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}
