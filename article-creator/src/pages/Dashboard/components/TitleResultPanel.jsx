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

function getReadablePlatformFit(platformFit) {
  if (!platformFit) return "";

  if (typeof platformFit === "string") {
    return platformFit;
  }

  return "";
}

export default function TitleResultPanel({
  candidates = [],
  loading,
  error,
  onPickTitle,
  onViewDetail,
  onOpenModal,
  selectedTitle,
  bestTitleItem,
  onUseBestTitle,
  detail,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">标题选择</h2>

        <button
          type="button"
          onClick={onOpenModal}
          disabled={!candidates.length}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50"
        >
          弹窗查看
        </button>
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
              <div
                key={`${title}-${index}`}
                className={`rounded-2xl border p-4 transition ${
                  isSelected
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-gray-500">
                    {getStyleLabel(normalized.style)}
                  </div>

                  {isBest ? (
                    <span className="rounded-full bg-gray-900 px-2 py-1 text-[10px] text-white">
                      推荐
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 min-h-[72px] text-sm font-medium leading-6 text-gray-900">
                  {title}
                </div>

                {readableReason ? (
                  <div className="mt-3 text-xs leading-5 text-gray-500 line-clamp-3">
                    {readableReason}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onPickTitle(item)}
                    className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white"
                  >
                    {isSelected ? "当前标题" : "设为标题"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewDetail(item)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700"
                  >
                    查看说明
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {bestTitleItem?.title ? (
        <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-gray-500">推荐标题</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">
                {bestTitleItem.title}
              </div>
            </div>

            <button
              type="button"
              onClick={onUseBestTitle}
              className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white"
            >
              使用推荐标题
            </button>
          </div>
        </div>
      ) : null}

      {detail?.title ? (
        <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white p-4">
          <div className="text-xs text-gray-500">标题说明</div>

          <div className="mt-2 text-sm font-medium text-gray-900">
            {detail.title}
          </div>

          {getReadableReason(detail.reason) ? (
            <div className="mt-3 text-sm leading-6 text-gray-600">
              {getReadableReason(detail.reason)}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
            {detail.style ? (
              <span className="rounded-full bg-gray-100 px-2 py-1">
                风格：{getStyleLabel(detail.style)}
              </span>
            ) : null}

            {getReadablePlatformFit(detail.platformFit) ? (
              <span className="rounded-full bg-gray-100 px-2 py-1">
                平台适配：{getReadablePlatformFit(detail.platformFit)}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}