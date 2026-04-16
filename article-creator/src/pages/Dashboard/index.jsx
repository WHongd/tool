import React, { useMemo, useState } from "react";
import aiService from "../../services/aiService";
import TitleSuggestionModal from "../../components/business/TitleSuggestionModal";
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
      {required ? (
        <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>
      ) : null}
    </div>
  );
}

function Card({ title, description, children, rightSlot }) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#111827",
              marginBottom: 6,
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                fontSize: 14,
                color: "#6b7280",
                lineHeight: 1.7,
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        {rightSlot ? <div>{rightSlot}</div> : null}
      </div>

      {children}
    </section>
  );
}

function SelectCardGroup({
  options = [],
  value,
  onChange,
  columns = "repeat(auto-fit, minmax(180px, 1fr))",
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: columns,
        gap: 12,
      }}
    >
      {options.map((item) => {
        const active = value === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange?.(item.value)}
            style={{
              textAlign: "left",
              padding: 14,
              borderRadius: 16,
              border: active ? "1px solid #111827" : "1px solid #e5e7eb",
              background: active ? "#111827" : "#ffffff",
              color: active ? "#ffffff" : "#111827",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                marginBottom: item.description || item.style ? 6 : 0,
              }}
            >
              {item.label}
            </div>

            {item.description ? (
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: active ? "rgba(255,255,255,0.85)" : "#6b7280",
                }}
              >
                {item.description}
              </div>
            ) : null}

            {item.style ? (
              <div
                style={{
                  fontSize: 12,
                  marginTop: 6,
                  color: active ? "rgba(255,255,255,0.85)" : "#6b7280",
                }}
              >
                默认风格：{item.style}
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 6,
  maxLength,
}) {
  const commonStyle = {
    width: "100%",
    borderRadius: 16,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    padding: "14px 16px",
    fontSize: 15,
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
    lineHeight: 1.7,
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        style={{
          ...commonStyle,
          resize: "vertical",
          minHeight: rows * 24,
        }}
      />
    );
  }

  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      style={commonStyle}
    />
  );
}

function StatCard({ label, value, subText }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#6b7280",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          color: "#111827",
          fontWeight: 800,
          marginBottom: subText ? 6 : 0,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {subText ? (
        <div
          style={{
            fontSize: 13,
            color: "#6b7280",
            lineHeight: 1.7,
          }}
        >
          {subText}
        </div>
      ) : null}
    </div>
  );
}

function safeTrim(value) {
  return String(value || "").trim();
}

function countChineseChars(text) {
  return safeTrim(text).replace(/\s+/g, "").length;
}

function getTopCandidate(result) {
  const list = Array.isArray(result?.candidates) ? result.candidates : [];
  return list[0] || null;
}

