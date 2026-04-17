export default function TitleBriefForm(props) {
  const {
    topic,
    setTopic,
    platform,
    setPlatform,
    audience,
    setAudience,
    preferredStyle,
    setPreferredStyle,
    target,
    setTarget,
    candidateCountPerStyle,
    setCandidateCountPerStyle,
    styleOptions,
    targetOptions,
    platformOptions,
    loading,
    onGenerate,
  } = props;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">标题输入参数</h2>
        <p className="mt-1 text-sm text-gray-500">
          先完成主题、平台、人群和风格配置。
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
            平台
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

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            目标人群
          </label>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            风格
          </label>
          <div className="grid gap-2">
            {styleOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setPreferredStyle(item.value)}
                className={`rounded-xl border px-4 py-3 text-left ${
                  preferredStyle === item.value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                <div className="font-medium">{item.label}</div>
                <div className="mt-1 text-xs opacity-80">{item.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            目标
          </label>
          <div className="grid grid-cols-1 gap-2">
            {targetOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTarget(item.value)}
                className={`rounded-xl border px-4 py-3 text-left ${
                  target === item.value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                <div className="font-medium">{item.label}</div>
                <div className="mt-1 text-xs opacity-80">{item.style}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            每风格候选数
          </label>
          <input
            type="number"
            min={1}
            max={5}
            value={candidateCountPerStyle}
            onChange={(e) => setCandidateCountPerStyle(Number(e.target.value) || 1)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "生成中..." : "生成标题方案"}
        </button>
      </div>
    </section>
  );
}