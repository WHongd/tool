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
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={loading}
        className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "生成中..." : "生成标题"}
      </button>
    </div>
  );
}