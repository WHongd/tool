export default function TitleDetailPanel({ loading, detail, selectedTitle }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">标题详情</h2>

      {loading ? (
        <div className="mt-4 text-sm text-gray-500">加载中...</div>
      ) : !detail ? (
        <div className="mt-4 text-sm text-gray-500">
          {selectedTitle ? "暂无详细分析" : "请选择一个标题查看详情"}
        </div>
      ) : (
        <div className="mt-4 space-y-3 text-sm text-gray-700">
          <div>
            <div className="text-xs text-gray-500">标题</div>
            <div className="mt-1 font-medium text-gray-900">
              {detail.title || selectedTitle}
            </div>
          </div>

          {detail.reason ? (
            <div>
              <div className="text-xs text-gray-500">推荐理由</div>
              <div className="mt-1">{detail.reason}</div>
            </div>
          ) : null}

          {detail.style ? (
            <div>
              <div className="text-xs text-gray-500">风格</div>
              <div className="mt-1">{detail.style}</div>
            </div>
          ) : null}

          {detail.platformFit ? (
            <div>
              <div className="text-xs text-gray-500">平台适配</div>
              <div className="mt-1">{detail.platformFit}</div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}