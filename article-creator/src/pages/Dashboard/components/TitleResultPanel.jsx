import { getTitleText, normalizeTitleItem } from "../utils/dashboardTitleMappers";

export default function TitleResultPanel({
  result,
  loading,
  error,
  onPickTitle,
  onViewDetail,
  onOpenModal,
}) {
  const candidates = Array.isArray(result?.data?.candidates)
    ? result.data.candidates
    : Array.isArray(result?.candidates)
      ? result.candidates
      : [];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">标题结果</h2>
          <p className="mt-1 text-sm text-gray-500">
            先把候选标题选择与详情联动跑通。
          </p>
        </div>

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
          暂无结果
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {candidates.map((item, index) => {
          const normalized = normalizeTitleItem(item);
          const title = getTitleText(item);

          return (
            <div
              key={`${title}-${index}`}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="text-sm font-medium text-gray-900">{title}</div>

              {normalized.reason ? (
                <div className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {normalized.reason}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onPickTitle(item)}
                  className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white"
                >
                  设为标题
                </button>

                <button
                  type="button"
                  onClick={() => onViewDetail(item)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700"
                >
                  查看详情
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}