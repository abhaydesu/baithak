import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { COOKIE, sessionValid } from "@/lib/analytics/auth";
import { getSummary, type Row } from "@/lib/analytics/queries";
import { login, logout } from "./actions";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90];
const nf = new Intl.NumberFormat("en");

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; error?: string }>;
}) {
  const { days: daysParam, error } = await searchParams;
  const authed = sessionValid((await cookies()).get(COOKIE)?.value);

  if (!authed) {
    return (
      <main className="mx-auto w-full max-w-sm px-4 pt-10">
        <h1 className="font-display text-2xl font-extrabold">Analytics</h1>
        {!process.env.ANALYTICS_KEY ? (
          <p className="mt-4 text-ink-soft">
            Set <code>ANALYTICS_KEY</code> in your environment to enable this page.
          </p>
        ) : (
          <form action={login} className="mt-4 flex flex-col gap-3">
            <input
              name="key"
              type="password"
              required
              autoFocus
              placeholder="Access key"
              className="h-11 rounded-xl border border-line px-3"
            />
            {error && <p className="text-sm text-red-600">That key didn&apos;t match.</p>}
            <button className="keycap tone-white h-11 px-4">Open dashboard</button>
          </form>
        )}
      </main>
    );
  }

  const days = RANGES.includes(Number(daysParam)) ? Number(daysParam) : 30;
  const data = await getSummary(days);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">Analytics</h1>
        <div className="flex items-center gap-2">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/analytics?days=${r}`}
              className={`keycap h-9 px-3 text-sm ${r === days ? "tone-yellow" : "tone-white"}`}
            >
              {r}d
            </Link>
          ))}
          <form action={logout}>
            <button className="keycap tone-white h-9 px-3 text-sm">Log out</button>
          </form>
        </div>
      </div>

      {!data ? (
        <p className="text-ink-soft">
          Set <code>MONGODB_URI</code> to store and view events.
        </p>
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            {data.activeNow} active now · times in {data.timeZone}
          </p>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Stat label="Visitors" value={data.totals.visitors} prev={data.previous.visitors} />
            <Stat label="Sessions" value={data.totals.sessions} prev={data.previous.sessions} />
            <Stat label="Pageviews" value={data.totals.pageviews} prev={data.previous.pageviews} />
            <Stat label="Games started" value={data.totals.gamesStarted} prev={data.previous.gamesStarted} />
            <Stat
              label="Games finished"
              value={data.totals.gamesFinished}
              prev={data.previous.gamesFinished}
              note={
                data.totals.gamesStarted
                  ? `${Math.round((data.totals.gamesFinished / data.totals.gamesStarted) * 100)}% of started`
                  : undefined
              }
            />
          </section>

          <Panel title={`Daily visitors, last ${days} days`}>
            <DailyChart daily={data.daily} />
          </Panel>

          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="New vs returning visitors">
              <Bars
                rows={[
                  { label: "New", count: data.newVisitors },
                  { label: "Returning", count: data.returningVisitors },
                ]}
              />
            </Panel>
            <Panel title="Busiest days">
              <Columns
                values={data.weekdays}
                labels={["S", "M", "T", "W", "T", "F", "S"]}
              />
            </Panel>
          </div>

          <Panel title="Pageviews by hour of day">
            <Columns
              values={data.hours}
              labels={data.hours.map((_, h) => (h % 3 === 0 ? String(h) : ""))}
            />
          </Panel>

          <Panel title="Games">
            {data.games.length === 0 ? (
              <Empty />
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-ink-soft">
                  <tr>
                    <th className="py-1 font-medium">Game</th>
                    <th className="py-1 text-right font-medium">Started</th>
                    <th className="py-1 text-right font-medium">Finished</th>
                    <th className="py-1 text-right font-medium">Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {data.games.map((g) => (
                    <tr key={g.game} className="border-t border-line">
                      <td className="py-2 font-medium">{g.game}</td>
                      <td className="py-2 text-right tabular-nums">{nf.format(g.started)}</td>
                      <td className="py-2 text-right tabular-nums">{nf.format(g.finished)}</td>
                      <td className="py-2 text-right tabular-nums">
                        {g.started ? `${Math.round((g.finished / g.started) * 100)}%` : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="Top pages"><Bars rows={data.topPages} /></Panel>
            <Panel title="Sources (utm or referrer)"><Bars rows={data.sources} /></Panel>
            <Panel title="Devices"><Bars rows={data.devices} /></Panel>
            <Panel title="Countries"><Bars rows={data.countries} /></Panel>
          </div>
        </>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  prev,
  note,
}: {
  label: string;
  value: number;
  prev: number;
  note?: string;
}) {
  const delta = prev ? Math.round(((value - prev) / prev) * 100) : null;
  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="font-display text-3xl font-extrabold tabular-nums">{nf.format(value)}</p>
      <p className="text-xs text-ink-soft">
        {delta === null ? (prev === 0 && value > 0 ? "new" : "–") : (
          <span className={delta >= 0 ? "text-green-700" : "text-red-600"}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}{" "}
        vs previous period
      </p>
      {note && <p className="text-xs text-ink-soft">{note}</p>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-paper p-4 sm:p-5">
      <h2 className="mb-3 font-display text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

const Empty = () => <p className="text-sm text-ink-soft">No data yet.</p>;

function Bars({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return <Empty />;
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <ul className="flex flex-col gap-2 text-sm">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between gap-3">
            <span className="truncate">{r.label}</span>
            <span className="tabular-nums text-ink-soft">{nf.format(r.count)}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-paper-deep">
            <div
              className="h-full rounded-full bg-ink"
              style={{ width: `${(r.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DailyChart({ daily }: { daily: { day: string; pageviews: number; visitors: number }[] }) {
  const max = Math.max(1, ...daily.map((d) => d.visitors));
  return (
    <div>
      <div className="flex h-40 items-end gap-px">
        {daily.map((d) => (
          <div
            key={d.day}
            title={`${d.day}: ${d.visitors} visitors, ${d.pageviews} pageviews`}
            className="min-h-px flex-1 rounded-t-sm bg-ink"
            style={{ height: `${(d.visitors / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-soft">
        <span>{daily[0]?.day}</span>
        <span>peak {nf.format(max)}</span>
        <span>{daily.at(-1)?.day}</span>
      </div>
    </div>
  );
}

function Columns({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-32 items-end gap-1">
      {values.map((v, i) => (
        <div key={i} className="flex h-full flex-1 flex-col justify-end text-center">
          <div
            title={String(v)}
            className="min-h-px rounded-t-sm bg-ink"
            style={{ height: `${(v / max) * 85}%` }}
          />
          <span className="h-4 text-[10px] leading-4 text-ink-soft">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
