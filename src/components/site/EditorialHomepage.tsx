import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, BrainCircuit, CalendarCheck2, Check, CheckCircle2, Code2, Globe2, Instagram, Loader2, LockKeyhole, Megaphone, MessageCircle, MessageSquareText, Play, SearchCheck, Send, ShoppingBag, Sparkles, Workflow } from "lucide-react";
import { faqs } from "@/components/site/Faq";
import { Portrait } from "@/components/site/Portrait";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LogoMark } from "@/components/site/LogoMark";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { plans } from "@/data/pricing";
import { stories } from "@/data/stories";
import ecommerceSector from "@/assets/sectors/ecommerce.jpg";
import restaurantsSector from "@/assets/sectors/restaurants.jpg";
import clinicsSector from "@/assets/sectors/clinics.jpg";
import realestateSector from "@/assets/sectors/realestate.jpg";
import sonnyDesktop from "@/assets/employee-screens-v2/sonny-desktop.png";
import sonnyMobile from "@/assets/employee-screens-v2/sonny-mobile.png";
import evaDesktop from "@/assets/employee-screens-v2/eva-desktop.png";
import evaMobile from "@/assets/employee-screens-v2/eva-mobile.png";
import samDesktop from "@/assets/employee-screens-v2/sam-desktop.png";
import samMobile from "@/assets/employee-screens-v2/sam-mobile.png";
import nourDesktop from "@/assets/employee-screens-v2/nour-desktop.png";
import nourMobile from "@/assets/employee-screens-v2/nour-mobile.png";
import danaDesktop from "@/assets/employee-screens-v2/dana-desktop.png";
import danaMobile from "@/assets/employee-screens-v2/dana-mobile.png";
import adamDesktop from "@/assets/employee-screens-v2/adam-desktop.png";
import adamMobile from "@/assets/employee-screens-v2/adam-mobile.png";
import planFlowWide from "@/assets/product/plan-flow-wide.png";
import planFlowTall from "@/assets/product/plan-flow-tall.png";

type DemoPhase = "idle" | "thinking" | "draft" | "approved";

const capabilities = [
  { icon: MessageSquareText, kicker: "سِراج · السوشيال ميديا", title: "من طلب واحد إلى حملة جاهزة للاعتماد.", body: "يبني خطة ٣٠ يومًا، يكتب كل نسخة، ينسّق التصميم والنشر، ثم يعيد أفضل الأفكار إلى التقويم.", image: sonnyDesktop, mobileImage: sonnyMobile, tone: "terracotta", span: "wide" },
  { icon: CalendarCheck2, kicker: "أمَل · المساعدة التنفيذية", title: "ساعتك القادمة واضحة قبل أن تبدأ.", body: "تفرز البريد، ترتب الاجتماعات، وتضع القرارات المعلّقة في ملخص صباحي واحد.", image: evaDesktop, mobileImage: evaMobile, tone: "gold", span: "standard" },
  { icon: BarChart3, kicker: "سالم · المبيعات", title: "كل فرصة لها رسالة وخطوة تالية.", body: "يبحث عن العميل المناسب، يخصص التواصل، ويسلمك الفرص الجاهزة للمكالمة.", image: samDesktop, mobileImage: samMobile, tone: "teal", span: "standard" },
  { icon: SearchCheck, kicker: "نور · المحتوى والسيو", title: "إجابة عربية يجدها عميلك وقت البحث.", body: "ترصد السؤال، تبني خطة موضوعات، وتكتب صفحات أصلية مرتبطة بما يطلبه السوق.", image: nourDesktop, mobileImage: nourMobile, tone: "terracotta", span: "wide" },
  { icon: Sparkles, kicker: "دانة · التصميم", title: "فكرة واحدة، وكل المقاسات جاهزة.", body: "تحول المسودة إلى نظام بصري متسق، ثم تجهز نسخ كل منصة للمراجعة.", image: danaDesktop, mobileImage: danaMobile, tone: "teal", span: "standard" },
  { icon: BrainCircuit, kicker: "آدم · تحليل البيانات", title: "التقرير ينتهي بقرار، لا برقم.", body: "يجمع أداء القنوات، يرصد التغير، ويحدد أين تتحرك الميزانية والجهد بعد ذلك.", image: adamDesktop, mobileImage: adamMobile, tone: "gold", span: "standard" },
] as const;

