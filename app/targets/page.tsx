import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, ExternalLink, GraduationCap, Mail, MapPin, Send } from "lucide-react";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/t";
import { getOptionSets } from "@/lib/resume-builder/options";
import { listResumes } from "@/lib/resume-builder/resumes";
import {
  getResumeTargetList,
  getUniversityTargetList,
  listUniversityFieldsForCountry,
  listUniversityTargetLists
} from "@/lib/resume-builder/targets";

type TargetKind = "work" | "universities";

type TargetsPageProps = {
  searchParams: Promise<{ country?: string; field?: string; kind?: string }>;
};

export default async function TargetsPage({ searchParams }: TargetsPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const m = getMessages(locale);
  const tp = m.targetsPage;

  const { country, field, kind: kindRaw } = await searchParams;
  const kind: TargetKind = kindRaw === "universities" ? "universities" : "work";

  const [options, resumes, uniLists] = await Promise.all([
    Promise.resolve(getOptionSets()),
    Promise.resolve(listResumes(user.id)),
    Promise.resolve(listUniversityTargetLists())
  ]);

  const countrySet = Array.from(new Set([...options.countries, ...resumes.map((r) => r.country)].filter(Boolean)));
  const defaultCountry = country?.trim() || resumes[0]?.country || options.countries[0] || "Netherlands";

  if (kind === "work") {
    const targetList = getResumeTargetList(defaultCountry);
    const countries = Array.from(new Set([defaultCountry, ...countrySet]));

    return (
      <main className="soft-grid min-h-screen p-4 md:p-8">
        <section className="mx-auto max-w-7xl">
          <header className="glass rounded-[2.5rem] p-6 md:p-8">
            <div className="inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">
              <Send />
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{tp.workEyebrow}</p>
            <h1 className="mt-2 text-4xl font-black">{tp.workTitle}</h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">{tp.workSubtitle}</p>
            <TargetKindTabs kind={kind} tabWork={tp.tabWork} tabUniversities={tp.tabUniversities} />
            <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
              <input type="hidden" name="kind" value="work" />
              <label className="block min-w-72">
                <span className="text-sm font-semibold text-slate-200">{tp.country}</span>
                <select name="country" defaultValue={defaultCountry} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300">
                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <button className="rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950" type="submit">
                {tp.showTargets}
              </button>
              <Link href="/dashboard" className="rounded-2xl bg-white/10 px-5 py-3 font-bold text-white">
                {m.nav.dashboard}
              </Link>
            </form>
          </header>

          <section className="my-8 grid gap-4 md:grid-cols-3">
            <Stat label={tp.statCountry} value={targetList.country} />
            <Stat label={tp.statTargets} value={targetList.targets.length.toString()} />
            <Stat label={tp.statLastUpdate} value={targetList.updatedAt || m.common.defaultValue} />
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {targetList.targets.length === 0 && (
              <div className="glass rounded-[2rem] p-6">
                <h2 className="text-2xl font-black">{tp.noTargetsTitle}</h2>
                <p className="mt-3 text-slate-300">{t(m, "targetsPage.noTargetsBody", { country: targetList.country })}</p>
              </div>
            )}
            {targetList.targets.map((target, index) => (
              <TargetCard key={`${target.name}-${index}`} target={target} icon={<Building2 />} websiteLabel={tp.website} emailLabel={tp.email} />
            ))}
          </section>
        </section>
      </main>
    );
  }

  const defaultUniCountry = uniLists[0]?.country || defaultCountry;
  const uniCountry = country?.trim() || defaultUniCountry;
  const countries = Array.from(new Set([...countrySet, ...uniLists.map((u) => u.country), uniCountry].filter(Boolean)));
  const fields = listUniversityFieldsForCountry(uniCountry);
  const fieldParam = field?.trim() || "";
  const selectedField = fieldParam || fields[0] || "Computer Science & Engineering";
  const uniList = getUniversityTargetList(uniCountry, selectedField);

  return (
    <main className="soft-grid min-h-screen p-4 md:p-8">
      <section className="mx-auto max-w-7xl">
        <header className="glass rounded-[2.5rem] p-6 md:p-8">
          <div className="inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">
            <GraduationCap />
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{tp.uniEyebrow}</p>
          <h1 className="mt-2 text-4xl font-black">{tp.uniTitle}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">{tp.uniSubtitle}</p>
          <TargetKindTabs kind={kind} tabWork={tp.tabWork} tabUniversities={tp.tabUniversities} />
          <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
            <input type="hidden" name="kind" value="universities" />
            <label className="block min-w-56">
              <span className="text-sm font-semibold text-slate-200">{tp.country}</span>
              <select name="country" defaultValue={uniCountry} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300">
                {countries.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block min-w-72">
              <span className="text-sm font-semibold text-slate-200">{tp.fieldOfStudy}</span>
              <select name="field" defaultValue={selectedField} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300">
                {(fields.length ? fields : [selectedField]).map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <button className="rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950" type="submit">
              {tp.showList}
            </button>
            <Link href="/dashboard" className="rounded-2xl bg-white/10 px-5 py-3 font-bold text-white">
              {m.nav.dashboard}
            </Link>
          </form>
        </header>

        <section className="my-8 grid gap-4 md:grid-cols-3">
          <Stat label={tp.statCountry} value={uniList.country} />
          <Stat label={tp.statField} value={uniList.field || selectedField} />
          <Stat label={tp.statInstitutions} value={uniList.targets.length.toString()} />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {uniList.targets.length === 0 && (
            <div className="glass rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">{tp.noUniTitle}</h2>
              <p className="mt-3 text-slate-300">{t(m, "targetsPage.noUniBody", { country: uniCountry, field: selectedField })}</p>
            </div>
          )}
          {uniList.targets.map((target, index) => (
            <TargetCard key={`${target.name}-${index}`} target={target} icon={<GraduationCap />} websiteLabel={tp.website} emailLabel={tp.email} />
          ))}
        </section>
      </section>
    </main>
  );
}

function TargetKindTabs({ kind, tabWork, tabUniversities }: { kind: TargetKind; tabWork: string; tabUniversities: string }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <Link
        href="/targets?kind=work"
        className={`rounded-full px-4 py-2 text-sm font-black ${kind === "work" ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-white"}`}
      >
        {tabWork}
      </Link>
      <Link
        href="/targets?kind=universities"
        className={`rounded-full px-4 py-2 text-sm font-black ${kind === "universities" ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-white"}`}
      >
        {tabUniversities}
      </Link>
    </div>
  );
}

function TargetCard({
  target,
  icon,
  websiteLabel,
  emailLabel
}: {
  target: { type: string; name: string; url: string; email: string; location: string; notes: string; tags: string[] };
  icon: React.ReactNode;
  websiteLabel: string;
  emailLabel: string;
}) {
  return (
    <article className="glass rounded-[2rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">{icon}</div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">{target.type}</span>
      </div>
      <h2 className="mt-4 text-2xl font-black">{target.name}</h2>
      {target.location && (
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
          <MapPin size={15} /> {target.location}
        </p>
      )}
      <p className="mt-3 min-h-16 text-sm leading-6 text-slate-300">{target.notes}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {target.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {target.url && (
          <a href={target.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">
            {websiteLabel} <ExternalLink size={14} />
          </a>
        )}
        {target.email && (
          <a href={`mailto:${target.email}`} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
            {emailLabel} <Mail size={14} />
          </a>
        )}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-[2rem] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
