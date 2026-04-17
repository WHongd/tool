import React, { useEffect, useMemo, useState } from "react";
import aiService from "../../services/aiService";

const PLATFORM_OPTIONS = [
  {
    label: "今日头条",
    value: "toutiao",
    description: "基于热点事件/热点观点，输出有态度、有信息量的评论型文章。",
  },
  {
    label: "微头条",
    value: "weitoutiao",
    description: "围绕一个话题快速展开，短、直接、有观点、抓眼球。",
  },
  {
    label: "微信公众号",
    value: "wechat",
    description: "围绕热点做完整长文表达，强调逻辑、观点、情绪和可读性。",
  },
  {
    label: "百家号",
    value: "baijiahao",
    description: "暂时未明确创作方向，先保留基础创作入口。",
  },
];

function SectionCard({ title, description, children }) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: 20,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#111827",
            marginBottom: 6,
          }}
        >
          {title}
        </div>
        {description ? (
          <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7 }}>
            {description}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children, required = false }) {
  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#111827",
        marginBottom: 8,
      }}
    >
      {children}
      {required ? <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span> : null}
    </div>
  );
}

function Input({ value, onChange, placeholder, maxLength }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{
        width: "100%",
        border: "1px solid #d1d5db",
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 14,
        boxSizing: "border-box",
      }}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 6, maxLength }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      style={{
        width: "100%",
        border: "1px solid #d1d5db",
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 14,
        lineHeight: 1.75,
        boxSizing: "border-box",
        resize: "vertical",
      }}
    />
  );
}

function Select({ value, onChange, options, disabled = false }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        width: "100%",
        border: "1px solid #d1d5db",
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 14,
        background: disabled ? "#f3f4f6" : "#fff",
      }}
    >
      {options.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

function ActionButton({ children, onClick, disabled = false, primary = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: primary ? "none" : "1px solid #d1d5db",
        background: disabled ? "#9ca3af" : primary ? "#111827" : "#ffffff",
        color: primary ? "#ffffff" : "#111827",
        borderRadius: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "12px 16px",
        fontSize: 14,
        fontWeight: 800,
      }}
    >
      {children}
    </button>
  );
}

function CopyButton({ text }) {
  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      window.alert("已复制");
    } catch {
      window.alert("复制失败，请手动复制");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        border: "1px solid #d1d5db",
        background: "#fff",
        color: "#111827",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      复制
    </button>
  );
}

function safeParse(raw, fallback = null) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function platformLabel(platform) {
  return (
    PLATFORM_OPTIONS.find((item) => item.value === platform)?.label || "未知平台"
  );
}

function mapPlatformValue(rawPlatform) {
  if (!rawPlatform) return "";

  const value = String(rawPlatform).toLowerCase();

  if (
    value.includes("头条") &&
    !value.includes("微头条") &&
    !value.includes("weitoutiao")
  ) {
    return "toutiao";
  }

  if (value.includes("微头条") || value.includes("weitoutiao")) {
    return "weitoutiao";
  }

  if (value.includes("百家")) {
    return "baijiahao";
  }

  if (value.includes("微信") || value.includes("公众号") || value.includes("wechat")) {
    return "wechat";
  }

  if (["toutiao", "weitoutiao", "baijiahao", "wechat"].includes(value)) {
    return value;
  }

  return "";
}

function normalizePersonaPlatform(personaObj) {
  if (!personaObj) return "all";

  if (personaObj.platform) {
    const mapped = mapPlatformValue(personaObj.platform);
    if (mapped) return mapped;
  }

  const text = [
    personaObj.name || "",
    personaObj.role || "",
    personaObj.prompt || "",
    personaObj.tags || "",
  ]
    .join(" ")
    .toLowerCase();

  if (text.includes("微头条") || text.includes("weitoutiao")) return "weitoutiao";
  if (text.includes("今日头条") || text.includes("头条")) return "toutiao";
  if (text.includes("百家号") || text.includes("百家")) return "baijiahao";
  if (text.includes("微信公众号") || text.includes("公众号") || text.includes("wechat")) {
    return "wechat";
  }

  return "all";
}