const sectors = [
  { id: "ecommerce", label: "المتاجر", title: "الحملة تبدأ بالمحتوى وتنتهي بقرار شراء.", body: "سِراج يطلق القصة، دانة تجهز المقاسات، سالم يتابع المهتمين، وآدم يوضح ما يستحق التكرار.", stat: "٦ أدوار متصلة", image: ecommerceSector, task: "إطلاق مجموعة الخريف", result: "١٢ مادة للمراجعة", signal: "٤ قنوات جاهزة", icon: "◫" },
  { id: "restaurants", label: "المطاعم", title: "عرض اليوم لا ينتظر اجتماع الأسبوع.", body: "أمَل ترتب الموعد، سِراج يجهز النشر، دانة تصمم العرض، والفريق يتابع الرسائل في مسار واحد.", stat: "من الطلب للنشر", image: restaurantsSector, task: "قائمة نهاية الأسبوع", result: "موعد النشر ٦:٣٠", signal: "٣ مواد جاهزة", icon: "✦" },
  { id: "clinics", label: "العيادات", title: "معلومة دقيقة تمر بالمراجعة قبل جمهورك.", body: "نور تكتب المادة، دانة توضحها بصريًا، وأمَل توقف أي مادة حساسة حتى تصل موافقتك.", stat: "مراجعة بشرية", image: clinicsSector, task: "سلسلة التوعية الشهرية", result: "بانتظار موافقتك", signal: "٦ موضوعات", icon: "+" },
  { id: "realestate", label: "العقار", title: "الإعلان والمتابعة والتقرير في سياق واحد.", body: "سِراج يقدم العقار، سالم يتابع المهتمين، وآدم يلخص القنوات التي جلبت فرصًا جادة.", stat: "فريق واحد", image: realestateSector, task: "إطلاق عقار جديد", result: "قائمة المتابعة جاهزة", signal: "٥ مواعيد", icon: "⌂" },
] as const;

const stats = [
  { value: "١٨٤", label: "مهمة أسبوعية في المثال", tone: "terracotta" },
  { value: "٦٨", label: "ساعة عمل يعيد الفريق توزيعها", tone: "gold" },
  { value: "٤٫٢×", label: "فرص أكثر تصل للمراجعة", tone: "teal" },
  { value: "−٩٣٪", label: "وقت أقل بين الطلب والرد", tone: "fusion" },
];

const statHorizonPaths = Array.from({ length: 36 }, (_, index) => {
  const startY = 382 + index * 0.25;
  const firstY = 320 - index * 3.8;
  const secondY = 34 + index * 4.6;
  const endY = 362 + index * 1.7;
  return `M 1480 ${startY.toFixed(1)} C 1240 ${firstY.toFixed(1)}, 690 ${secondY.toFixed(1)}, -80 ${endY.toFixed(1)}`;
});

const statHorizonSignals = [4, 13, 22, 31];

const statHorizonNodes = [
  { cx: 1304, cy: 315, r: 2.2, delay: "-1s" },
  { cx: 1186, cy: 266, r: 1.5, delay: "-4.4s" },
  { cx: 1072, cy: 221, r: 2.8, delay: "-2.6s" },
  { cx: 936, cy: 178, r: 1.7, delay: "-6.1s" },
  { cx: 790, cy: 154, r: 2.1, delay: "-3.2s" },
  { cx: 651, cy: 149, r: 1.4, delay: "-7.3s" },
  { cx: 516, cy: 169, r: 2.5, delay: "-5.2s" },
  { cx: 382, cy: 211, r: 1.6, delay: "-.4s" },
  { cx: 236, cy: 272, r: 2.2, delay: "-6.8s" },
  { cx: 92, cy: 342, r: 1.5, delay: "-2s" },
];

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { node.classList.add("is-visible"); observer.disconnect(); } }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`sahl-reveal ${className}`}>{children}</div>;
}