export default function Dashboard() {
  const styleOptions = useMemo(() => aiService.getTitleStyleOptions(), []);
  const targetOptions = useMemo(() => aiService.getTitleTargetOptions(), []);
  const platformOptions = useMemo(() => aiService.getTitlePlatformOptions(), []);

  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("wechat");
  const [audience, setAudience] = useState("新手内容创作者");
  const [preferredStyle, setPreferredStyle] = useState("balanced");
  const [target, setTarget] = useState("trust");
  const [candidateCountPerStyle, setCandidateCountPerStyle] = useState(3);

  const [articleTitle, setArticleTitle] = useState("");
  const [articleContent, setArticleContent] = useState("");

  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleAnalysisResult, setTitleAnalysisResult] = useState(null);
  const [titleAnalysisError, setTitleAnalysisError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailResult, setDetailResult] = useState(null);
  const [detailError, setDetailError] = useState(null);

  const articleTitleLength = useMemo(
    () => countChineseChars(articleTitle),
    [articleTitle],
  );

  const articleContentLength = useMemo(
    () => countChineseChars(articleContent),
    [articleContent],
  );

  const bestCandidate = useMemo(
    () => getTopCandidate(titleAnalysisResult),
    [titleAnalysisResult],
  );

  const recommendedTitle = safeTrim(
    titleAnalysisResult?.bestTitle?.title ||
      bestCandidate?.rewrittenTitle ||
      bestCandidate?.title,
  );

  const handleGenerateTitleAnalysis = async () => {
    const finalTopic =
      safeTrim(topic) ||
      safeTrim(articleTitle) ||
      safeTrim(articleContent).slice(0, 80);

    if (!finalTopic) {
      window.alert("请先输入主题、标题或正文内容，再生成标题。");
      return;
    }

    setTitleLoading(true);
    setTitleModalOpen(true);
    setTitleAnalysisError(null);

    try {
      const response = await aiService.generateTitleAnalysis({
        topic: finalTopic,
        platform,
        audience,
        preferredStyle,
        target,
        candidateCountPerStyle,
      });

      setTitleAnalysisResult(response.data || null);
      setTitleAnalysisError(response.error?.message || null);
    } catch (error) {
      setTitleAnalysisResult(null);
      setTitleAnalysisError(
        error instanceof Error ? error.message : "生成失败，请稍后重试。",
      );
    } finally {
      setTitleLoading(false);
    }
  };

  const handleUseTitle = (title) => {
    const finalTitle = safeTrim(title);
    if (!finalTitle) return;
    setArticleTitle(finalTitle);
    setTitleModalOpen(false);
  };

  const handleAnalyzeTitleDetail = async (title) => {
  const finalTitle = safeTrim(title);
  const finalTopic =
    safeTrim(topic) ||
    safeTrim(articleTitle) ||
    safeTrim(articleContent).slice(0, 80);

  if (!finalTitle) {
    window.alert("请先生成或选择一个标题。");
    return;
  }

  setDetailLoading(true);
  setDetailResult(null);
  setDetailError(null);

  try {
    const res = await aiService.analyzeTitleDetail({
      title: finalTitle,
      topic: finalTopic,
    });

    setDetailResult(res || null);
  } catch (error) {
    setDetailError(
      error instanceof Error ? error.message : "详细分析失败，请稍后重试。",
    );
  } finally {
    setDetailLoading(false);
  }
};

  const handleStyleChange = (nextStyle) => {
    setPreferredStyle(nextStyle);

    if (nextStyle === "conflict") {
      setTarget("click");
    } else if (nextStyle === "practical") {
      setTarget("conversion");
    } else {
      setTarget("trust");
    }
  };

  const handleTargetChange = (nextTarget) => {
    setTarget(nextTarget);

    const matched = targetOptions.find((item) => item.value === nextTarget);
    if (matched?.style) {
      setPreferredStyle(matched.style);
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
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.7fr) minmax(320px, 0.9fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 20 }}>
          <Card
            title="创作工作台"
            description="这一版只保留新版标题系统：输入主题 → 生成标题 → 自动评分 → 自动改写 → 推荐最佳标题。"
            rightSlot={
              <button
                type="button"
                onClick={handleGenerateTitleAnalysis}
                disabled={titleLoading}
                style={{
                  border: "none",
                  background: titleLoading ? "#9ca3af" : "#111827",
                  color: "#ffffff",
                  borderRadius: 12,
                  cursor: titleLoading ? "not-allowed" : "pointer",
                  padding: "12px 18px",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                {titleLoading ? "生成中..." : "生成标题方案"}
              </button>
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <StatCard
                label="标题字数"
                value={articleTitleLength}
                subText="建议控制在 20 字以内"
              />
              <StatCard
                label="正文字符数"
                value={articleContentLength}
                subText="可直接拿正文主题辅助生成标题"
              />
              <StatCard
                label="推荐标题"
                value={recommendedTitle ? "已生成" : "未生成"}
                subText={recommendedTitle || "生成后会在这里显示最佳推荐"}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <FieldLabel required>主题</FieldLabel>
              <TextInput
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="例如：普通人做公众号怎么提高打开率"
                maxLength={120}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div>
                <FieldLabel>文章标题</FieldLabel>
                <TextInput
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  placeholder="可手动输入，也可由标题弹窗一键回填"
                  maxLength={60}
                />
              </div>

              <div>
                <FieldLabel>目标人群</FieldLabel>
                <TextInput
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="例如：新手创作者 / 宝妈 / 职场人"
                  maxLength={60}
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <FieldLabel>正文内容</FieldLabel>
              <TextInput
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                placeholder="在这里写正文、草稿或提纲。生成标题时，如果主题为空，会自动参考标题或正文前 80 个字符。"
                multiline
                rows={14}
                maxLength={20000}
              />
            </div>
          </Card>

          <Card
            title="标题策略设置"
            description="先设平台，再选目标和风格。系统会根据你的选择生成三种风格标题，并自动给出评分与改写方案。"
          >
            <div style={{ marginBottom: 20 }}>
              <FieldLabel>平台</FieldLabel>
              <SelectCardGroup
                options={platformOptions}
                value={platform}
                onChange={setPlatform}
                columns="repeat(auto-fit, minmax(150px, 1fr))"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <FieldLabel>内容目标</FieldLabel>
              <SelectCardGroup
                options={targetOptions}
                value={target}
                onChange={handleTargetChange}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <FieldLabel>偏好风格</FieldLabel>
              <SelectCardGroup
                options={styleOptions}
                value={preferredStyle}
                onChange={handleStyleChange}
              />
            </div>

            <div>
              <FieldLabel>每种风格生成数量</FieldLabel>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[2, 3, 4, 5].map((count) => {
                  const active = candidateCountPerStyle === count;

                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setCandidateCountPerStyle(count)}
                      style={{
                        border: active ? "none" : "1px solid #d1d5db",
                        background: active ? "#111827" : "#ffffff",
                        color: active ? "#ffffff" : "#111827",
                        borderRadius: 999,
                        cursor: "pointer",
                        padding: "10px 14px",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {count} 个
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          <Card
            title="最佳推荐"
            description="这里实时显示最近一次生成结果里的推荐标题。"
          >
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  marginBottom: 10,
                }}
              >
                推荐标题
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.6,
                  marginBottom: 12,
                  minHeight: 70,
                }}
              >
                {recommendedTitle || "暂未生成推荐标题"}
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: "#4b5563",
                  lineHeight: 1.8,
                  minHeight: 52,
                  marginBottom: 14,
                }}
              >
                {safeTrim(titleAnalysisResult?.bestTitle?.reason) ||
                  "生成后，这里会展示系统认为最适合当前平台与目标的标题。"}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handleUseTitle(recommendedTitle)}
                  disabled={!recommendedTitle}
                  style={{
                    border: "none",
                    background: recommendedTitle ? "#111827" : "#9ca3af",
                    color: "#ffffff",
                    borderRadius: 12,
                    cursor: recommendedTitle ? "pointer" : "not-allowed",
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  一键使用推荐标题
                </button>

                <button
                  type="button"
                  onClick={() => setTitleModalOpen(true)}
                  disabled={!titleAnalysisResult}
                  style={{
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#111827",
                    borderRadius: 12,
                    cursor: titleAnalysisResult ? "pointer" : "not-allowed",
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  查看完整评分结果
                </button>
                <button
                  type="button"
                  onClick={() => handleAnalyzeTitleDetail(recommendedTitle)}
                  disabled={!recommendedTitle || detailLoading}
                  style={{
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#111827",
                    borderRadius: 12,
                    cursor:
                      recommendedTitle && !detailLoading
                        ? "pointer"
                        : "not-allowed",
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {detailLoading ? "分析中..." : "查看详细分析"}
                </button>
              </div>
            </div>
          </Card>
          <Card
            title="标题详细分析"
            description="查看当前推荐标题的评分、问题、优化标题和正文大纲。"
          >
            {detailLoading ? (
              <div
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  lineHeight: 1.8,
                }}
              >
                正在分析标题，请稍候...
              </div>
            ) : detailError ? (
              <div
                style={{
                  fontSize: 14,
                  color: "#dc2626",
                  lineHeight: 1.8,
                }}
              >
                {detailError}
              </div>
            ) : detailResult ? (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <div
                    style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}
                  >
                    评分
                  </div>
                  <div
                    style={{ fontSize: 20, color: "#111827", fontWeight: 800 }}
                  >
                    {detailResult.score || "-"}
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <div
                    style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}
                  >
                    优点
                  </div>
                  <div
                    style={{ fontSize: 14, color: "#111827", lineHeight: 1.8 }}
                  >
                    {detailResult.strengths || "-"}
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <div
                    style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}
                  >
                    问题
                  </div>
                  <div
                    style={{ fontSize: 14, color: "#111827", lineHeight: 1.8 }}
                  >
                    {detailResult.weaknesses || "-"}
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <div
                    style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}
                  >
                    优化标题
                  </div>
                  <div
                    style={{ fontSize: 16, color: "#111827", fontWeight: 700 }}
                  >
                    {detailResult.optimizedTitle || "-"}
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <div
                    style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}
                  >
                    正文大纲
                  </div>

                  {Array.isArray(detailResult.outline) &&
                  detailResult.outline.length > 0 ? (
                    <div style={{ display: "grid", gap: 8 }}>
                      {detailResult.outline.map((item, index) => (
                        <div
                          key={`${index}-${item}`}
                          style={{
                            fontSize: 14,
                            color: "#111827",
                            lineHeight: 1.8,
                          }}
                        >
                          {index + 1}. {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, color: "#6b7280" }}>
                      暂无大纲
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  lineHeight: 1.8,
                }}
              >
                点击“查看详细分析”后，这里会展示标题评分、问题、优化标题和正文大纲。
              </div>
            )}
          </Card>
          <Card
            title="当前策略摘要"
            description="确认当前生成逻辑是否符合你的目标。"
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div
                  style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}
                >
                  平台
                </div>
                <div
                  style={{ fontSize: 15, color: "#111827", fontWeight: 700 }}
                >
                  {platformOptions.find((item) => item.value === platform)
                    ?.label || platform}
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div
                  style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}
                >
                  内容目标
                </div>
                <div
                  style={{ fontSize: 15, color: "#111827", fontWeight: 700 }}
                >
                  {targetOptions.find((item) => item.value === target)?.label ||
                    target}
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div
                  style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}
                >
                  偏好风格
                </div>
                <div
                  style={{ fontSize: 15, color: "#111827", fontWeight: 700 }}
                >
                  {styleOptions.find((item) => item.value === preferredStyle)
                    ?.label || preferredStyle}
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div
                  style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}
                >
                  目标人群
                </div>
                <div
                  style={{ fontSize: 15, color: "#111827", fontWeight: 700 }}
                >
                  {audience || "通用用户"}
                </div>
              </div>
            </div>
          </Card>

          <Card title="操作说明" description="这是新版最小闭环工作流。">
            <div
              style={{
                fontSize: 14,
                color: "#374151",
                lineHeight: 1.9,
              }}
            >
              1. 先输入主题或正文草稿。
              <br />
              2. 选择平台、目标和风格。
              <br />
              3. 点击“生成标题方案”。
              <br />
              4. 在弹窗里查看评分、短板、优化建议和改写标题。
              <br />
              5. 一键选用原标题或改写标题，自动回填到文章标题输入框。
            </div>
          </Card>
        </div>
      </div>

      <TitleSuggestionModal
        open={titleModalOpen}
        loading={titleLoading}
        result={titleAnalysisResult}
        error={titleAnalysisError}
        onClose={() => setTitleModalOpen(false)}
        onUseTitle={handleUseTitle}
      />
    </div>
  );
}