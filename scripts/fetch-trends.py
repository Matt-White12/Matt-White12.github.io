#!/usr/bin/env python3
"""
Fetch real Google Trends data for the Pepsi World Index project.
Pulls monthly data for 2004-present for:
  1. Pepsi vs Coca-Cola vs Coke (3-term cola query)
  2. Pepsi vs Coca-Cola (2-term cola query, for pepsi_share)
  3. Burger King vs McDonald's (burger query)

Outputs updated dashboard_data.json with real trend values.
"""

import json
import time
import os
from pathlib import Path

from pytrends.request import TrendReq

DATA_PATH = Path(__file__).parent.parent / "public" / "data" / "dashboard_data.json"

pytrends = TrendReq(hl="en-US", tz=360)


def fetch_trends(keywords, timeframe="all", geo="US"):
    """Fetch Google Trends data with retry logic."""
    for attempt in range(3):
        try:
            pytrends.build_payload(keywords, timeframe=timeframe, geo=geo)
            df = pytrends.interest_over_time()
            if df.empty:
                print(f"  Warning: empty result for {keywords}")
                return None
            # Drop the 'isPartial' column if present
            if "isPartial" in df.columns:
                df = df.drop(columns=["isPartial"])
            return df
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(10 * (attempt + 1))
    return None


