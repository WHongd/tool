import { getTitleText, normalizeTitleItem } from "../utils/dashboardTitleMappers";

function getStyleLabel(style) {
  const map = {
    conflict: "冲突对比",
    curiosity: "好奇悬念",
    benefit: "收益导向",
    trust: "专业可信",
    balanced: "均衡表达",
  };

  return map[style] || "常规表达";
}

function getReadableReason(reason) {
  if (!reason) return "";

  if (reason.includes("AI 返回异常") || reason.includes("本地兜底")) {
    return "这个标题更适合作为当前主题的切入点，表达更直接，也更容易继续往正文展开。";
  }

  return reason;
}

export default function TitleResultPanel({
  candidates = [],
  loading,
  error,
  onPickTitle,
  selectedTitle,
  bestTitleItem,
  onUseBestTitle,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">标题选择</h2>

        {bestTitleItem?.title ? (
          <button
            type="button"
            onClick={onUseBestTitle}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            使用推荐标题
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
          生成中...
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!loading && !error && !candidates.length ? (
        <div className="mt-4 rounded-xl bg-gray-50 px-4 py-6 text-sm text-gray-500">
          暂无结果，请先输入主题并生成标题。
        </div>
      ) : null}

      {!!candidates.length ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {candidates.map((item, index) => {
            const normalized = normalizeTitleItem(item);
            const title = getTitleText(item);
            const isSelected = selectedTitle === title;
            const isBest = bestTitleItem?.title === title;
            const readableReason = getReadableReason(normalized.reason);

            return (
              <button
                key={`${title}-${index}`}
                type="button"
                onClick={() => onPickTitle(item)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-gray-500">
                    {getStyleLabel(normalized.style)}
                  </div>

                  <div className="flex items-center gap-2">
                    {isBest ? (
                      <span className="rounded-full bg-gray-900 px-2 py-1 text-[10px] text-white">
                        推荐
                      </span>
                    ) : null}

                    {isSelected ? (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-700">
                        当前
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 min-h-[72px] text-sm font-medium leading-6 text-gray-900">
                  {title}
                </div>

                {readableReason ? (
                  <div className="mt-3 text-xs leading-5 text-gray-500 line-clamp-3">
                    {readableReason}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {selectedTitle ? (
        <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white p-4">
          <div className="text-xs text-gray-500">当前标题</div>
          <div className="mt-2 text-sm font-medium text-gray-900">
            {selectedTitle}
          </div>
        </div>
      ) : null}
    </section>
  );
}