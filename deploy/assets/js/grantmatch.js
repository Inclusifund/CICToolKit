// Grant-match scoring, browser + Node. Mirrors meta/apps/grantmatch-360/match.py line for line;
// test_parity.mjs there fails if the two rankings drift. Data: data/grantmatch.json (export.py).
(function (root) {
  const sizeFit = (lo, hi, p25, p75) =>
    p25 == null ? 0.3 : hi >= p25 && lo <= p75 ? 1.0 : hi >= p25 / 2 && lo <= p75 * 2 ? 0.5 : 0.1;
  const gbp = (n) => "£" + Math.round(n).toLocaleString("en-GB");

  // org: { la: "E06000016", themes: [...], type: "cic"|"charity", lo, hi, flags: [] }
  function match(data, org, activeSince = "2025-01-01") {
    const laIdx = data.las.findIndex(([c]) => c === org.la);
    const laName = laIdx >= 0 ? data.las[laIdx][1] : org.la;
    const nation = org.la[0];
    const ranked = [];
    for (const f of data.funders) {
      if (f.last < activeSince) continue;
      if ((f.flags.grassroots_delivery || 0) < 0.3) continue;
      if (org.type === "cic" && f.cic === 0 && f.n >= 20) continue;
      const theme = org.themes.reduce((s, t) => s + (f.themes[t] || 0), 0);
      const nLocal = f.at[laIdx] || 0;
      const natTotal = Object.values(f.nations).reduce((s, n) => s + n, 0);
      if (natTotal >= 10 && (f.nations[nation] || 0) / natTotal < 0.05) continue; // gives in another nation
      const place = nLocal >= 3 && nLocal / Math.max(f.total, 1) >= 0.01 ? 1.0
        : f.national ? 0.6 : nLocal ? 0.3 : 0.05;
      const size = sizeFit(org.lo, org.hi, f.p25, f.p75);
      const openness = org.type === "cic" ? Math.min(f.cic / 0.15, 1.0) : 1.0;
      const localGeneralist = place === 1.0 && nLocal >= 20 && nLocal / Math.max(f.total, 1) >= 0.10;
      let score = 0.40 * Math.max(Math.min(theme / 0.5, 1.0), localGeneralist ? 0.6 : 0)
        + 0.30 * place + 0.15 * size + 0.15 * openness;
      score *= 1 + 0.2 * (org.flags || []).reduce((s, fl) => s + (f.flags[fl] || 0), 0);
      if (!f.national && !nLocal) score *= 0.3; // area-bound funder that has never given here
      const why = [
        `${Math.round(100 * theme)}% of its grants fit your themes` + (localGeneralist ? " (funds many local groups)" : ""),
        place === 1.0 ? `${nLocal} organisations in ${laName} funded since 2023`
          : f.national ? `gives across the UK (${nLocal} in ${laName})`
          : `mostly gives in ${f.top2.join(", ")}` + (nLocal ? `; only ${nLocal} in ${laName}: check it covers your area` : ""),
        f.p25 != null ? `typical grant ${gbp(f.p25)}–${gbp(f.p75)}` : "grant size unknown",
      ];
      if (org.type === "cic") why.push(`${Math.round(100 * f.cic)}% of recipients are CICs`);
      // examples: user's themes only, local first, then CICs, newest first (export keeps 2 per theme)
      const examples = f.ex.filter((e) => org.themes.includes(e[5]))
        .sort((a, b) => (b[4] === laIdx) - (a[4] === laIdx) || b[6] - a[6] || (b[3] > a[3]) - (b[3] < a[3]))
        .slice(0, 2)
        .map(([title, recipient, amount, date, la]) => ({ title, recipient, amount, date, place: la >= 0 ? data.las[la][1] : null }));
      ranked.push({ id: f.id, name: f.name, last: f.last, score, why, examples });
    }
    // ties broken by id, matching Python's tuple sort on (score, funder_id) descending
    return ranked.sort((a, b) => b.score - a.score || (b.id > a.id) - (b.id < a.id));
  }

  const api = { match, sizeFit };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.GrantMatch = api;
})(typeof window !== "undefined" ? window : globalThis);
