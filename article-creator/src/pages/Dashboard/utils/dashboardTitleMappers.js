export function getTitleCandidates(result) {
  if (Array.isArray(result?.data?.candidates)) return result.data.candidates;
  if (Array.isArray(result?.candidates)) return result.candidates;
  return [];
}

export function getBestTitleItem(result) {
  const best = result?.data?.bestTitle ?? result?.bestTitle ?? null;

  if (!best) {
    return getTitleCandidates(result)[0] || null;
  }

  if (typeof best === "string") {
    return { title: best };
  }

  return best;
}

export function getTitleText(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item.title || "";
}

export function normalizeTitleItem(item) {
  if (!item) return null;

  if (typeof item === "string") {
    return {
      title: item,
      reason: "",
      style: "",
      platformFit: "",
      suggestion: "",
    };
  }

  return {
    title: item.title || "",
    reason:
      item.reason ||
      item.recommendReason ||
      item.analysis ||
      item.description ||
      "",
    style: item.style || item.styleLabel || "",
    platformFit:
      item.platformFit || item.platform_fit || item.platformAnalysis || "",
    suggestion:
      item.suggestion || item.optimizationSuggestion || item.tip || "",
    score: item.score ?? null,
    raw: item,
  };
}

export function findCandidateByTitle(result, title) {
  const candidates = getTitleCandidates(result);
  return candidates.find((item) => getTitleText(item) === title) || null;
}