function extractPersonaMeta(personaObj) {
  if (!personaObj) {
    return {
      name: "",
      role: "",
      tone: "",
      audience: "",
      intro: "",
      prompt: "",
    };
  }

  return {
    name: personaObj.name || "",
    role: personaObj.role || "",
    tone: personaObj.tone || "",
    audience: personaObj.audience || "",
    intro: personaObj.intro || "",
    prompt: personaObj.prompt || "",
  };
}

function buildPersonaPrompt(personaObj) {
  const meta = extractPersonaMeta(personaObj);

  return [
    meta.name ? `人设名称：${meta.name}` : "",
    meta.role ? `角色定位：${meta.role}` : "",
    meta.intro ? `角色简介：${meta.intro}` : "",
    meta.tone ? `语气风格：${meta.tone}` : "",
    meta.audience ? `目标读者：${meta.audience}` : "",
    meta.prompt ? `补充设定：${meta.prompt}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildPlatformInstruction(platform) {
  switch (platform) {
    case "toutiao":
      return [
        "创作平台：今日头条。",
        "写作目标：围绕热点事件、热点人物、热点争议或热点现象，输出有观点、有信息量的评论型文章。",
        "文章必须像真实作者写出来的，不要机械、不要模板腔、不要AI式总结口吻。",
        "避免空洞鸡汤、避免宏大叙事、避免正确但无用的话。",
        "要有明确立场，但不要违反平台规则，不煽动、不极端、不造谣、不编造信息。",
        "开头3段必须尽快进入冲突点、争议点或反常识观点，提升阅读完成率。",
        "语言允许接地气，但不能低俗。",
      ].join("\n");
    case "wechat":
      return [
        "创作平台：微信公众号。",
        "写作目标：围绕当下热点，写出完整、真实、有层次的评论长文。",
        "文章要有真实作者感，不要像AI输出，不要满篇套话，不要假大空。",
        "结构要完整：引子—事件/现象—分析—观点—结尾。",
        "可以适度展开细节和观点，但不要空喊口号。",
        "在符合平台规则前提下，标题要有点击欲，正文要有阅读沉浸感。",
      ].join("\n");
    case "weitoutiao":
      return [
        "创作平台：微头条。",
        "写作目标：围绕一个话题快速展开表达，短、直接、带观点。",
        "不要求完整长文结构，但要开头抓人，最好前两句就把观点抛出来。",
        "语气可以更口语化，更像真人在表达态度。",
        "避免无效铺垫，避免太书面化，避免AI常见的总结模板。",
        "必须符合平台规则，不夸大、不引战、不造假。",
      ].join("\n");
    case "baijiahao":
      return [
        "创作平台：百家号。",
        "当前方向未完全明确，请先按通用信息型内容写法输出。",
        "文章保持清晰、真实、可读，避免假大空和空泛表达。",
        "语气相对稳一点，结构清楚即可。",
      ].join("\n");
    default:
      return "";
  }
}

function buildContentTypeInstruction(platform, contentType) {
  if (platform === "weitoutiao") {
    return "本次优先按短内容逻辑写，篇幅更短，观点更集中。";
  }

  switch (contentType) {
    case "opinion":
      return "本次按观点评论型文章输出，强调态度、判断和分析。";
    case "short":
      return "本次按短内容输出，尽量简洁，压缩铺垫。";
    case "article":
    default:
      return "本次按完整文章输出，保证结构完整和可读性。";
  }
}

function buildAntiAiInstruction() {
  return [
    "必须降低AI痕迹，像一个有经验的真人作者在写，不要用过于整齐的模板结构。",
    "不要频繁使用“首先、其次、最后、总之、综上所述”这类明显AI连接词。",
    "不要输出假大空、正确但无信息量的话。",
    "不要写成提示词说明文，不要解释你在如何写。",
    "允许适度口语化和真实判断，但不要低俗。",
    "多用具体表达，少用虚空抽象词。",
  ].join("\n");
}

function buildGenerationInstruction({
  platform,
  topic,
  hotPoint,
  angle,
  material,
  extraPrompt,
  contentType,
  wordCount,
  personaPrompt,
}) {
  return [
    buildPlatformInstruction(platform),
    buildContentTypeInstruction(platform, contentType),
    buildAntiAiInstruction(),
    `本次平台：${platformLabel(platform)}`,
    topic ? `本次主题：${topic}` : "",
    hotPoint ? `热点事件/热点话题：${hotPoint}` : "",
    angle ? `希望切入角度：${angle}` : "",
    material ? `可参考素材：\n${material}` : "",
    extraPrompt ? `补充要求：\n${extraPrompt}` : "",
    personaPrompt ? `请参考以下人设设定：\n${personaPrompt}` : "",
    `目标字数：${wordCount}字左右`,
    "请直接输出可发布内容，包含：标题 + 正文。",
    "标题要像真实平台作者会写出来的标题，不要写成训练样例。",
    "正文必须自然、具体、可读、符合平台调性。",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildFallbackContent({
  platform,
  topic,
  hotPoint,
  angle,
  material,
  wordCount,
  personaName,
}) {
  const finalTopic = topic || hotPoint || "这个热点话题";
  const finalAngle = angle || "普通人的真实感受与判断";
  const personaText = personaName
    ? `这篇内容会尽量采用“${personaName}”的人设表达方式。`
    : "这篇内容会采用更自然、更接地气的写法。";

  const titleMap = {
    toutiao: `关于“${finalTopic}”，很多人都没看清真正的问题`,
    weitoutiao: `说句实话，${finalTopic}这事没那么简单`,
    wechat: `${finalTopic}背后，真正值得说的其实是这几点`,
    baijiahao: `${finalTopic}该怎么看？这篇讲清楚`,
  };

  const shortContent = `关于“${finalTopic}”，我更想说一个很多人忽略的点：真正决定结果的，往往不是表面热度，而是背后的逻辑。\n\n${finalAngle}，这才是更值得关注的地方。`;

  const longContent = `最近关于“${finalTopic}”的讨论很多，但越是热闹的时候，越容易把问题看浅了。

${personaText}

我更关心的不是表面的热度，而是它背后到底说明了什么。

第一，这类话题之所以能迅速引发关注，往往不是因为信息本身有多新，而是因为它刚好戳中了很多人的真实情绪和现实处境。大家表面上是在讨论事件，实际上是在借这个话题表达自己的焦虑、判断和立场。

第二，很多内容一味追求情绪拉满，但真正能留下来的文章，靠的不是喊口号，而是能把问题说透。观点可以鲜明，但一定要建立在真实、具体、可信的基础上。

第三，如果从“${finalAngle}”这个角度去看，事情就会更清楚：不是谁声音大谁就对，也不是谁站在道德高地谁就更有说服力。真正打动人的，往往是把复杂问题讲明白，把普通人的感受写出来。

${material ? `如果结合现有素材来看，还能看到这些信息：${material}` : "所以写这种内容，关键不是堆砌漂亮话，而是把真实判断写出来。"}

最后我想说，热点会过去，但真正有价值的写作，永远不是追热点本身，而是借热点把问题说透。

（目标字数：${wordCount}字左右）`;

  return {
    title: titleMap[platform] || `${finalTopic}该怎么看`,
    content: platform === "weitoutiao" ? shortContent : longContent,
  };
}

function adaptContentByPlatform(baseTitle, baseContent) {
  return {
    toutiao: {
      label: "今日头条版",
      title: baseTitle || "今日头条标题",
      content: `${baseContent}\n\n【头条向优化建议】进一步加强开头冲突点，压缩铺垫，增强观点穿透力。`,
    },
    weitoutiao: {
      label: "微头条版",
      title: baseTitle ? `微头条｜${baseTitle}` : "微头条标题",
      content: `我直说：${(baseContent || "").slice(0, 120)}……\n\n这事真正值得讨论的，不是表面，而是背后的逻辑。`,
    },
    baijiahao: {
      label: "百家号版",
      title: baseTitle || "百家号标题",
      content: `${baseContent}\n\n【百家号向优化建议】结构更工整，表达更稳，更适合解释型内容。`,
    },
    wechat: {
      label: "微信公众号版",
      title: baseTitle || "公众号标题",
      content: `${baseContent}\n\n【公众号向优化建议】保留完整逻辑，可进一步补充案例与过渡段。`,
    },
  };
}

function buildArticleTitle(title, topic, platform) {
  if (title && String(title).trim()) return String(title).trim();
  return `${platformLabel(platform)}｜${topic || "未命名文章"}`;
}

export default function Dashboard() {
  const [platform, setPlatform] = useState("toutiao");
  const [personas, setPersonas] = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [personaError, setPersonaError] = useState("");

  const [personaId, setPersonaId] = useState("");
  const [topic, setTopic] = useState("");
  const [hotPoint, setHotPoint] = useState("");
  const [angle, setAngle] = useState("");
  const [material, setMaterial] = useState("");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [contentType, setContentType] = useState("opinion");
  const [wordCount, setWordCount] = useState("1000");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [platformVersions, setPlatformVersions] = useState(null);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setLoadingPersonas(true);
        setPersonaError("");

        const response = await fetch("/api/personas");
        const text = await response.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("人设接口没有返回 JSON");
        }

        if (!response.ok) {
          throw new Error(data.error || "获取人设失败");
        }

        setPersonas(Array.isArray(data) ? data : []);
      } catch (error) {
        setPersonaError(error.message || "获取人设失败");
      } finally {
        setLoadingPersonas(false);
      }
    };

    fetchPersonas();
  }, []);

  useEffect(() => {
    const history = safeParse(localStorage.getItem("content_creator_history"), []);
    const last = Array.isArray(history) && history.length > 0 ? history[0] : null;

    if (!last) return;

    if (last.platform) setPlatform(last.platform);
    if (last.topic) setTopic(last.topic);
    if (last.hotPoint) setHotPoint(last.hotPoint);
    if (last.angle) setAngle(last.angle);
    if (last.material) setMaterial(last.material);
    if (last.extraPrompt) setExtraPrompt(last.extraPrompt);
    if (last.contentType) setContentType(last.contentType);
    if (last.wordCount) setWordCount(last.wordCount);
  }, []);

  useEffect(() => {
    if (platform === "weitoutiao") {
      setContentType("short");
      setWordCount("300");
    } else if (platform === "wechat") {
      setContentType("article");
      setWordCount((prev) => (prev === "300" ? "1200" : prev));
    } else if (platform === "toutiao") {
      setContentType("opinion");
      setWordCount((prev) => (prev === "300" ? "1000" : prev));
    }
  }, [platform]);

  const platformPersonas = useMemo(() => {
    return personas.filter((item) => {
      const p = normalizePersonaPlatform(item);
      return p === platform || p === "all";
    });
  }, [personas, platform]);

  useEffect(() => {
    if (platformPersonas.length === 0) {
      setPersonaId("");
      return;
    }

    const exists = platformPersonas.some(
      (item) => String(item.id) === String(personaId)
    );

    if (!exists) {
      setPersonaId(String(platformPersonas[0].id));
    }
  }, [platformPersonas, personaId]);

  const selectedPersona = useMemo(() => {
    return platformPersonas.find((item) => String(item.id) === String(personaId)) || null;
  }, [platformPersonas, personaId]);

  const personaPrompt = useMemo(() => {
    return buildPersonaPrompt(selectedPersona);
  }, [selectedPersona]);

  const generationInstruction = useMemo(() => {
    return buildGenerationInstruction({
      platform,
      topic,
      hotPoint,
      angle,
      material,
      extraPrompt,
      contentType,
      wordCount,
      personaPrompt,
    });
  }, [
    platform,
    topic,
    hotPoint,
    angle,
    material,
    extraPrompt,
    contentType,
    wordCount,
    personaPrompt,
  ]);

  const canGenerate = useMemo(() => {
    return topic.trim().length > 0 || hotPoint.trim().length > 0;
  }, [topic, hotPoint]);

  const currentPlatformDescription = useMemo(() => {
    return PLATFORM_OPTIONS.find((item) => item.value === platform)?.description || "";
  }, [platform]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      window.alert("请至少填写“文章主题”或“热点事件/话题”");
      return;
    }

    setLoading(true);

    try {
      let nextTitle = "";
      let nextContent = "";

      if (typeof aiService?.generateArticle === "function") {
        const res = await aiService.generateArticle({
          platform,
          personaId: selectedPersona?.id || null,
          personaName: selectedPersona?.name || "",
          personaPrompt,
          topic,
          hotPoint,
          angle,
          material,
          extraPrompt,
          contentType,
          wordCount,
          instruction: generationInstruction,
        });

        nextTitle = res?.data?.title || "";
        nextContent = res?.data?.content || "";
      }

      if (!nextTitle || !nextContent) {
        const fallback = buildFallbackContent({
          platform,
          topic,
          hotPoint,
          angle,
          material,
          wordCount,
          personaName: selectedPersona?.name || "",
        });

        nextTitle = fallback.title;
        nextContent = fallback.content;
      }

      setTitle(nextTitle);
      setContent(nextContent);
      setPlatformVersions(null);

      let history = safeParse(localStorage.getItem("content_creator_history"), []);
      if (!Array.isArray(history)) history = [];

      history.unshift({
        id: Date.now(),
        platform,
        personaId: selectedPersona?.id || null,
        personaName: selectedPersona?.name || "",
        topic,
        hotPoint,
        angle,
        material,
        extraPrompt,
        contentType,
        wordCount,
        title: nextTitle,
        content: nextContent,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem(
        "content_creator_history",
        JSON.stringify(history.slice(0, 100))
      );
    } catch (error) {
      console.error(error);
      window.alert("生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlatformVersions = () => {
    if (!content.trim()) {
      window.alert("请先生成正文");
      return;
    }

    setPlatformVersions(adaptContentByPlatform(title, content));
  };

  const handleSaveArticle = async () => {
    if (!content.trim()) {
      window.alert("请先生成正文");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: buildArticleTitle(title, topic || hotPoint, platform),
          content,
          personaId: selectedPersona?.id || null,
          personaName: selectedPersona?.name || "",
        }),
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("保存文章接口返回格式错误");
      }

      if (!response.ok) {
        throw new Error(data.error || "保存失败");
      }

      window.alert("文章已保存到文章库");
    } catch (error) {
      console.error(error);
      window.alert(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#f8fafc",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(340px, 430px) minmax(0, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 20 }}>
          <SectionCard
            title="创作工作台"
            description="先选平台和人设，再输入热点、角度与素材，直接生成正文。这里就是唯一创作入口。"
          >
            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>发文平台</FieldLabel>
              <Select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                options={PLATFORM_OPTIONS}
              />
              <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                {currentPlatformDescription}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel>人设</FieldLabel>
              <Select
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value)}
                disabled={loadingPersonas || platformPersonas.length === 0}
                options={
                  platformPersonas.length > 0
                    ? platformPersonas.map((item) => ({
                        label: item.name || `人设 ${item.id}`,
                        value: String(item.id),
                      }))
                    : [
                        {
                          label: loadingPersonas ? "加载中..." : "当前平台暂无人设",
                          value: "",
                        },
                      ]
                }
              />
              <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                {personaError
                  ? personaError
                  : selectedPersona
                  ? `${selectedPersona.role || "已选择人设"}${
                      selectedPersona.tone ? ` ｜ ${selectedPersona.tone}` : ""
                    }${selectedPersona.audience ? ` ｜ ${selectedPersona.audience}` : ""}`
                  : "当前平台下暂无可用人设，可先去人设库补充。"}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>文章主题</FieldLabel>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="例如：普通人该不该追逐热点写作"
                maxLength={100}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel>热点事件 / 热点话题</FieldLabel>
              <Input
                value={hotPoint}
                onChange={(e) => setHotPoint(e.target.value)}
                placeholder="例如：某热点新闻、某平台热议现象、某人物争议"
                maxLength={150}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel>切入角度</FieldLabel>
              <Input
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                placeholder="例如：普通人视角 / 反常识判断 / 行业视角 / 情绪观察"
                maxLength={120}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel>素材 / 信息点</FieldLabel>
              <Textarea
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                rows={7}
                maxLength={3000}
                placeholder={`把你掌握的信息尽量写清楚，例如：
1. 事件经过
2. 你认同或反对的点
3. 想重点展开的观点
4. 例子、数据、评论、经验
5. 不想写偏的方向`}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <FieldLabel>内容类型</FieldLabel>
                <Select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  options={[
                    { label: "观点文", value: "opinion" },
                    { label: "长文", value: "article" },
                    { label: "短内容", value: "short" },
                  ]}
                />
              </div>

              <div>
                <FieldLabel>目标字数</FieldLabel>
                <Select
                  value={wordCount}
                  onChange={(e) => setWordCount(e.target.value)}
                  options={[
                    { label: "300字", value: "300" },
                    { label: "500字", value: "500" },
                    { label: "800字", value: "800" },
                    { label: "1000字", value: "1000" },
                    { label: "1200字", value: "1200" },
                    { label: "1500字", value: "1500" },
                  ]}
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <FieldLabel>补充要求</FieldLabel>
              <Textarea
                value={extraPrompt}
                onChange={(e) => setExtraPrompt(e.target.value)}
                rows={5}
                maxLength={1500}
                placeholder="例如：更犀利一点、标题更抓人、语言更生活化、结尾更有力，但不要煽动"
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <ActionButton
                primary
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "生成中..." : "生成正文"}
              </ActionButton>

              <ActionButton
                onClick={handleGeneratePlatformVersions}
                disabled={!content.trim()}
              >
                生成四平台版本
              </ActionButton>

              <ActionButton
                onClick={handleSaveArticle}
                disabled={saving || !content.trim()}
              >
                {saving ? "保存中..." : "保存文章"}
              </ActionButton>
            </div>
          </SectionCard>

          <SectionCard
            title="当前人设"
            description="这里显示本次写作实际使用的人设信息。"
          >
            {!selectedPersona ? (
              <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.8 }}>
                当前还没有可用人设，你也可以先不选人设直接生成。
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                    人设名称
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
                    {selectedPersona.name || "-"}
                  </div>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                    角色定位 / 风格 / 读者
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.8, color: "#111827" }}>
                    {selectedPersona.role || "未设置角色定位"}
                    {selectedPersona.tone ? ` ｜ ${selectedPersona.tone}` : ""}
                    {selectedPersona.audience ? ` ｜ ${selectedPersona.audience}` : ""}
                  </div>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                    Prompt 设定
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.8, color: "#111827", whiteSpace: "pre-wrap" }}>
                    {personaPrompt || "暂无设定"}
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="本次生成规则"
            description="这是系统实际传给模型的写作规则，方便你后续持续调优。"
          >
            <div
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 13,
                lineHeight: 1.8,
                color: "#374151",
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 14,
              }}
            >
              {generationInstruction || "暂无生成规则"}
            </div>
          </SectionCard>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          <SectionCard
            title="生成结果"
            description="先生成标题和正文，再决定是否保存和扩展成多平台版本。"
          >
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <FieldLabel>标题</FieldLabel>
                <CopyButton text={title} />
              </div>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="生成后，这里显示标题"
                rows={3}
                style={{
                  width: "100%",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1.7,
                  boxSizing: "border-box",
                  resize: "vertical",
                  background: "#f8fafc",
                }}
              />
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <FieldLabel>正文</FieldLabel>
                <CopyButton text={content} />
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="生成后，这里显示正文"
                rows={22}
                style={{
                  width: "100%",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 14,
                  lineHeight: 1.9,
                  boxSizing: "border-box",
                  resize: "vertical",
                  background: "#f8fafc",
                  color: "#111827",
                }}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="四平台版本"
            description="基于当前正文，快速生成适配不同平台的手动发布版本。"
          >
            {!platformVersions ? (
              <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.8 }}>
                先生成正文，再点击“生成四平台版本”。
              </div>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {Object.entries(platformVersions).map(([key, item]) => (
                  <div
                    key={key}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      padding: 16,
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
                        {item.label}
                      </div>
                      <CopyButton text={`${item.title}\n\n${item.content}`} />
                    </div>

                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111827",
                        lineHeight: 1.7,
                        marginBottom: 8,
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        color: "#374151",
                        lineHeight: 1.9,
                        fontSize: 14,
                      }}
                    >
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}