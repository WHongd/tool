export default function ContentWorkspace({
  articleTitle,
  articleContent,
  setArticleContent,
  onGenerateOpening,
  contentLoading,
}) {
  const hasTitle = Boolean(articleTitle);
  const hasContent = Boolean(articleContent.trim());

  const handleClearContent = () => {
    setArticleContent("");
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-gray-900">正文</div>
            {hasTitle ? (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-700">
                {hasContent ? "编辑中" : "待写作"}
              </span>
            ) : null}
          </div>

          <div className="mt-2 rounded-xl bg-gray-50 px-3 py-2">
            <div className="text-[10px] text-gray-500">当前标题</div>
            <div className="mt-1 break-words text-xs leading-5 text-gray-800">
              {hasTitle ? articleTitle : "请先选择标题"}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {hasContent ? (
            <button
              type="button"
              onClick={handleClearContent}
              className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700"
            >
              清空正文
            </button>
          ) : null}

          <button
            type="button"
            onClick={onGenerateOpening}
            disabled={!hasTitle || contentLoading}
            className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 disabled:opacity-50"
          >
            {contentLoading ? "生成中..." : hasContent ? "重生成开头" : "生成开头"}
          </button>
        </div>
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