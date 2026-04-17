export default function TitleBriefForm(props) {
  const {
    topic,
    setTopic,
    platform,
    setPlatform,
    platformOptions,
    loading,
    onGenerate,
  } = props;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">标题生成</h2>
        <p className="mt-1 text-sm text-gray-500">
          输入主题后，基于当前配置生成 3 个候选标题。
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            主题
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：为什么普通人做公众号，先别急着追爆款"
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            发布平台
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
          >
            {platformOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            当前仅支持：今日头条、微头条、微信公众号
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "生成中..." : "生成 3 个标题"}
        </button>
      </div>
    </section>
  );
}