function ProductFrame({ src, mobileSrc, alt, hero = false }: { src: string; mobileSrc?: string; alt: string; hero?: boolean }) {
  return <figure className={`sahl-device-frame${hero ? " is-hero" : ""}${mobileSrc ? " is-responsive-device" : ""}`}><div className="sahl-device-lid"><span className="sahl-device-camera" aria-hidden="true" /><span className="sahl-phone-island" aria-hidden="true" /><span className="sahl-phone-button is-volume-up" aria-hidden="true" /><span className="sahl-phone-button is-volume-down" aria-hidden="true" /><span className="sahl-phone-button is-power" aria-hidden="true" /><div className="sahl-device-screen"><picture>{mobileSrc && <source media="(max-width: 720px)" srcSet={mobileSrc} />}<img src={src} alt={alt} loading={hero ? "eager" : "lazy"} /></picture></div></div><div className="sahl-laptop-base" aria-hidden="true"><i /></div></figure>;
}

function ToolConnections() {
  return <div className="sahl-tool-connections" aria-label="إنستجرام وواتساب وجوجل وفيسبوك وشوبيفاي متصلة بسهل"><svg className="sahl-tool-wires" viewBox="0 0 560 136" aria-hidden="true"><path id="sahl-tool-wire-1" d="M74 28 C164 28 194 68 280 68" /><path id="sahl-tool-wire-2" d="M74 68 C166 68 200 68 280 68" /><path id="sahl-tool-wire-3" d="M74 108 C164 108 194 68 280 68" /><path id="sahl-tool-wire-4" d="M486 42 C394 42 368 68 280 68" /><path id="sahl-tool-wire-5" d="M486 94 C394 94 368 68 280 68" /><g className="sahl-tool-pulses"><use href="#sahl-tool-wire-1" /><use href="#sahl-tool-wire-2" /><use href="#sahl-tool-wire-3" /><use href="#sahl-tool-wire-4" /><use href="#sahl-tool-wire-5" /></g></svg><div className="sahl-tool-icon is-instagram" title="إنستجرام"><Instagram /><span>إنستجرام</span></div><div className="sahl-tool-icon is-whatsapp" title="واتساب"><MessageCircle /><span>واتساب</span></div><div className="sahl-tool-icon is-google" title="جوجل"><b>G</b><span>جوجل</span></div><div className="sahl-tool-icon is-facebook" title="فيسبوك"><b>f</b><span>فيسبوك</span></div><div className="sahl-tool-icon is-shopify" title="شوبيفاي"><ShoppingBag /><span>شوبيفاي</span></div><div className="sahl-tool-core"><LogoMark size={34} /><span>سهل</span></div></div>;
}

function SirajDemo() {
  const [prompt, setPrompt] = useState("أطلق المنتج الجديد خلال أسبوعين ونسّق الفريق كله");
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const run = () => { if (!prompt.trim() || phase === "thinking") return; setPhase("thinking"); timer.current = window.setTimeout(() => setPhase("draft"), 850); };
  return <div className="sahl-demo" id="siraj-demo"><header><span><i /> غرفة عمل الفريق</span><strong>سِراج ينسّق المهمة</strong><small>٦ موظفين جاهزون</small></header><div className="sahl-demo-grid"><aside><Portrait memberId="sonny" name="سِراج" eager /><strong>سِراج</strong><small>يقود الإطلاق</small><nav><b>المحادثة</b><span>خطة الفريق</span><span>الموافقات</span><span>النتائج</span></nav></aside><div className="sahl-chat"><div className="sahl-user-message"><small>طلبك</small><p>{prompt}</p></div>{phase === "thinking" && <div className="sahl-thinking"><Loader2 className="animate-spin" /> سِراج يقسم الإطلاق ويوزع العمل على الفريق...</div>}{(phase === "draft" || phase === "approved") && <div className="sahl-agent-message"><span><Portrait memberId="sonny" name="سِراج" /><b>سِراج</b></span><p>بنيت خطة ١٤ يومًا: ٨ منشورات و٦ قصص. دانة تجهز المقاسات، نور تكتب صفحة الإطلاق، أمَل ترتب الجدول، سالم يتابع المهتمين، وآدم يقيس القنوات.</p><div><span>١٤ مادة منظمة</span><span>٥ زملاء مرتبطون بالمهمة</span></div></div>}{phase === "approved" && <div className="sahl-success"><CheckCircle2 /><span><b>اعتمدت خطة الفريق</b><small>انتقلت المهام إلى مساحات الموظفين</small></span></div>}<div className="sahl-composer"><label htmlFor="sahl-prompt">اكتب النتيجة التي تريدها</label><textarea id="sahl-prompt" rows={2} value={prompt} onChange={(event) => { setPrompt(event.target.value); setPhase("idle"); }} /><Button type="button" size="icon" onClick={run} disabled={!prompt.trim() || phase === "thinking"} aria-label="إرسال الطلب للفريق">{phase === "thinking" ? <Loader2 className="animate-spin" /> : <Send />}</Button></div>{(phase === "draft" || phase === "approved") && <div className="sahl-demo-actions"><Button variant="outline" onClick={() => setPhase("idle")}>عدّل الخطة</Button><Button onClick={() => setPhase("approved")} disabled={phase === "approved"}><Check />{phase === "approved" ? "تم الاعتماد" : "اعتمد ووزّع"}</Button></div>}</div></div></div>;
}