def main():
    # 1. Fetch 3-term cola query: Pepsi, Coca-Cola, Coke
    print("Fetching: Pepsi, Coca-Cola, Coke...")
    cola_3q = fetch_trends(["Pepsi", "Coca-Cola", "Coke"])
    if cola_3q is not None:
        print(f"  Got {len(cola_3q)} monthly rows")
        print(f"  Date range: {cola_3q.index[0]} to {cola_3q.index[-1]}")
        print(f"  Sample (first 3):\n{cola_3q.head(3)}")
    else:
        print("  FAILED to fetch 3-term cola data")
        return

    time.sleep(5)

    # 2. Fetch 2-term cola query: Pepsi, Coke (for share calculation)
    print("\nFetching: Pepsi, Coke (2-term)...")
    cola_2q = fetch_trends(["Pepsi", "Coke"])
    if cola_2q is not None:
        print(f"  Got {len(cola_2q)} monthly rows")
    else:
        print("  FAILED to fetch 2-term cola data")
        return

    time.sleep(5)

    # 3. Fetch burger query: Burger King, McDonalds (no apostrophe — pytrends
    #    mishandles the curly quote in "McDonald's" and returns zeros)
    print("\nFetching: Burger King, McDonalds...")
    burger = fetch_trends(["Burger King", "McDonalds"])
    if burger is not None:
        print(f"  Got {len(burger)} monthly rows")
    else:
        print("  FAILED to fetch burger data")
        return

    time.sleep(5)

    # 4. Fetch underdogs query: Pepsi, Burger King (normalized together)
    print("\nFetching: Pepsi, Burger King (underdogs)...")
    underdogs = fetch_trends(["Pepsi", "Burger King"])
    if underdogs is not None:
        print(f"  Got {len(underdogs)} monthly rows")
    else:
        print("  FAILED to fetch underdogs data")
        return

    # Load existing dashboard data
    with open(DATA_PATH) as f:
        dashboard = json.load(f)

    # Build monthly_wqi from annual data (1990-2024), interpolated to monthly
    wqi_by_year = {row["year"]: row["world_quality_index"] for row in dashboard["data"]
                   if row["world_quality_index"] is not None}
    monthly_wqi = []
    for year in sorted(wqi_by_year.keys()):
        for month in range(1, 13):
            t = (month - 1) / 12
            wqi_curr = wqi_by_year.get(year)
            wqi_prev = wqi_by_year.get(year - 1)
            wqi_next = wqi_by_year.get(year + 1)
            if t < 0.5 and wqi_prev is not None:
                frac = t + 0.5
                wqi = round(wqi_prev + (wqi_curr - wqi_prev) * frac, 1)
            elif t >= 0.5 and wqi_next is not None:
                frac = t - 0.5
                wqi = round(wqi_curr + (wqi_next - wqi_curr) * frac, 1)
            else:
                wqi = wqi_curr
            monthly_wqi.append({
                "date": f"{year}-{month:02d}",
                "world_quality_index": wqi,
            })
    dashboard["monthly_wqi"] = monthly_wqi
    print(f"Monthly WQI: {len(monthly_wqi)} rows ({monthly_wqi[0]['date']} to {monthly_wqi[-1]['date']})")

    # Build monthly_trends from 3-term cola data
    monthly_trends = []
    for date, row in cola_3q.iterrows():
        monthly_trends.append({
            "date": date.strftime("%Y-%m"),
            "pepsi_3q": int(row["Pepsi"]),
            "cocacola_3q": int(row["Coca-Cola"]),
            "coke_3q": int(row["Coke"]),
        })

    dashboard["monthly_trends"] = monthly_trends
    print(f"\nMonthly cola trends: {len(monthly_trends)} rows")

    # Build monthly_burger_trends from burger data
    monthly_burger = []
    for date, row in burger.iterrows():
        monthly_burger.append({
            "date": date.strftime("%Y-%m"),
            "burger_king": int(row["Burger King"]),
            "mcdonalds": int(row["McDonalds"]),
        })

    dashboard["monthly_burger_trends"] = monthly_burger
    print(f"Monthly burger trends: {len(monthly_burger)} rows")

    # Build monthly_share_trends from 2-term cola + burger data
    # Align by date — both should have same date range
    cola_2q_by_date = {}
    for date, row in cola_2q.iterrows():
        d = date.strftime("%Y-%m")
        cola_2q_by_date[d] = {"pepsi": int(row["Pepsi"]), "coke": int(row["Coke"])}

    burger_by_date = {}
    for date, row in burger.iterrows():
        d = date.strftime("%Y-%m")
        burger_by_date[d] = {"bk": int(row["Burger King"]), "mcd": int(row["McDonalds"])}

    monthly_shares = []
    all_dates = sorted(set(cola_2q_by_date.keys()) & set(burger_by_date.keys()))
    for d in all_dates:
        c = cola_2q_by_date[d]
        b = burger_by_date[d]
        pepsi_total = c["pepsi"] + c["coke"]
        bk_total = b["bk"] + b["mcd"]
        monthly_shares.append({
            "date": d,
            "pepsi_share": round(c["pepsi"] / pepsi_total * 100, 1) if pepsi_total > 0 else 0,
            "bk_share": round(b["bk"] / bk_total * 100, 1) if bk_total > 0 else 0,
        })

    dashboard["monthly_share_trends"] = monthly_shares
    print(f"Monthly share trends: {len(monthly_shares)} rows")

    # Build monthly_underdog_trends from Pepsi vs Burger King (normalized together)
    monthly_underdogs = []
    for date, row in underdogs.iterrows():
        monthly_underdogs.append({
            "date": date.strftime("%Y-%m"),
            "pepsi": int(row["Pepsi"]),
            "burger_king": int(row["Burger King"]),
        })

    # Add world_quality_index to underdog monthly rows (interpolated from annual)
    # Annual WQI anchors at mid-year (July). Linearly interpolate between years.
    wqi_by_year = {row["year"]: row["world_quality_index"] for row in dashboard["data"]}
    for row in monthly_underdogs:
        year = int(row["date"][:4])
        month = int(row["date"][5:7])
        # t=0.0 at Jan, t=0.5 at July (where annual value anchors), t=~1.0 at Dec
        t = (month - 1) / 12
        wqi_curr = wqi_by_year.get(year)
        wqi_prev = wqi_by_year.get(year - 1)
        wqi_next = wqi_by_year.get(year + 1)
        if wqi_curr is None:
            row["world_quality_index"] = None
        elif t < 0.5 and wqi_prev is not None:
            # Interpolate from prev midpoint to curr midpoint
            frac = t + 0.5  # 0.5 to 1.0
            row["world_quality_index"] = round(wqi_prev + (wqi_curr - wqi_prev) * frac, 1)
        elif t >= 0.5 and wqi_next is not None:
            # Interpolate from curr midpoint to next midpoint
            frac = t - 0.5  # 0.0 to 0.5
            row["world_quality_index"] = round(wqi_curr + (wqi_next - wqi_curr) * frac, 1)
        else:
            row["world_quality_index"] = wqi_curr

    dashboard["monthly_underdog_trends"] = monthly_underdogs
    print(f"Monthly underdog trends: {len(monthly_underdogs)} rows")

    # Compute annual averages and update the annual data rows
    # Group monthly data by year
    from collections import defaultdict

    # 3-term annual averages
    cola_3q_annual = defaultdict(lambda: {"pepsi": [], "cocacola": [], "coke": []})
    for date, row in cola_3q.iterrows():
        year = date.year
        cola_3q_annual[year]["pepsi"].append(int(row["Pepsi"]))
        cola_3q_annual[year]["cocacola"].append(int(row["Coca-Cola"]))
        cola_3q_annual[year]["coke"].append(int(row["Coke"]))

    # 2-term annual averages (Pepsi vs Coke)
    cola_2q_annual = defaultdict(lambda: {"pepsi": [], "coke": []})
    for date, row in cola_2q.iterrows():
        year = date.year
        cola_2q_annual[year]["pepsi"].append(int(row["Pepsi"]))
        cola_2q_annual[year]["coke"].append(int(row["Coke"]))

    # Burger annual averages
    burger_annual = defaultdict(lambda: {"bk": [], "mcd": []})
    for date, row in burger.iterrows():
        year = date.year
        burger_annual[year]["bk"].append(int(row["Burger King"]))
        burger_annual[year]["mcd"].append(int(row["McDonalds"]))

    # Underdog annual averages (Pepsi vs Burger King, normalized together)
    underdog_annual = defaultdict(lambda: {"pepsi": [], "bk": []})
    for date, row in underdogs.iterrows():
        year = date.year
        underdog_annual[year]["pepsi"].append(int(row["Pepsi"]))
        underdog_annual[year]["bk"].append(int(row["Burger King"]))

    # Update annual rows
    for row in dashboard["data"]:
        year = row["year"]

        if year in cola_3q_annual:
            vals = cola_3q_annual[year]
            row["pepsi_3q"] = round(sum(vals["pepsi"]) / len(vals["pepsi"]), 1)
            row["cocacola_3q"] = round(sum(vals["cocacola"]) / len(vals["cocacola"]), 1)
            row["coke_3q"] = round(sum(vals["coke"]) / len(vals["coke"]), 1)

        if year in cola_2q_annual:
            vals = cola_2q_annual[year]
            avg_pepsi = sum(vals["pepsi"]) / len(vals["pepsi"])
            avg_coke = sum(vals["coke"]) / len(vals["coke"])
            row["pepsi_index"] = round(avg_pepsi, 1)
            row["coke_index"] = round(avg_coke, 1)
            total = avg_pepsi + avg_coke
            row["pepsi_share"] = round(avg_pepsi / total * 100, 2) if total > 0 else 0

        if year in burger_annual:
            vals = burger_annual[year]
            avg_bk = sum(vals["bk"]) / len(vals["bk"])
            avg_mcd = sum(vals["mcd"]) / len(vals["mcd"])
            row["burger_king_index"] = round(avg_bk, 1)
            row["mcdonalds_index"] = round(avg_mcd, 1)
            total = avg_bk + avg_mcd
            row["bk_share"] = round(avg_bk / total * 100, 2) if total > 0 else 0

        if year in underdog_annual:
            vals = underdog_annual[year]
            row["pepsi_raw"] = round(sum(vals["pepsi"]) / len(vals["pepsi"]), 1)
            row["bk_raw"] = round(sum(vals["bk"]) / len(vals["bk"]), 1)

    # Write back
    with open(DATA_PATH, "w") as f:
        json.dump(dashboard, f, indent=2)
        f.write("\n")

    print("Dashboard data updated successfully!")

    # Print a summary of annual values for verification
    print("\nAnnual summary (2004-2024):")
    print(f"{'Year':>6} {'Pepsi3q':>8} {'CocaCola3q':>11} {'Coke3q':>8} {'PepsiIdx':>9} {'CokeIdx':>9} {'PepsiShr':>9} {'BK':>5} {'McD':>5} {'BKShr':>7}")
    for row in dashboard["data"]:
        if row["year"] >= 2004:
            print(f"{row['year']:>6} {row.get('pepsi_3q', '-'):>8} {row.get('cocacola_3q', '-'):>11} {row.get('coke_3q', '-'):>8} {row.get('pepsi_index', '-'):>9} {row.get('coke_index', '-'):>9} {row.get('pepsi_share', '-'):>9} {row.get('burger_king_index', '-'):>5} {row.get('mcdonalds_index', '-'):>5} {row.get('bk_share', '-'):>7}")


if __name__ == "__main__":
    main()
