export default function ContentWorkspace({
  articleTitle,
  articleContent,
  setArticleContent,
  onGenerateOpening,
  contentLoading,
}) {
  const hasTitle = Boolean(articleTitle);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-gray-500">正文</div>
          <div className="mt-1 break-words text-sm font-medium text-gray-900">
            {hasTitle ? articleTitle : "请先选择标题"}
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerateOpening}
          disabled={!hasTitle || contentLoading}
          className="shrink-0 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {contentLoading ? "生成中..." : "生成开头"}
        </button>
      </div>

      <textarea
        value={articleContent}
        onChange={(e) => setArticleContent(e.target.value)}
        disabled={!hasTitle}
        placeholder={hasTitle ? "开始写正文..." : "请先选择一个标题"}
        rows={14}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none focus:border-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
      />
    </section>
  );
}