export function EditorialHomepage() {
  const [sector, setSector] = useState(0);
  const [story, setStory] = useState(0);
  const currentSector = sectors[sector] ?? sectors[0];
  return <div className="sahl-white-home" dir="rtl">
    <section className="sahl-hero" aria-labelledby="home-title"><div className="sahl-hero-ribbon" aria-hidden="true"><i /><i /><i /></div><div className="sahl-shell sahl-hero-layout"><Reveal className="sahl-hero-copy"><p className="sahl-live-metric">مثال لتدفق عمل كامل: <b>١٨٤ مهمة في أسبوع</b></p><h1 id="home-title">ستة موظفين.<br />مشروع واحد <em>يتحرك.</em></h1><p className="sahl-first-claim">سهل أول منصة ذكاء اصطناعي عربية.</p><p className="sahl-lead">منصة تجمع سِراج وأمَل وسالم ونور ودانة وآدم: فريق يخطط ويكتب ويصمم ويبيع وينظم ويحلل داخل مساحة تعرف مشروعك.</p><div className="sahl-actions"><Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" as const }}>كوّن فريقك مجانًا <ArrowLeft /></Link></Button><Button asChild size="lg" variant="outline"><Link to="/auth" search={{ mode: "signup" as const }}><span className="sahl-google-mark" aria-hidden="true">G</span> ابدأ باستخدام Google</Link></Button></div><small><CheckCircle2 /> تجربة ١٤ يومًا · لا نطلب بطاقة بنكية</small></Reveal></div></section>

    <section className="sahl-trust" aria-label="أمثلة لأنشطة صُمم سهل لخدمتها"><div className="sahl-shell"><p><b>أسماء تجريبية</b> لستة أنشطة يمكن للفريق تشغيلها</p><div className="sahl-trust-row">{["نُقطة قهوة", "دار نَسج", "مدار التقنية", "عيادات وِصال", "مذاق البيت", "أثر العقارية"].map((name) => <span key={name}>{name}</span>)}</div></div></section>

    <section className="sahl-section sahl-capabilities"><div className="sahl-shell"><Reveal><header className="sahl-section-head"><span>ستة تخصصات بسياق واحد</span><h2>كل موظف ينجز دوره.<br /><em>وكل نتيجة تسلّم التالية.</em></h2><p>سِراج يبدأ الحملة، دانة تجهز صورتها، نور توسع قصتها، سالم يحول الاهتمام إلى فرصة، أمَل ترتب الوقت، وآدم يقرأ ما حدث.</p></header></Reveal><div className="sahl-cap-grid">{capabilities.map((item) => <Reveal key={item.kicker} className={`sahl-cap-card is-${item.span} is-${item.tone}`}><div><item.icon /><span>{item.kicker}</span><h3>{item.title}</h3><p>{item.body}</p>{item.kicker.startsWith("سِراج") && <aside className="sahl-coming-ads"><Megaphone aria-hidden="true" /><div><span>قريبًا · قيد التطوير</span><strong>سِراج سيدير الإعلانات الممولة</strong><p>سيبني الحملة عبر تكامل موحّد مع منصات الإعلانات، يراجع الأداء ويحسّن الإعدادات، ولن يطلق حملة أو يعتمد ميزانية قبل موافقتك الصريحة.</p></div></aside>}<Link to="/features">شاهد مهامه <ArrowLeft /></Link></div><ProductFrame src={item.image} mobileSrc={item.mobileImage} alt={`واجهة ${item.kicker} داخل سهل`} /></Reveal>)}</div></div></section>

    <section className="sahl-stats"><div className="sahl-stats-wave" aria-hidden="true"><svg viewBox="0 0 1400 520" preserveAspectRatio="none"><defs><linearGradient id="sahlStatsWave" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--home-terracotta)" /><stop offset="48%" stopColor="var(--home-gold)" /><stop offset="100%" stopColor="var(--home-teal)" /></linearGradient></defs><g className="sahl-stats-wave-lines"><path d="M-80 388 C 190 310 338 435 572 342 S 918 126 1510 184" /><path d="M-80 424 C 204 342 358 466 590 374 S 940 158 1510 216" /><path d="M-80 460 C 220 380 378 498 616 410 S 968 192 1510 250" /><path d="M-80 352 C 176 278 322 398 548 308 S 886 96 1510 150" /></g><path className="sahl-stats-wave-light" d="M-80 388 C 190 310 338 435 572 342 S 918 126 1510 184" /></svg></div><div className="sahl-shell"><Reveal><header><span>سيناريو توضيحي لفريق كامل</span><h2><strong>ستة أدوار</strong><em> تظهر نتيجتها في لوحة واحدة.</em></h2></header></Reveal><div className="sahl-stat-grid">{stats.map((item, index) => <Reveal key={item.label} className={`sahl-stat is-${item.tone}`}><small>٠{index + 1}</small><strong>{item.value}</strong><span>{item.label}</span></Reveal>)}</div></div></section>

    <section className="sahl-section sahl-demo-section"><div className="sahl-shell"><Reveal><header className="sahl-section-head is-split"><div><span>جرّب تسليم المهمة</span><h2>قل ما تريد مرة.<br /><em>واستلم خطة الفريق.</em></h2></div><p>في هذا المثال، سِراج يحول هدف الإطلاق إلى خطة دقيقة ثم يمرر أجزاءها إلى دانة ونور وأمَل وسالم وآدم.</p></header></Reveal><Reveal><div className="sahl-demo-laptop"><div className="sahl-demo-lid"><span className="sahl-device-camera" aria-hidden="true" /><SirajDemo /></div><div className="sahl-laptop-base" aria-hidden="true"><i /></div></div></Reveal></div></section>

    <section className="sahl-section sahl-sectors"><div className="sahl-shell"><Reveal><header className="sahl-section-head"><span>فريق يتعلم طبيعة نشاطك</span><h2>الأدوار نفسها.<br /><em>والسياق يتغير مع مشروعك.</em></h2><p>اختر نشاطًا لترى كيف تتغير المهمة، ترتيب الموظفين، ونقطة موافقتك.</p></header></Reveal><div className="sahl-sector-tabs" role="tablist" aria-label="اختر نوع النشاط">{sectors.map((item, index) => <Button key={item.id} variant="ghost" role="tab" aria-selected={sector === index} aria-controls="sahl-sector-content" className={sector === index ? "is-active" : ""} onClick={() => setSector(index)}>{item.label}</Button>)}</div><Reveal className="sahl-sector-panel"><div><span>{currentSector.label}</span><h3>{currentSector.title}</h3><p>{currentSector.body}</p><strong>{currentSector.stat}</strong><Link to="/use-cases/$id" params={{ id: currentSector.id }}>استكشف هذا المسار <ArrowLeft /></Link></div><figure id="sahl-sector-content" role="tabpanel" key={currentSector.id}><img src={currentSector.image} alt={`مشهد يوضح عمل فريق سهل في قطاع ${currentSector.label}`} loading="lazy" width={1280} height={900} /><div className="sahl-sector-brand"><i>{currentSector.icon}</i><span><small>غرفة عمل الفريق</small><b>{currentSector.label}</b></span><em>المثال يعمل</em></div><div className="sahl-sector-task"><small>المهمة الجارية</small><b>{currentSector.task}</b><span><i /> {currentSector.result}</span></div><div className="sahl-sector-signal"><small>مؤشر المتابعة</small><strong>{currentSector.signal}</strong><span>مثال توضيحي</span></div></figure></Reveal></div></section>

    <section className="sahl-section sahl-infrastructure"><div className="sahl-shell"><Reveal><header className="sahl-section-head is-split"><div><span>حساباتك وقواعدك</span><h2>الفريق يصل لأدواتك.<br /><em>والقرار يبقى عندك.</em></h2></div><p>سِراج ينشر، سالم يتابع، نور تقرأ البحث، وآدم يجمع الأداء. لا يخرج إجراء حساس قبل قاعدة الاعتماد التي تحددها.</p></header></Reveal><Reveal className="sahl-system-board"><ToolConnections /><div className="sahl-system-points"><span><Workflow /><b>سياق ينتقل بين الستة</b></span><span><LockKeyhole /><b>موافقة قبل التنفيذ</b></span><span><Code2 /><b>سجل واضح لكل خطوة</b></span></div><div className="sahl-system-horizon" aria-hidden="true"><svg viewBox="0 0 1440 440" preserveAspectRatio="none"><defs><linearGradient id="sahlSystemHorizonLine" x1="100%" y1="72%" x2="0%" y2="28%"><stop offset="0%" stopColor="var(--home-terracotta)" /><stop offset="42%" stopColor="var(--home-gold)" stopOpacity=".46" /><stop offset="100%" stopColor="var(--home-teal)" /></linearGradient><linearGradient id="sahlSystemHorizonSignal" x1="100%" y1="70%" x2="0%" y2="30%"><stop offset="0%" stopColor="var(--home-gold)" stopOpacity="0" /><stop offset="45%" stopColor="var(--home-gold)" /><stop offset="100%" stopColor="var(--home-bg)" stopOpacity="0" /></linearGradient></defs><g className="sahl-horizon-lines">{statHorizonPaths.map((path, index) => <path key={path} d={path} style={{ "--line-opacity": 0.52 - index * 0.009 } as CSSProperties} />)}</g><g className="sahl-horizon-signals">{statHorizonSignals.map((pathIndex, index) => <path key={pathIndex} d={statHorizonPaths[pathIndex]} style={{ "--signal-delay": `${index * -3.7}s` } as CSSProperties} />)}</g><g className="sahl-horizon-nodes">{statHorizonNodes.map((node) => <circle key={`${node.cx}-${node.cy}`} cx={node.cx} cy={node.cy} r={node.r} style={{ "--node-delay": node.delay } as CSSProperties} />)}</g></svg></div></Reveal></div></section>

    <section className="sahl-section sahl-stories"><div className="sahl-shell"><Reveal><header className="sahl-section-head"><span>سيناريوهات توضيحية وليست ادعاءات عملاء</span><h2>هكذا تتغير النتيجة<br /><em>عندما يعمل أكثر من موظف.</em></h2><p>ثلاث صور افتراضية تشرح تعاون سِراج ودانة، سالم ونور، ثم أمَل وآدم.</p></header></Reveal><div className="sahl-story-accordion">{stories.map((item, index) => <article key={item.id} className={story === index ? "is-open" : ""}><Button variant="ghost" onClick={() => setStory(index)} aria-expanded={story === index}><span>٠{index + 1}</span><b>{item.company}</b><small>{item.sector}</small><i>+</i></Button><div className="sahl-story-content"><div><span>{item.country} · مثال افتراضي</span><h3>{item.headline}</h3><blockquote>“{item.quote}”</blockquote><footer><b>{item.person}</b><small>{item.role} · شخصية توضيحية</small></footer></div><div className="sahl-story-results">{item.results.map((result) => <span key={result.k}><strong>{result.v}</strong><small>{result.k}</small></span>)}</div></div></article>)}</div></div></section>

    <section className="sahl-section sahl-start"><div className="sahl-shell"><Reveal><header className="sahl-section-head"><span>ابدأ من احتياجك الحالي</span><h2>موظف واحد اليوم.<br /><em>أو الفريق كله من أول مهمة.</em></h2></header></Reveal><div className="sahl-start-grid"><Reveal><article><Sparkles /><span>مهمة أولى</span><h3>اختر الموظف الأقرب</h3><p>ابدأ مع أمَل للتنظيم، أو سالم للمبيعات، أو أي تخصص يزيل عبئك الحالي.</p><Link to="/auth" search={{ mode: "signup" as const }}>اختر موظفك <ArrowLeft /></Link></article></Reveal><Reveal><article><Play /><span>شاهد التنسيق</span><h3>طلب واحد يتحول لخطة</h3><p>جرّب كيف يقود سِراج إطلاقًا ويوزع أجزاءه على خمسة زملاء.</p><a href="#siraj-demo">جرّب المثال <ArrowLeft /></a></article></Reveal><Reveal><article><Globe2 /><span>للشركات والفروع</span><h3>اضبط فريقًا على طريقتك</h3><p>حدد الصلاحيات والموافقات والعلامات، ثم تابع العمل من لوحة واحدة.</p><Link to="/contact">ناقش احتياجك <ArrowLeft /></Link></article></Reveal></div></div></section>

    <section className="sahl-section sahl-pricing"><div className="sahl-shell"><Reveal><header className="sahl-section-head"><span>عدد الموظفين يتبع حجم العمل</span><h2>ابدأ بدور واحد.<br /><em>وأضف الفريق حين تحتاجه.</em></h2><p>لا تدفع مقابل مقاعد لا تعمل. اختر البداية، أو فعّل تعاون الموظفين الستة في خطة النمو.</p></header></Reveal><div className="sahl-plan-grid">{plans.map((plan) => <Reveal key={plan.id}><article className={plan.highlight ? "is-featured" : ""}>{plan.highlight && <span className="sahl-plan-tag">الفريق كاملًا</span>}<small>{plan.tag}</small><h3>{plan.name}</h3><div className="sahl-price">{plan.monthly ? <><strong>{plan.monthly.toLocaleString("ar-SA")}</strong><span>ر.س كل شهر</span></> : <strong>تسعير مخصص</strong>}</div><p>{plan.desc}</p><ul>{plan.perks.slice(0, 5).map((perk) => <li key={perk}><Check />{perk}</li>)}</ul><Button asChild variant={plan.highlight ? "default" : "outline"}>{plan.monthly ? <Link to="/auth" search={{ mode: "signup" as const }}>{plan.cta}<ArrowLeft /></Link> : <Link to="/contact">{plan.cta}<ArrowLeft /></Link>}</Button></article></Reveal>)}</div></div></section>

    <section className="sahl-section sahl-faq"><div className="sahl-shell"><Reveal><header className="sahl-section-head"><span>قرارات واضحة قبل التشغيل</span><h2>ما الذي يفعله الفريق؟<br />وما الذي يبقى بيدك؟</h2></header></Reveal><Accordion type="single" collapsible>{faqs.slice(0, 6).map((item, index) => <AccordionItem key={item.q} value={`faq-${index}`}><AccordionTrigger>{item.q}</AccordionTrigger><AccordionContent>{item.a}</AccordionContent></AccordionItem>)}</Accordion></div></section>

    <section className="sahl-final"><div className="sahl-shell"><Reveal><span>اكتب أول نتيجة تريدها</span><h2>الفريق يوزع العمل.<br />وأنت تعتمد القرار.</h2><p>كوّن فريقك، أرسل الهدف مرة واحدة، وراجع الخطة قبل أن يبدأ التنفيذ.</p><div className="sahl-actions"><Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" as const }}>ابدأ تجربتك المجانية <ArrowLeft /></Link></Button><Button asChild size="lg" variant="ghost"><Link to="/contact">تحدث مع الفريق</Link></Button></div></Reveal></div></section><SiteFooter />
  </div>;
}
