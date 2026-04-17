export default function ContentWorkspace({
  articleTitle,
  articleContent,
  setArticleContent,
  onGenerateOpening,
  contentLoading,
}) {
  const hasTitle = Boolean(articleTitle);
  const hasContent = Boolean(articleContent.trim());

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-gray-900">正文</div>
            {hasTitle ? (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-700">
                {hasContent ? "编辑中" : "待写作"}
              </span>
            ) : null}
          </div>

          <div className="mt-1 truncate text-[11px] text-gray-500">
            {hasTitle ? articleTitle : "请先选择标题"}
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerateOpening}
          disabled={!hasTitle || contentLoading}
          className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 disabled:opacity-50"
        >
          {contentLoading ? "生成中..." : hasContent ? "重生成开头" : "生成开头"}
        </button>
      </div>

      <div className="mt-3">
        <textarea
          value={articleContent}
          onChange={(e) => setArticleContent(e.target.value)}
          disabled={!hasTitle}
          placeholder={hasTitle ? "开始写正文..." : "选择标题后开始写正文"}
          rows={12}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none focus:border-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>
    </section>
  );
}