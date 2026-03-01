"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
} from "recharts";

interface DashboardRow {
  year: number;
  pepsi_index: number | null;
  coke_index: number | null;
  pepsi_3q: number | null;
  cocacola_3q: number | null;
  coke_3q: number | null;
  pepsi_share: number | null;
  burger_king_index: number | null;
  mcdonalds_index: number | null;
  bk_share: number | null;
  world_quality_index: number | null;
  cpi: number | null;
  unemployment: number | null;
  consumer_confidence: number | null;
  happiness: number | null;
  crime_rate: number | null;
  gdp_growth: number | null;
  pepsi_raw: number | null;
  bk_raw: number | null;
}

interface MonthlyTrendRow {
  date: string;
  pepsi_3q: number;
  cocacola_3q: number;
  coke_3q: number;
}

interface MonthlyBurgerRow {
  date: string;
  burger_king: number;
  mcdonalds: number;
}

interface MonthlyShareRow {
  date: string;
  pepsi_share: number;
  bk_share: number;
}

interface MonthlyUnderdogRow {
  date: string;
  pepsi: number;
  burger_king: number;
  world_quality_index: number | null;
}

interface MonthlyWqiRow {
  date: string;
  world_quality_index: number;
}

interface DashboardData {
  generated_at: string;
  methodology: string;
  data: DashboardRow[];
  monthly_trends: MonthlyTrendRow[];
  monthly_burger_trends: MonthlyBurgerRow[];
  monthly_share_trends: MonthlyShareRow[];
  monthly_underdog_trends: MonthlyUnderdogRow[];
  monthly_wqi: MonthlyWqiRow[];
}

const PEPSI_BLUE = "#004B93";
const COKE_RED = "#F40009";
const BK_ORANGE = "#D62300";
const MCD_GOLD = "#FFC72C";
const QUALITY_GREEN = "#10B981";
const GRID_COLOR = "#E5E7EB";

function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs font-mono opacity-40 hover:opacity-70 transition-opacity underline"
    >
      {label}
    </a>
  );
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 3) return 0;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);
  const sumY2 = ys.reduce((a, y) => a + y * y, 0);
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return den === 0 ? 0 : num / den;
}

function strengthLabel(r: number): string {
  const abs = Math.abs(r);
  if (abs > 0.7) return "Strong";
  if (abs > 0.4) return "Moderate";
  return "Weak";
}

function CorrelationBadge({
  r,
  label,
  color,
}: {
  r: number;
  label: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className="text-4xl font-black tabular-nums" style={{ color }}>
        {r > 0 ? "+" : ""}
        {r.toFixed(3)}
      </p>
      <p className="text-sm opacity-60 mt-1">{label}</p>
      <p className="text-xs opacity-40">{strengthLabel(r)} correlation</p>
    </div>
  );
}

function CorrelationSection({ data }: { data: DashboardRow[] }) {
  const pepsiValid = data.filter(
    (d) => d.pepsi_raw != null && d.world_quality_index != null,
  );
  const bkValid = data.filter(
    (d) => d.bk_raw != null && d.world_quality_index != null,
  );
  const underdogValid = data.filter(
    (d) => d.pepsi_raw != null && d.bk_raw != null,
  );

  const rPepsiWorld = pearson(
    pepsiValid.map((d) => d.pepsi_raw!),
    pepsiValid.map((d) => d.world_quality_index!),
  );
  const rBkWorld = pearson(
    bkValid.map((d) => d.bk_raw!),
    bkValid.map((d) => d.world_quality_index!),
  );
  const rUnderdogs = pearson(
    underdogValid.map((d) => d.pepsi_raw!),
    underdogValid.map((d) => d.bk_raw!),
  );

  return (
    <div className="py-8">
      <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1 text-center">
        The punchline
      </p>
      <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-center">
        Pearson Correlations (2004&ndash;2024)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <CorrelationBadge
          r={rPepsiWorld}
          label="Pepsi vs World Quality"
          color={QUALITY_GREEN}
        />
        <CorrelationBadge
          r={rBkWorld}
          label="BK vs World Quality"
          color={BK_ORANGE}
        />
        <CorrelationBadge
          r={rUnderdogs}
          label="Pepsi vs Burger King"
          color={PEPSI_BLUE}
        />
      </div>
    </div>
  );
}

