import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

function SectionCard({ title, description, children }) {
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
      <div style={{ marginBottom: 20 }}>
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

      {children}
    </section>
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
        borderRadius: 14,
        border: "1px solid #d1d5db",
        background: "#ffffff",
        padding: "12px 14px",
        fontSize: 14,
        color: "#111827",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        borderRadius: 14,
        border: "1px solid #d1d5db",
        background: "#ffffff",
        padding: "12px 14px",
        fontSize: 14,
        color: "#111827",
        outline: "none",
        boxSizing: "border-box",
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

function QuickActionCard({ title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        width: "100%",
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        borderRadius: 18,
        padding: 18,
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "#111827",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#6b7280",
          lineHeight: 1.7,
        }}
      >
        {description}
      </div>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [platform, setPlatform] = useState("toutiao");
  const [persona, setPersona] = useState("");
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("article");
  const [wordCount, setWordCount] = useState("800");

  const [recentItems] = useState([
    { label: "最近平台", value: "微信公众号" },
    { label: "最近人设", value: "理性副业教练" },
    { label: "最近主题", value: "普通人如何用 AI 提升内容生产效率" },
  ]);

  const handleStart = () => {
    if (!topic.trim()) {
      window.alert("请输入主题");
      return;
    }

    const draft = {
      platform,
      persona,
      topic,
      contentType,
      wordCount,
      createdAt: Date.now(),
    };

    localStorage.setItem("content_creator_draft", JSON.stringify(draft));
    navigate("/generate");
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
          maxWidth: 1160,
          margin: "0 auto",
          display: "grid",
          gap: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#111827",
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            内容创作工作台
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#6b7280",
              lineHeight: 1.8,
            }}
          >
            选择平台、人设与主题，快速进入正文生成。
          </div>
        </div>

        <SectionCard
          title="快速创作"
          description="先设定这次要写的平台、人设、主题和内容类型，点击后直接进入内容生成页。"
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <FieldLabel>发文平台</FieldLabel>
              <Select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                options={[
                  { label: "今日头条", value: "toutiao" },
                  { label: "微头条", value: "weitoutiao" },
                  { label: "百家号", value: "baijiahao" },
                  { label: "微信公众号", value: "wechat" },
                ]}
              />
            </div>

            <div>
              <FieldLabel>人设</FieldLabel>
              <Input
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="例如：理性副业教练 / 毒舌情感博主"
                maxLength={60}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel required>主题</FieldLabel>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：普通人如何用 AI 写出能变现的文章"
              maxLength={120}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div>
              <FieldLabel>内容类型</FieldLabel>
              <Select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                options={[
                  { label: "长文", value: "article" },
                  { label: "短内容", value: "short" },
                  { label: "观点文", value: "opinion" },
                ]}
              />
            </div>

            <div>
              <FieldLabel>字数</FieldLabel>
              <Select
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
                options={[
                  { label: "300字", value: "300" },
                  { label: "500字", value: "500" },
                  { label: "800字", value: "800" },
                  { label: "1200字", value: "1200" },
                ]}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleStart}
            style={{
              border: "none",
              background: "#111827",
              color: "#ffffff",
              borderRadius: 12,
              cursor: "pointer",
              padding: "12px 18px",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            开始生成内容
          </button>
        </SectionCard>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {recentItems.map((item) => (
            <div
              key={item.label}
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
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "#111827",
                  fontWeight: 800,
                  lineHeight: 1.6,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <SectionCard
          title="快捷入口"
          description="先保留最常用的3个入口，避免首页继续变复杂。"
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            <QuickActionCard
              title="进入人设库"
              description="查看、编辑和管理你的写作人设模板。"
              onClick={() => navigate("/personas")}
            />
            <QuickActionCard
              title="新建内容"
              description="直接跳去内容生成页，开始写正文。"
              onClick={() => navigate("/generate")}
            />
            <QuickActionCard
              title="查看历史记录"
              description="回看之前生成过的内容，继续复用。"
              onClick={() => navigate("/published")}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}