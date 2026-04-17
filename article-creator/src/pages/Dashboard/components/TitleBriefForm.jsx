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

  const hasTopic = Boolean(topic.trim());

  const handleClearTopic = () => {
    setTopic("");
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="space-y-4">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="输入这篇内容想写的主题"
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-4 text-sm leading-6 outline-none focus:border-gray-900"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {platformOptions.map((item) => {
              const active = platform === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPlatform(item.value)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {hasTopic ? (
              <button
                type="button"
                onClick={handleClearTopic}
                className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700"
              >
                清空主题
              </button>
            ) : null}

            <button
              type="button"
              onClick={onGenerate}
              disabled={loading || !hasTopic}
              className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60 sm:min-w-[120px]"
            >
              {loading ? "生成中..." : "生成标题"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}