function CollapsibleTable({
  data,
  columns,
}: {
  data: DashboardRow[];
  columns: {
    key: keyof DashboardRow;
    label: string;
    format?: (v: number | null) => string;
  }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="mt-3"
    >
      <summary className="text-xs font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-70 cursor-pointer select-none">
        {open ? "Hide" : "Show"} data table
      </summary>
      <div className="mt-2 max-h-64 overflow-auto border border-base-300 rounded">
        <table className="table table-xs table-pin-rows w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="text-xs font-mono">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.year}>
                {columns.map((col) => {
                  const val = row[col.key];
                  return (
                    <td key={String(col.key)} className="text-xs tabular-nums">
                      {val == null
                        ? "\u2014"
                        : col.format
                          ? col.format(val as number)
                          : val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function MonthlyCollapsibleTable({ data }: { data: MonthlyTrendRow[] }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="mt-3"
    >
      <summary className="text-xs font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-70 cursor-pointer select-none">
        {open ? "Hide" : "Show"} data table
      </summary>
      <div className="mt-2 max-h-64 overflow-auto border border-base-300 rounded">
        <table className="table table-xs table-pin-rows w-full">
          <thead>
            <tr>
              <th className="text-xs font-mono">Date</th>
              <th className="text-xs font-mono">&quot;Coke&quot;</th>
              <th className="text-xs font-mono">Pepsi</th>
              <th className="text-xs font-mono">Coca-Cola</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.date}>
                <td className="text-xs tabular-nums">{row.date}</td>
                <td className="text-xs tabular-nums">{row.coke_3q}</td>
                <td className="text-xs tabular-nums">{row.pepsi_3q}</td>
                <td className="text-xs tabular-nums">{row.cocacola_3q}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function MonthlyBurgerCollapsibleTable({
  data,
}: {
  data: MonthlyBurgerRow[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="mt-3"
    >
      <summary className="text-xs font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-70 cursor-pointer select-none">
        {open ? "Hide" : "Show"} data table
      </summary>
      <div className="mt-2 max-h-64 overflow-auto border border-base-300 rounded">
        <table className="table table-xs table-pin-rows w-full">
          <thead>
            <tr>
              <th className="text-xs font-mono">Date</th>
              <th className="text-xs font-mono">Burger King</th>
              <th className="text-xs font-mono">McDonald&apos;s</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.date}>
                <td className="text-xs tabular-nums">{row.date}</td>
                <td className="text-xs tabular-nums">{row.burger_king}</td>
                <td className="text-xs tabular-nums">{row.mcdonalds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function MonthlyUnderdogCollapsibleTable({
  data,
}: {
  data: MonthlyUnderdogRow[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="mt-3"
    >
      <summary className="text-xs font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-70 cursor-pointer select-none">
        {open ? "Hide" : "Show"} data table
      </summary>
      <div className="mt-2 max-h-64 overflow-auto border border-base-300 rounded">
        <table className="table table-xs table-pin-rows w-full">
          <thead>
            <tr>
              <th className="text-xs font-mono">Date</th>
              <th className="text-xs font-mono">Pepsi</th>
              <th className="text-xs font-mono">Burger King</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.date}>
                <td className="text-xs tabular-nums">{row.date}</td>
                <td className="text-xs tabular-nums">{row.pepsi}</td>
                <td className="text-xs tabular-nums">{row.burger_king}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function MonthlyShareCollapsibleTable({
  data,
}: {
  data: MonthlyShareRow[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="mt-3"
    >
      <summary className="text-xs font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-70 cursor-pointer select-none">
        {open ? "Hide" : "Show"} data table
      </summary>
      <div className="mt-2 max-h-64 overflow-auto border border-base-300 rounded">
        <table className="table table-xs table-pin-rows w-full">
          <thead>
            <tr>
              <th className="text-xs font-mono">Date</th>
              <th className="text-xs font-mono">Pepsi Share</th>
              <th className="text-xs font-mono">BK Share</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.date}>
                <td className="text-xs tabular-nums">{row.date}</td>
                <td className="text-xs tabular-nums">
                  {row.pepsi_share.toFixed(1)}%
                </td>
                <td className="text-xs tabular-nums">
                  {row.bk_share.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function MetricChart({
  data,
  dataKey,
  label,
  color,
  unit,
  invert,
  allowNegative,
  narrative,
  sourceUrl,
  sourceLabel,
}: {
  data: DashboardRow[];
  dataKey: keyof DashboardRow;
  label: string;
  color: string;
  unit?: string;
  invert?: boolean;
  allowNegative?: boolean;
  narrative: string;
  sourceUrl: string;
  sourceLabel: string;
}) {
  const formatVal = (v: number | null) => {
    if (v == null) return "\u2014";
    if (unit === "%") return v.toFixed(1) + "%";
    if (unit === "/100k") return v.toFixed(0);
    return typeof v === "number"
      ? Number.isInteger(v)
        ? String(v)
        : v.toFixed(2)
      : String(v);
  };

  return (
    <div className="bg-base-100 p-4 flex flex-col h-full">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-tight mb-1">
          {label}
          {invert && (
            <span className="text-xs font-normal opacity-40 ml-2">
              (lower is better)
            </span>
          )}
        </h3>
        <p className="text-xs opacity-50 mb-3 leading-relaxed">{narrative}</p>
      </div>
      <div className="mt-auto">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              unit={unit}
              domain={allowNegative ? ["auto", "auto"] : [0, "auto"]}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2">
          <SourceLink href={sourceUrl} label={sourceLabel} />
        </div>
        <CollapsibleTable
          data={data.filter((d) => d[dataKey] != null)}
          columns={[
            { key: "year", label: "Year" },
            { key: dataKey, label, format: formatVal },
          ]}
        />
      </div>
    </div>
  );
}

export default function PepsiWorldIndexPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/dashboard_data.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load data: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  const trendsData = data.data.filter((d) => d.pepsi_index != null);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b-3 border-base-content bg-base-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <a
            href="/"
            className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 hover:opacity-70 transition-opacity"
          >
            &larr; Back to portfolio
          </a>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mt-4">
            Was the World Better When Pepsi Was King?
          </h1>
          <p className="text-lg opacity-60 mt-2">
            A data engineering project correlating Pepsi vs Coca-Cola search
            popularity with world quality metrics. Inspired by a podcast claim
            that &ldquo;we are the coolest at times in history where Burger King
            and Pepsi are the driving force in society.&rdquo;
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Python", "dbt", "DuckDB", "Pydantic", "Recharts", "Next.js"].map(
              (tag) => (
                <span
                  key={tag}
                  className="badge badge-outline badge-sm font-mono"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>
      </header>

      {/* Single continuous content box */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="border-3 border-base-content bg-base-100 p-6 md:p-10">
          {/* Intro */}
          <p className="text-base leading-relaxed opacity-70">
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-3 self-start">
              The inspiration
            </p>
            It started, as most great intellectual pursuits do, while watching
            my favorite podcast{" "}
            <a
              href="https://www.youtube.com/@AreYouGarbage"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-100"
            >
              Are You Garbage
            </a>
            . Hosts Kippy and Foley were joined by comedian and podcaster, Tim
            Dillon on an epsiode of Are You Garbage, a show where they find out
            if your favorite comedians grew up to be classy... or just a big ol
            piece of trash (trash trash trash). I encourage you all to watch the
            clip in its entirity as they dive into topics such as their
            continually evolving opinion of the birthday cake flavor which
            allowed the common american to drown out the woes of the 2008
            housing crisis. The conversation shifts, however, at the 3-minute
            mark to speak on the popularity of Burger King and Pepsi, and the
            importance of an underdog story.
          </p>

          <blockquote className="my-6 border-l-4 border-base-content/30 pl-6 py-2">
            <p className="text-lg md:text-xl italic leading-relaxed opacity-80">
              &ldquo;I have a theory that I have expressed to Kevin [Kippy] in
              private, that our culture, as Americans, we are the coolest at
              times in history where Burger King and Pepsi are the driving
              force.&rdquo;
            </p>
            <footer className="mt-2 text-sm font-mono opacity-50">
              &mdash; H. Foley, <cite>Are You Garbage</cite>
            </footer>
          </blockquote>

          <p className="text-base leading-relaxed opacity-70">
            I did what any reasonable person would do. I scrubbed Google search
            history and the Bureau of Labor Statistics website to build a 'world
            quality index' to find out if guys arguing about trash culture on a
            comedy podcast had (not so accidentally) stumbled onto an empirical
            truth.
          </p>

          {/* YouTube embed */}
          <div className="my-8 flex flex-col items-center">
            <div className="aspect-video w-full max-w-2xl">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/XFxL7m4cd7E"
                title="Was the world better when Pepsi was king?"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Breakout metrics grid */}
          <p className="text-base leading-relaxed opacity-70 mb-4">
            Before we get to the composite, let&apos;s look at the raw
            ingredients. The "World Quality Index" as I'm calling it, is built
            from six economic and social metrics, each normalized to 0&ndash;100
            and weighted equally. &ldquo;Bad&rdquo; metrics like inflation,
            unemployment, and crime are inverted so that higher always means
            better.
          </p>
          <p className="text-base leading-relaxed opacity-70 mb-6">
            Equal weighting is a deliberate choice. More sophisticated
            approaches exist &mdash; principal component analysis, factor
            loading, or even asking Tim Dillon to rank them by how much each one
            makes him angry &mdash; but equal weights keep the index transparent
            and reproducible. Every metric gets the same vote. The tradeoff is
            that a single dramatic outlier (say, the 2020 COVID unemployment
            spike) can pull the composite disproportionately, but normalization
            across the full 35-year window dampens this effect. The goal was
            never to build a replacement for the Human Development Index; it was
            to see if a comedian&apos;s hot take about Pepsi holds up under even
            basic quantitative scrutiny.
          </p>

          <div className="mb-8">
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1">
              The ingredients
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">
              Individual World Quality Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-base-300 md:[&>*]:border-b md:[&>*]:border-base-300 md:[&>*:nth-child(odd)]:border-r lg:[&>*]:border-b lg:[&>*]:border-base-300 lg:[&>*:not(:nth-child(3n))]:border-r">
              <MetricChart
                data={data.data}
                dataKey="unemployment"
                label="Unemployment Rate"
                color="#6366F1"
                unit="%"
                invert
                narrative="Peaked at 9.6% in 2010 after the Great Recession, recovered to pre-crisis lows by 2019, then spiked again during COVID. The 1990s saw a steady decline from 7.5% to 4.0%."
                sourceUrl="https://www.bls.gov/charts/employment-situation/civilian-unemployment-rate.htm"
                sourceLabel="Source: Bureau of Labor Statistics"
              />
              <MetricChart
                data={data.data}
                dataKey="cpi"
                label="Consumer Price Index"
                color="#EC4899"
                invert
                narrative="The cost of living has more than doubled since 1990. The post-COVID inflation surge from 2021-2023 was the steepest climb in decades, pushing CPI from 271 to 315."
                sourceUrl="https://www.bls.gov/cpi/"
                sourceLabel="Source: Bureau of Labor Statistics"
              />
              <MetricChart
                data={data.data}
                dataKey="consumer_confidence"
                label="Consumer Confidence"
                color="#F59E0B"
                narrative="How optimistic are Americans about the economy? Confidence peaked in the late 1990s dot-com boom, cratered during the 2008 financial crisis, and has never fully recovered to those late-90s highs."
                sourceUrl="https://fred.stlouisfed.org/series/UMCSENT"
                sourceLabel="Source: FRED / U. Michigan"
              />
              <MetricChart
                data={data.data}
                dataKey="happiness"
                label="US Happiness Score"
                color="#10B981"
                narrative="The World Happiness Report only goes back to 2005. The US has seen a slow but persistent decline from 7.09 to 6.60 — a drop that accelerated after 2019. We're getting less happy."
                sourceUrl="https://worldhappiness.report/"
                sourceLabel="Source: World Happiness Report"
              />
              <MetricChart
                data={data.data}
                dataKey="crime_rate"
                label="Violent Crime Rate"
                color="#EF4444"
                unit="/100k"
                invert
                narrative="Violent crime has actually improved dramatically since 1990, falling from 732 to 358 per 100,000. This is the one metric that decisively says the world has gotten better, not worse."
                sourceUrl="https://cde.ucr.cjis.gov/"
                sourceLabel="Source: FBI Crime Data Explorer"
              />
              <MetricChart
                data={data.data}
                dataKey="gdp_growth"
                label="GDP Growth"
                color="#3B82F6"
                unit="%"
                allowNegative
                narrative="The 1990s saw consistent 3-5% growth. Since 2000, growth has been more volatile — the 2009 and 2020 recessions both produced negative GDP. The 2021 rebound of 5.95% was an outlier."
                sourceUrl="https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=US"
                sourceLabel="Source: World Bank"
              />
            </div>
          </div>

          {/* World Quality Index chart */}
          <p className="text-base leading-relaxed opacity-70 mb-4">
            Now let&apos;s combine them. The composite World Quality Index rolls
            those six metrics into a single 0&ndash;100 score. The higher the
            number, the &ldquo;better&rdquo; the world. Foley mentioned in the
            clip that we are &apos;at our coolest&apos; which (some would say)
            is subjective (I for one agree with the gang here).
          </p>
          <p className="text-base leading-relaxed opacity-70 mb-6">
            To construct this index, each of the six underlying metrics is
            min-max normalized across the full 1990&ndash;2024 observation
            window using the formula{" "}
            <code className="text-sm bg-base-200 px-1.5 py-0.5 rounded font-mono">
              (x &minus; x<sub>min</sub>) / (x<sub>max</sub> &minus; x
              <sub>min</sub>) &times; 100
            </code>
            . For &ldquo;bad&rdquo; indicators &mdash; CPI, unemployment, and
            violent crime &mdash; the result is inverted (subtracted from 100)
            so that a higher score always means a better outcome. The composite
            is then a simple arithmetic mean of whichever metrics have non-null
            values for a given year, which means the index is more robust in
            later years where all six sources report data. Think of it less as a
            rigorous macroeconomic indicator and more as a vibes-based
            thermometer calibrated with real federal data &mdash; which,
            honestly, is about as scientific as Foley&apos;s original thesis.
          </p>

          <div className="mb-8">
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1">
              The big picture
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              World Quality Index (1990&ndash;2024)
            </h2>
            <p className="text-sm opacity-50 mb-4">
              A weighted composite of normalized CPI (inverted), unemployment
              (inverted), consumer confidence, happiness, crime rate (inverted),
              and GDP growth. Each metric is scaled to 0&ndash;100 and averaged,
              with null values excluded per year.
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={data.monthly_wqi}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: string) => v.slice(0, 4)}
                  ticks={data.monthly_wqi
                    .filter((d) => d.date.endsWith("-01"))
                    .filter((_, i) => i % 3 === 0)
                    .map((d) => d.date)}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  label={{
                    value: "World Quality Index",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: QUALITY_GREEN },
                  }}
                />
                <Tooltip labelFormatter={(v) => String(v)} />
                <Area
                  type="monotone"
                  dataKey="world_quality_index"
                  fill={QUALITY_GREEN}
                  fillOpacity={0.15}
                  stroke={QUALITY_GREEN}
                  strokeWidth={2}
                  name="World Quality Index"
                />
              </ComposedChart>
            </ResponsiveContainer>
            <CollapsibleTable
              data={data.data}
              columns={[
                { key: "year", label: "Year" },
                {
                  key: "world_quality_index",
                  label: "World Quality Index",
                  format: (v) => (v != null ? v.toFixed(1) : "\u2014"),
                },
              ]}
            />
          </div>

          {/* Cola wars narrative + chart */}
          <p className="text-base leading-relaxed opacity-70 mb-4">
            Now let&apos;s look at the cola war. Google Trends data starts in
            January 2004, which is as far back as Google&apos;s search index
            goes. In 2004, Pepsi dominated search interest. By 2008, Coke had
            overtaken it. The gap has only widened since.
          </p>
          <p className="text-base leading-relaxed opacity-70 mb-6">
            A quick note on methodology: Google Trends reports relative search
            interest on a 0&ndash;100 scale, where 100 represents the peak
            search volume for a given term within the queried time range. We
            pull annual averages of monthly data for each brand pair (Pepsi vs
            Coca-Cola, Burger King vs McDonald&apos;s) across the US from
            January 2004 to December 2024. These are not absolute search volumes
            &mdash; Google normalizes to protect proprietary data &mdash; but
            the relative trajectories are what matter here. As Kippy might say:
            &ldquo;the numbers don&apos;t lie.&rdquo;
          </p>

          <div className="mb-8">
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1">
              The cola wars
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              Search Interest: Pepsi vs Coca-Cola
            </h2>
            <p className="text-sm opacity-50 mb-4">
              Relative search interest on a 0&ndash;100 scale. The solid lines
              show the search terms &ldquo;Pepsi&rdquo; and
              &ldquo;Coca-Cola.&rdquo; The dashed line shows the raw search
              term &ldquo;Coke&rdquo; &mdash; which starts much higher but
              declines steeply as the word becomes less associated with the
              soda over time.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthly_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: string) => v.slice(0, 4)}
                  ticks={data.monthly_trends
                    .filter((d) => d.date.endsWith("-01"))
                    .filter((_, i) => i % 2 === 0)
                    .map((d) => d.date)}
                />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip labelFormatter={(v) => String(v)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="coke_3q"
                  stroke={COKE_RED}
                  strokeWidth={2}
                  dot={false}
                  name={'"Coke" (search term)'}
                />
                <Line
                  type="monotone"
                  dataKey="pepsi_3q"
                  stroke={PEPSI_BLUE}
                  strokeWidth={2}
                  dot={false}
                  name="Pepsi"
                />
                <Line
                  type="monotone"
                  dataKey="cocacola_3q"
                  stroke={COKE_RED}
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 4"
                  opacity={0.6}
                  name="Coca-Cola (search term)"
                />
                <ReferenceLine
                  x="2017-04"
                  stroke={PEPSI_BLUE}
                  strokeDasharray="6 3"
                  strokeOpacity={0.8}
                  label={{
                    value: "Kendall Jenner ad",
                    position: "insideTopRight",
                    fill: PEPSI_BLUE,
                    fontSize: 10,
                    dy: 6,
                  }}
                />
                <ReferenceLine
                  x="2014-07"
                  stroke={COKE_RED}
                  strokeDasharray="6 3"
                  strokeOpacity={0.8}
                  label={{
                    value: '"Share a Coke"',
                    position: "insideTopRight",
                    fill: COKE_RED,
                    fontSize: 10,
                    dy: 6,
                  }}
                />
                <ReferenceLine
                  x="2006-06"
                  stroke={COKE_RED}
                  strokeDasharray="6 3"
                  strokeOpacity={0.8}
                  label={{
                    value: "FIFA World Cup",
                    position: "insideTopRight",
                    fill: COKE_RED,
                    fontSize: 10,
                    dy: 6,
                  }}
                />
                <ReferenceLine
                  x="2004-02"
                  stroke={PEPSI_BLUE}
                  strokeDasharray="6 3"
                  strokeOpacity={0.8}
                  label={{
                    value: "Britney Spears SB ad",
                    position: "insideTopRight",
                    fill: PEPSI_BLUE,
                    fontSize: 10,
                    dy: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2">
              <SourceLink
                href="https://trends.google.com/trends/explore?date=all&geo=US&q=Pepsi,Coca-Cola,Coke"
                label="Source: Google Trends"
              />
            </div>
            <MonthlyCollapsibleTable data={data.monthly_trends} />
          </div>

          {/* Dialect digression */}
          <p className="text-base leading-relaxed opacity-70 mb-4">
            When all three search terms are queried together, a striking
            pattern emerges: &ldquo;Coke&rdquo; dominates the chart, compressing
            both &ldquo;Pepsi&rdquo; and &ldquo;Coca-Cola&rdquo; to the bottom
            of the scale. The dashed line &mdash; &ldquo;Coca-Cola&rdquo; as a
            literal search term &mdash; barely registers. This is because most
            people simply type &ldquo;Coke&rdquo; when searching for the brand.
            But therein lies the problem: the word &ldquo;Coke&rdquo; is
            hopelessly ambiguous.
          </p>
          <p className="text-base leading-relaxed opacity-70 mb-4">
            The word &ldquo;Coke&rdquo; is one of the most overloaded terms in
            the American English lexicon. In much of the South &mdash; roughly a
            belt stretching from Texas through Georgia &mdash;
            &ldquo;coke&rdquo; (lowercase) is a generic noun for <em>any</em>{" "}
            carbonated beverage. You can walk into a restaurant in Atlanta, ask
            for a coke, and get asked &ldquo;what kind?&rdquo; to which
            &ldquo;Sprite&rdquo; is a perfectly acceptable answer. Meanwhile,
            the Midwest calls it &ldquo;pop,&rdquo; the Northeast and West Coast
            say &ldquo;soda,&rdquo; and everyone on the internet has been
            arguing about this since the dawn of web forums. And of course,
            there&apos;s the <em>other</em> kind of coke &mdash; the kind that
            would significantly skew a Google Trends query and that we will not
            be building a World Quality Index around (at least not in this
            version).
          </p>
          <p className="text-base leading-relaxed opacity-70 mb-4">
            This is precisely why our core analysis uses &ldquo;Coca-Cola&rdquo;
            as the search term rather than &ldquo;Coke&rdquo; &mdash; it&apos;s
            unambiguous. Google Trends does offer <strong>topic-level</strong>{" "}
            search that uses the Knowledge Graph to disambiguate, aggregating
            &ldquo;Coke,&rdquo; &ldquo;Coca Cola,&rdquo; and related queries
            while filtering out cocaine and petroleum coke references. Ideally,
            we&apos;d pull that topic-level data through the pipeline for a
            cleaner comparison. For now, the dashed line gives you a sense of
            the noise &mdash; and why &ldquo;Coca-Cola&rdquo; is the safer
            proxy.
          </p>
          <p className="text-base leading-relaxed opacity-70 mb-6">
            Either way, the directional story holds: Pepsi is fading. Whether
            Pepsi was ever truly &ldquo;king&rdquo; depends on how you count
            &mdash; against the formal &ldquo;Coca-Cola&rdquo; term, it was
            ahead until 2008. Against the full universe of Coke-related
            searches, it may never have been. Maybe Pepsi was always the
            underdog. Maybe that&apos;s exactly Foley&apos;s point.
          </p>

          {/* Burger King vs McDonald's */}
          <p className="text-base leading-relaxed opacity-70 mb-6">
            But Pepsi isn&apos;t the only #2 brand that lost ground. The
            original podcast claim mentioned Burger King too. Let&apos;s see if
            BK&apos;s search interest tells the same story.
          </p>

          <div className="mb-8">
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1">
              The burger wars
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              Search Interest: Burger King vs McDonald&apos;s
            </h2>
            <p className="text-sm opacity-50 mb-4">
              The same pattern repeats. Burger King&apos;s search interest has
              steadily declined while McDonald&apos;s has grown. The #2 brands
              are losing cultural mindshare in parallel.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthly_burger_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: string) => v.slice(0, 4)}
                  ticks={data.monthly_burger_trends
                    .filter((d) => d.date.endsWith("-01"))
                    .filter((_, i) => i % 2 === 0)
                    .map((d) => d.date)}
                />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip labelFormatter={(v) => String(v)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="burger_king"
                  stroke={BK_ORANGE}
                  strokeWidth={2}
                  dot={false}
                  name="Burger King"
                />
                <Line
                  type="monotone"
                  dataKey="mcdonalds"
                  stroke={MCD_GOLD}
                  strokeWidth={2}
                  dot={false}
                  name="McDonald's"
                />
                <ReferenceLine
                  x="2015-03"
                  stroke={BK_ORANGE}
                  strokeDasharray="6 3"
                  strokeOpacity={0.8}
                  label={{
                    value: "Chicken Fries return",
                    position: "insideTopRight",
                    fill: BK_ORANGE,
                    fontSize: 10,
                    dy: 6,
                  }}
                />
                <ReferenceLine
                  x="2019-08"
                  stroke={BK_ORANGE}
                  strokeDasharray="6 3"
                  strokeOpacity={0.8}
                  label={{
                    value: "Impossible Whopper",
                    position: "insideTopRight",
                    fill: BK_ORANGE,
                    fontSize: 10,
                    dy: 6,
                  }}
                />
                <ReferenceLine
                  x="2019-06"
                  stroke={MCD_GOLD}
                  strokeDasharray="6 3"
                  strokeOpacity={0.8}
                  label={{
                    value: "Celebrity meals era",
                    position: "insideTopLeft",
                    fill: MCD_GOLD,
                    fontSize: 10,
                    dy: 6,
                  }}
                />
                <ReferenceLine
                  x="2022-08"
                  stroke={BK_ORANGE}
                  strokeDasharray="6 3"
                  strokeOpacity={0.8}
                  label={{
                    value: "French Toast Stick Wars",
                    position: "insideTopRight",
                    fill: BK_ORANGE,
                    fontSize: 10,
                    dy: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2">
              <SourceLink
                href="https://trends.google.com/trends/explore?date=all&geo=US&q=Burger%20King,McDonalds"
                label="Source: Google Trends"
              />
            </div>
            <MonthlyBurgerCollapsibleTable
              data={data.monthly_burger_trends}
            />
          </div>

          {/* Underdogs chart: Pepsi share vs BK share */}
          <p className="text-base leading-relaxed opacity-70 mb-4">
            Here&apos;s where it gets interesting. If we plot Pepsi&apos;s share
            of the cola market against Burger King&apos;s share of the burger
            market (both measured by search interest), they track almost
            perfectly. The underdogs are fading together.
          </p>
          <p className="text-base leading-relaxed opacity-70 mb-6">
            &ldquo;Share&rdquo; here is computed as a simple ratio:{" "}
            <code className="text-sm bg-base-200 px-1.5 py-0.5 rounded font-mono">
              Pepsi / (Pepsi + Coke) &times; 100
            </code>{" "}
            and likewise for Burger King. This isolates each brand&apos;s
            relative cultural mindshare against its direct rival, filtering out
            broader trends in search volume growth. A value of 50% means
            perfectly even interest; anything below means the underdog is losing
            ground. The fact that two completely unrelated product categories
            &mdash; soft drinks and fast food &mdash; show nearly identical
            decline curves is either a remarkable coincidence or evidence of the
            broader phenomenon Foley was describing: when the scrappy #2 brands
            lose their swagger, something shifts in the culture.
          </p>

          <div className="mb-8">
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1">
              The underdogs
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              Pepsi Share vs Burger King Share
            </h2>
            <p className="text-sm opacity-50 mb-4">
              Both lines show each underdog&apos;s relative search interest,
              normalized together on the same 0&ndash;100 scale by Google
              Trends. In 2004 Pepsi led; by 2009 Burger King had overtaken
              it, and the gap has only widened since.
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={data.monthly_underdog_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: string) => v.slice(0, 4)}
                  ticks={data.monthly_underdog_trends
                    .filter((d) => d.date.endsWith("-01"))
                    .filter((_, i) => i % 2 === 0)
                    .map((d) => d.date)}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  label={{
                    value: "Search Interest",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: "#666" },
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  label={{
                    value: "World Quality Index",
                    angle: 90,
                    position: "insideRight",
                    style: { fontSize: 11, fill: QUALITY_GREEN },
                  }}
                />
                <Tooltip labelFormatter={(v) => String(v)} />
                <Legend />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="world_quality_index"
                  fill={QUALITY_GREEN}
                  fillOpacity={0.1}
                  stroke={QUALITY_GREEN}
                  strokeWidth={2}
                  name="World Quality Index"
                  connectNulls
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="pepsi"
                  stroke={PEPSI_BLUE}
                  strokeWidth={2}
                  dot={false}
                  name="Pepsi"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="burger_king"
                  stroke={BK_ORANGE}
                  strokeWidth={2}
                  dot={false}
                  name="Burger King"
                />
                <ReferenceLine
                  yAxisId="left"
                  x="2017-04"
                  stroke={PEPSI_BLUE}
                  strokeDasharray="6 3"
                  strokeOpacity={0.8}
                  label={{
                    value: "Kendall Jenner ad",
                    position: "insideTopRight",
                    fill: PEPSI_BLUE,
                    fontSize: 10,
                    dy: 6,
                  }}
                />
                <ReferenceLine
                  yAxisId="left"
                  x="2019-08"
                  stroke={BK_ORANGE}
                  strokeDasharray="6 3"
                  strokeOpacity={0.8}
                  label={{
                    value: "Impossible Whopper",
                    position: "insideTopRight",
                    fill: BK_ORANGE,
                    fontSize: 10,
                    dy: 6,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-2">
              <SourceLink
                href="https://trends.google.com/trends/explore?date=all&geo=US&q=Pepsi,Burger%20King"
                label="Source: Google Trends"
              />
            </div>
            <MonthlyUnderdogCollapsibleTable
              data={data.monthly_underdog_trends}
            />
          </div>

          {/* Verdict */}
          <p className="text-base leading-relaxed opacity-70 mb-2">
            So what&apos;s the verdict? Crime is way down. But inflation is way
            up, consumer confidence never recovered from the 2008 crash,
            happiness is declining, and GDP growth is more volatile. The
            composite index peaked in the late 1990s and has been on a bumpy
            downward trend since &mdash; right alongside Pepsi&apos;s cultural
            decline. So was the world really better when Pepsi was king?
          </p>

          {/* Correlation as the punchline */}
          <CorrelationSection data={data.data} />

          <p className="text-base leading-relaxed opacity-70 mb-4">
            The Pearson correlation coefficient (<em>r</em>) measures the
            strength and direction of a linear relationship between two
            variables on a scale from &minus;1 to +1. A value of +1 means
            perfect positive correlation (as one rises, so does the other),
            &minus;1 means perfect inverse correlation, and 0 means no linear
            relationship at all. In the social sciences, an <em>r</em> above 0.7
            is generally considered strong, 0.4&ndash;0.7 moderate, and below
            0.4 weak. We compute these over the 2004&ndash;2024 window where all
            variables have non-null observations (n&nbsp;=&nbsp;21 years).
          </p>
          <p className="text-base leading-relaxed opacity-70 mb-4">
            The formula is straightforward:{" "}
            <code className="text-sm bg-base-200 px-1.5 py-0.5 rounded font-mono">
              r = &Sigma;(x<sub>i</sub> &minus; x&#772;)(y<sub>i</sub> &minus;
              y&#772;) / &radic;[&Sigma;(x<sub>i</sub> &minus; x&#772;)&sup2;
              &middot; &Sigma;(y<sub>i</sub> &minus; y&#772;)&sup2;]
            </code>
            . It is scale-invariant, meaning it doesn&apos;t matter that Pepsi
            share is in percentages while the World Quality Index is on an
            arbitrary 0&ndash;100 composite &mdash; only the shape of the
            relationship matters. This addresses the dual-axis concern from
            earlier: no matter how you stretch the axes visually, <em>r</em>{" "}
            stays the same.
          </p>
          <p className="text-sm text-center opacity-50 mb-8">
            Correlation isn&apos;t causation, of course. But it&apos;s a fun
            coincidence that both underdogs faded together &mdash; and the world
            got worse at the same time. As they say on the pod:
            &ldquo;that&apos;s garbage.&rdquo;
          </p>

          {/* Divider */}
          <hr className="border-base-300 my-8" />

          {/* Methodology */}
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1">
              How it works
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">
              Methodology
            </h2>
            <p className="opacity-70 text-sm leading-relaxed">
              {data.methodology}
            </p>
            <p className="opacity-70 text-sm leading-relaxed mt-3">
              The entire pipeline is automated via GitHub Actions and runs on a
              schedule. Raw data is extracted using Python with Pydantic models
              for schema validation, loaded into a local DuckDB warehouse, and
              transformed through dbt SQL models that handle normalization,
              inversion, and composite aggregation. The final dashboard JSON is
              committed to the repository and consumed by this Next.js frontend.
              Every number on this page is reproducible from source &mdash; no
              spreadsheets were harmed in the making of this analysis.
            </p>
            <p className="opacity-70 text-sm leading-relaxed mt-3">
              <strong>Limitations &amp; caveats:</strong> Google Trends data
              only begins in 2004, limiting our brand-comparison window to 21
              years. The World Happiness Report starts in 2005, so the composite
              index relies on five metrics before that date. Equal weighting is
              a simplification &mdash; reasonable people could argue that GDP
              growth should matter more than a self-reported happiness survey,
              or vice versa. Finally, the Pepsi-to-World-Quality correlation,
              while statistically interesting, operates on a small sample size
              (n = 21) and should be interpreted with the same rigor you&apos;d
              apply to any claim made between bites of a gas station hot dog.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-bold mb-2">Data Sources</h3>
                <ul className="list-disc list-inside opacity-70 space-y-1">
                  <li>
                    <a
                      href="https://trends.google.com/trends/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-100"
                    >
                      Google Trends
                    </a>{" "}
                    &mdash; search interest (2004+)
                  </li>
                  <li>
                    <a
                      href="https://www.bls.gov/developers/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-100"
                    >
                      Bureau of Labor Statistics API
                    </a>{" "}
                    &mdash; CPI, unemployment (1990+)
                  </li>
                  <li>
                    <a
                      href="https://fred.stlouisfed.org/series/UMCSENT"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-100"
                    >
                      FRED / U. Michigan
                    </a>{" "}
                    &mdash; consumer confidence (1990+)
                  </li>
                  <li>
                    <a
                      href="https://worldhappiness.report/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-100"
                    >
                      World Happiness Report
                    </a>{" "}
                    &mdash; happiness scores (2005+)
                  </li>
                  <li>
                    <a
                      href="https://cde.ucr.cjis.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-100"
                    >
                      FBI Crime Data Explorer
                    </a>{" "}
                    &mdash; crime rates (1990+)
                  </li>
                  <li>
                    <a
                      href="https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=US"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-100"
                    >
                      World Bank
                    </a>{" "}
                    &mdash; GDP growth (1990+)
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-2">Tech Stack</h3>
                <ul className="list-disc list-inside opacity-70 space-y-1">
                  <li>Python + Pydantic (extraction & validation)</li>
                  <li>DuckDB (local analytical warehouse)</li>
                  <li>dbt (SQL transformations)</li>
                  <li>GitHub Actions (orchestration)</li>
                  <li>Next.js + Recharts (visualization)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <a
                href="https://github.com/Matt-White12/pepsi-world-index"
                className="btn btn-outline btn-sm font-mono"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Pipeline Repo &rarr;
              </a>
            </div>
          </div>

          {/* Footer timestamp */}
          <p className="text-xs text-center opacity-30 mt-8">
            Data last updated:{" "}
            {new Date(data.generated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
