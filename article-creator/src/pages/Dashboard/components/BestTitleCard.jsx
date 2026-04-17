export default function BestTitleCard({ articleTitle, result, onUseBestTitle }) {
  const bestTitle =
    result?.data?.bestTitle?.title ||
    result?.data?.bestTitle ||
    "";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">推荐标题</h2>

      <div className="mt-4 space-y-3">
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="text-sm text-gray-500">当前标题</div>
          <div className="mt-1 text-sm font-medium text-gray-900">
            {articleTitle || "尚未设置"}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">最佳标题</div>
          <div className="mt-1 text-base font-semibold text-gray-900">
            {bestTitle || "暂无"}
          </div>
        </div>

        <button
          type="button"
          onClick={onUseBestTitle}
          disabled={!bestTitle}
          className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          使用推荐标题
        </button>
      </div>
    </section>
  );
}