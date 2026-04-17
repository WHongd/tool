export default function DashboardHero({ title, description }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>
    </section>
  );
}
export function getScoreValue(score) {
  if (typeof score === "number") return score;
  if (score && typeof score === "object") {
    if (typeof score.overall === "number") return score.overall;
    if (typeof score.total === "number") return score.total;
  }
  return -1;
}

export function pickTopTitleByStyle(items = []) {
  const normalizedItems = items
    .map((item) => normalizeTitleItem(item))
    .filter((item) => item?.title);

  const grouped = new Map();

  normalizedItems.forEach((item) => {
    const styleKey = item.style || "__default__";
    const current = grouped.get(styleKey);

    if (!current) {
      grouped.set(styleKey, item);
      return;
    }

    if (getScoreValue(item.score) > getScoreValue(current.score)) {
      grouped.set(styleKey, item);
    }
  });

  return Array.from(grouped.values());
}

export function getTopThreeCandidates(result) {
  const rawCandidates = getTitleCandidates(result);

  if (!rawCandidates.length) return [];

  const stylePicked = pickTopTitleByStyle(rawCandidates);

  return stylePicked.slice(0, 3);
}