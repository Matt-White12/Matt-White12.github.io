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
} from "recharts";

interface DashboardRow {
  year: number;
  pepsi_index: number | null;
  coke_index: number | null;
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
}

interface DashboardData {
  generated_at: string;
  methodology: string;
  data: DashboardRow[];
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
  const den = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );
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
      <p
        className="text-4xl font-black tabular-nums"
        style={{ color }}
      >
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
    (d) => d.pepsi_share != null && d.world_quality_index != null
  );
  const bkValid = data.filter(
    (d) => d.bk_share != null && d.world_quality_index != null
  );
  const underdogValid = data.filter(
    (d) => d.pepsi_share != null && d.bk_share != null
  );

  const rPepsiWorld = pearson(
    pepsiValid.map((d) => d.pepsi_share!),
    pepsiValid.map((d) => d.world_quality_index!)
  );
  const rBkWorld = pearson(
    bkValid.map((d) => d.bk_share!),
    bkValid.map((d) => d.world_quality_index!)
  );
  const rUnderdogs = pearson(
    underdogValid.map((d) => d.pepsi_share!),
    underdogValid.map((d) => d.bk_share!)
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
          label="Pepsi Share vs World Quality"
          color={QUALITY_GREEN}
        />
        <CorrelationBadge
          r={rBkWorld}
          label="BK Share vs World Quality"
          color={BK_ORANGE}
        />
        <CorrelationBadge
          r={rUnderdogs}
          label="Pepsi Share vs BK Share"
          color={PEPSI_BLUE}
        />
      </div>
    </div>
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
            that &ldquo;the world was a better place when Pepsi was better
            received.&rdquo;
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              "Python",
              "dbt",
              "DuckDB",
              "Pydantic",
              "Recharts",
              "Next.js",
            ].map((tag) => (
              <span
                key={tag}
                className="badge badge-outline badge-sm font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Single continuous content box */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="border-3 border-base-content bg-base-100 p-6 md:p-10">
          {/* Intro */}
          <p className="text-base leading-relaxed opacity-70">
            It started, as most great intellectual pursues do, while watching my
            favorite podcast{" "}
            <a
              href="https://www.youtube.com/c/AreYouGarbage"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-100"
            >
              Are You Garbage
            </a>
            . Two modern philosophers &mdash; Kippy and Foley &mdash; were
            waxing poetic about the cultural decline of Pepsi and Burger King
            when one of them dropped a thesis so profound it stopped me mid-bite
            into my gas station hot dog: &ldquo;The world was a better place
            when Pepsi was better received.&rdquo;
          </p>
          <p className="text-base leading-relaxed opacity-70 mt-4">
            I did what any reasonable person would do. I built an entire data
            pipeline to find out if two guys arguing about trash culture on a
            comedy podcast had accidentally stumbled onto an empirical truth.
            Spoiler: the results are... uncomfortable.
          </p>

          {/* YouTube embed */}
          <div className="my-8 flex flex-col items-center">
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-3 self-start">
              The inspiration
            </p>
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

          {/* World Quality Index chart first */}
          <p className="text-base leading-relaxed opacity-70 mb-6">
            First, let&apos;s look at our composite World Quality Index
            &mdash; a single number that combines six economic and social
            metrics into a 0&ndash;100 score. The higher the number, the
            &ldquo;better&rdquo; the world. It peaked in the late 1990s and
            has been on a bumpy decline since.
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
              <ComposedChart data={data.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
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
                <Tooltip />
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
          </div>

          {/* Cola wars narrative + chart */}
          <p className="text-base leading-relaxed opacity-70 mb-6">
            Now let&apos;s look at the cola war. Google Trends data starts
            in January 2004, which is as far back as Google&apos;s search index
            goes. In 2004, Pepsi dominated search interest. By 2008, Coke had
            overtaken it. The gap has only widened since.
          </p>

          <div className="mb-8">
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1">
              The cola wars
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              Search Interest: Pepsi vs Coca-Cola
            </h2>
            <p className="text-sm opacity-50 mb-4">
              Relative search interest on a 0&ndash;100 scale, where 100
              represents the peak popularity for either term. Google Trends only
              provides data from 2004 onward &mdash; search tracking simply
              didn&apos;t exist in the 1990s.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pepsi_index"
                  stroke={PEPSI_BLUE}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Pepsi"
                />
                <Line
                  type="monotone"
                  dataKey="coke_index"
                  stroke={COKE_RED}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Coca-Cola"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2">
              <SourceLink
                href="https://trends.google.com/trends/explore?date=all&geo=US&q=Pepsi,Coca-Cola"
                label="Source: Google Trends"
              />
            </div>
          </div>

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
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="burger_king_index"
                  stroke={BK_ORANGE}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Burger King"
                />
                <Line
                  type="monotone"
                  dataKey="mcdonalds_index"
                  stroke={MCD_GOLD}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="McDonald's"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2">
              <SourceLink
                href="https://trends.google.com/trends/explore?date=all&geo=US&q=Burger%20King,McDonald%27s"
                label="Source: Google Trends"
              />
            </div>
          </div>

          {/* Underdogs chart: Pepsi share vs BK share */}
          <p className="text-base leading-relaxed opacity-70 mb-6">
            Here&apos;s where it gets interesting. If we plot Pepsi&apos;s share
            of the cola market against Burger King&apos;s share of the burger
            market (both measured by search interest), they track almost
            perfectly. The underdogs are fading together.
          </p>

          <div className="mb-8">
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1">
              The underdogs
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              Pepsi Share vs Burger King Share
            </h2>
            <p className="text-sm opacity-50 mb-4">
              Both lines show each brand&apos;s share of search interest against
              their dominant rival. Pepsi&apos;s share = Pepsi / (Pepsi + Coke).
              BK&apos;s share = Burger King / (BK + McDonald&apos;s).
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pepsi_share"
                  stroke={PEPSI_BLUE}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Pepsi Share"
                />
                <Line
                  type="monotone"
                  dataKey="bk_share"
                  stroke={BK_ORANGE}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="BK Share"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2">
              <SourceLink
                href="https://trends.google.com/trends/explore?date=all&geo=US&q=Pepsi,Coca-Cola,Burger%20King,McDonald%27s"
                label="Source: Google Trends"
              />
            </div>
          </div>

          {/* Combined chart */}
          <p className="text-base leading-relaxed opacity-70 mb-6">
            Now let&apos;s overlay Pepsi&apos;s share against the World Quality
            Index. As Pepsi&apos;s cultural relevance faded from 55% to under
            20%, the composite index dropped alongside it.
          </p>

          <div className="mb-8">
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1">
              The overlay
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              Pepsi Share vs World Quality Index
            </h2>
            <p className="text-sm opacity-50 mb-4">
              The blue line shows Pepsi&apos;s share of combined Pepsi + Coke
              search interest. The green area shows the composite World Quality
              Index. Google Trends data only goes back to 2004, so Pepsi share
              is unavailable before then.
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={data.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  label={{
                    value: "Pepsi Share (%)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: PEPSI_BLUE },
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
                <Tooltip />
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
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="pepsi_share"
                  stroke={PEPSI_BLUE}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  name="Pepsi Share (%)"
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-2">
              <SourceLink
                href="https://trends.google.com/trends/explore?date=all&geo=US&q=Pepsi,Coca-Cola"
                label="Source: Google Trends"
              />
            </div>
          </div>

          {/* Breakout metrics narrative */}
          <p className="text-base leading-relaxed opacity-70 mb-6">
            So Pepsi&apos;s search dominance faded and the world got
            measurably worse by this composite. But which metrics are
            driving it? Let&apos;s break down the six ingredients.
            Each one is normalized to 0&ndash;100 and weighted equally.
            &ldquo;Bad&rdquo; metrics like inflation, unemployment, and crime
            are inverted so that higher always means better.
          </p>

          {/* Breakout metrics grid */}
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

          <p className="text-sm text-center opacity-50 mb-8">
            Correlation isn&apos;t causation, of course. But it&apos;s a fun
            coincidence that both underdogs faded together &mdash; and the world
            got worse at the same time.
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
