import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, GraduationCap, LucideIcon, Save, Send } from "lucide-react";
import { saveResumeTargetsAction, saveUniversityTargetsAction } from "@/app/resume-builder/actions";
import { getCurrentUser, isAdminUser } from "@/lib/resume-builder/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import type { Locale } from "@/lib/i18n/config";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import { getOptionSets } from "@/lib/resume-builder/options";
import {
  getResumeTargetList,
  getUniversityTargetList,
  listResumeTargetLists,
  listUniversityFieldsForCountry,
  listUniversityTargetLists,
  targetsToText,
  ORDERED_UNIVERSITY_COUNTRIES,
  isAllowedUniversityCountry
} from "@/lib/resume-builder/targets";
import { canonicalUniversityCountry } from "@/lib/resume-builder/university-catalog";

type Kind = "work" | "universities";

type AdminTargetsPageProps = {
  searchParams: Promise<{ country?: string; field?: string; saved?: string; error?: string; kind?: string }>;
};

export default async function AdminTargetsPage({ searchParams }: AdminTargetsPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdminUser(user)) redirect("/dashboard");

  const locale = await getLocale();
  const m = getMessages(locale);
  const at = m.adminTargets;

  const { country, field, saved, error, kind: kindRaw } = await searchParams;
  const kind: Kind = kindRaw === "universities" ? "universities" : "work";

  const [options, lists, uniLists] = await Promise.all([
    Promise.resolve(getOptionSets()),
    Promise.resolve(listResumeTargetLists()),
    Promise.resolve(listUniversityTargetLists())
  ]);

  if (kind === "work") {
    const selectedCountry = country || lists[0]?.country || options.countries[0] || "Netherlands";
    const selectedList = getResumeTargetList(selectedCountry);
    const countries = Array.from(new Set([...options.countries, ...lists.map((item) => item.country), selectedCountry].filter(Boolean)));

    return (
      <main className="soft-grid min-h-screen p-4 md:p-8">
        <section className="mx-auto max-w-7xl">
          <AdminNav at={at} locale={locale} />
          <KindTabs at={at} kind={kind} />
          <Header at={at} kind="work" saved={saved} error={error} />

          <section className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
            <aside className="glass rounded-[2rem] p-5">
              <h2 className="text-xl font-black">{at.workAsideTitle}</h2>
              <p className="mt-2 text-xs text-slate-400">{at.workAsideHint}</p>
              <div className="mt-4 grid gap-2">
                {countries.map((item) => (
                  <Link
                    key={item}
                    href={`/admin/targets?kind=work&country=${encodeURIComponent(item)}`}
                    className={
                      item === selectedCountry
                        ? "rounded-2xl bg-cyan-300 px-4 py-3 font-black text-slate-950"
                        : "rounded-2xl bg-white/8 px-4 py-3 font-bold text-slate-200"
                    }
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </aside>

            <form action={saveResumeTargetsAction} className="glass rounded-[2rem] p-5">
              <input type="hidden" name="kind" value="work" />
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-200">{at.countryLabel}</span>
                  <input
                    name="country"
                    defaultValue={selectedCountry}
                    list="target-countries"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
                  />
                  <datalist id="target-countries">
                    {countries.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </label>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950" type="submit">
                  <Save size={18} /> {at.saveTargets}
                </button>
              </div>

              <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-slate-300">
                <p className="font-bold text-white">{at.lineFormatTitle}</p>
                <p>{at.lineFormatExample}</p>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-semibold text-slate-200">{at.targetsLinesLabel}</span>
                <textarea
                  name="targets"
                  rows={18}
                  defaultValue={targetsToText(selectedList.targets)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-white outline-none focus:border-cyan-300"
                />
              </label>
            </form>
          </section>
        </section>
      </main>
    );
  }

  const defaultUni = ORDERED_UNIVERSITY_COUNTRIES[0];
  const countryNorm = country?.trim() ? canonicalUniversityCountry(country.trim()) : "";
  const selectedCountry =
    countryNorm && isAllowedUniversityCountry(countryNorm) ? countryNorm : defaultUni;
  const uniCountries = [...ORDERED_UNIVERSITY_COUNTRIES];
  const orderMap = new Map<string, number>(ORDERED_UNIVERSITY_COUNTRIES.map((c, i) => [c, i]));
  const sortedUniLists = [...uniLists].sort((a, b) => {
    const ca = orderMap.get(a.country) ?? 999;
    const cb = orderMap.get(b.country) ?? 999;
    if (ca !== cb) return ca - cb;
    return a.field.localeCompare(b.field, undefined, { sensitivity: "base" });
  });
  const fields = listUniversityFieldsForCountry(selectedCountry);
  const fieldParam = field?.trim() || "";
  const selectedField = fieldParam || fields[0] || "Computer Science & Engineering";
  const uniList = getUniversityTargetList(selectedCountry, selectedField);

  return (
    <main className="soft-grid min-h-screen p-4 md:p-8">
      <section className="mx-auto max-w-7xl">
        <AdminNav at={at} locale={locale} />
        <KindTabs at={at} kind={kind} />
        <Header at={at} kind="universities" saved={saved} error={error} />

        <section className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="glass rounded-[2rem] p-5">
            <h2 className="text-xl font-black">{at.uniAsideTitle}</h2>
            <p className="mt-2 text-xs text-slate-400">{at.uniAsideHint}</p>
            <div className="mt-4 grid max-h-[70vh] gap-2 overflow-y-auto pr-1">
              {sortedUniLists.map((item) => (
                <Link
                  key={`${item.country}|${item.field}`}
                  href={`/admin/targets?kind=universities&country=${encodeURIComponent(item.country)}&field=${encodeURIComponent(item.field)}`}
                  className={
                    item.country === selectedCountry && item.field === selectedField
                      ? "rounded-2xl bg-cyan-300 px-4 py-3 font-black text-slate-950"
                      : "rounded-2xl bg-white/8 px-4 py-3 font-bold text-slate-200"
                  }
                >
                  <span className="block text-sm text-slate-500">{item.country}</span>
                  {item.field}
                </Link>
              ))}
            </div>
          </aside>

          <form action={saveUniversityTargetsAction} className="glass rounded-[2rem] p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-200">{at.countryLabel}</span>
                <input
                  name="country"
                  defaultValue={selectedCountry}
                  list="uni-countries"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
                <datalist id="uni-countries">
                  {uniCountries.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-200">{m.targetsPage.fieldOfStudy}</span>
                <input
                  name="field"
                  defaultValue={selectedField}
                  list="uni-fields"
                  placeholder={at.fieldStudyPlaceholder}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
                <datalist id="uni-fields">
                  {fields.map((fieldName) => (
                    <option key={fieldName} value={fieldName} />
                  ))}
                </datalist>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950" type="submit">
                <Save size={18} /> {at.saveUniversities}
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-slate-300">
              <p className="font-bold text-white">{at.lineFormatSame}</p>
              <p>{at.lineFormatExample}</p>
              <p className="mt-2 text-slate-400">{at.uniTypesHint}</p>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-slate-200">{at.institutionsLinesLabel}</span>
              <textarea
                name="targets"
                rows={18}
                defaultValue={targetsToText(uniList.targets)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-white outline-none focus:border-cyan-300"
              />
            </label>
          </form>
        </section>
      </section>
    </main>
  );
}

function AdminNav({ at, locale }: { at: Messages["adminTargets"]; locale: Locale }) {
  const BackIcon = locale === "fa" ? ArrowRight : ArrowLeft;
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Link href="/admin" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
        <BackIcon size={16} /> {at.backAdmin}
      </Link>
      <Link href="/targets" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950">
        {at.viewUserPage}
      </Link>
    </div>
  );
}

function KindTabs({ at, kind }: { at: Messages["adminTargets"]; kind: Kind }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <TabLink href="/admin/targets?kind=work" active={kind === "work"} label={at.tabWork} Icon={Send} />
      <TabLink href="/admin/targets?kind=universities" active={kind === "universities"} label={at.tabUniversities} Icon={GraduationCap} />
    </div>
  );
}

function TabLink({ href, active, label, Icon }: { href: string; active: boolean; label: string; Icon: LucideIcon }) {
  return (
    <Link href={href} className={`rounded-full px-5 py-2.5 text-sm font-black ${active ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-white"}`}>
      <span className="inline-flex items-center gap-2">
        <Icon size={16} /> {label}
      </span>
    </Link>
  );
}

function Header({ at, kind, saved, error }: { at: Messages["adminTargets"]; kind: Kind; saved?: string; error?: string }) {
  const isUni = kind === "universities";
  return (
    <header className="glass rounded-[2.5rem] p-6 md:p-8">
      <div className="inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">{isUni ? <GraduationCap /> : <Send />}</div>
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{isUni ? at.headerUniEyebrow : at.headerWorkEyebrow}</p>
      <h1 className="mt-2 text-4xl font-black">{isUni ? at.headerUniTitle : at.headerWorkTitle}</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-300">{isUni ? at.headerUniBody : at.headerWorkBody}</p>
      {saved && <p className="mt-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{at.saved}</p>}
      {error && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{isUni ? at.errorUni : at.errorWork}</p>}
    </header>
  );
}
