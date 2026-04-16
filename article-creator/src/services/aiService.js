// src/services/aiService.js
//
// 最新版 AI 服务层：仅保留“标题生成 + 评分 + 自动改写”一体化能力
// 不兼容旧接口，请同步更新调用方
//
// 对外主接口：
// 1. generateTitleAnalysis(params)
// 2. getTitleStyleOptions()
// 3. getTitleTargetOptions()
// 4. getTitlePlatformOptions()
//
// 说明：
// - 默认优先调用你项目里的大模型接口
// - 要求模型返回 JSON
// - 若模型返回异常，将自动使用本地 fallback
// - 你只需要在调用处传入 topic / platform / audience / preferredStyle 即可

import {
  TITLE_STYLES,
  TITLE_TARGETS,
  TITLE_PLATFORMS,
  buildTitleIntegratedPrompt,
  parseTitleAnalysisText,
  normalizeTitleAnalysisResult,
  createFallbackTitleCandidates,
  inferStyleByTarget,
} from "./titleEngine";

const DEFAULT_TIMEOUT =  120000;

// 你可以根据自己的项目环境修改这里：
// 1. Vite: import.meta.env.VITE_API_BASE_URL
// 2. CRA: process.env.REACT_APP_API_BASE_URL
const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE_URL) ||
  "";

const AI_CHAT_ENDPOINT =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_AI_CHAT_ENDPOINT) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_AI_CHAT_ENDPOINT) ||
  "/api/ai/chat";

function safeTrim(value) {
  return String(value || "").trim();
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function buildUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  if (!API_BASE_URL) return path;

  const base = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const next = path.startsWith("/") ? path : `/${path}`;
  return `${base}${next}`;
}

function createTimeoutSignal(timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

async function safeReadJson(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { rawText: text };
  }
}

function extractModelText(payload) {
  if (!payload) return "";

  if (typeof payload === "string") return payload;

  if (typeof payload?.output_text === "string") return payload.output_text;
  if (typeof payload?.text === "string") return payload.text;
  if (typeof payload?.content === "string") return payload.content;
  if (typeof payload?.message === "string") return payload.message;
  if (typeof payload?.answer === "string") return payload.answer;
  if (typeof payload?.rawText === "string") return payload.rawText;

  if (Array.isArray(payload?.choices) && payload.choices.length > 0) {
    const first = payload.choices[0];

    if (typeof first?.text === "string") return first.text;
    if (typeof first?.message?.content === "string") return first.message.content;

    if (Array.isArray(first?.message?.content)) {
      const joined = first.message.content
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item?.text === "string") return item.text;
          return "";
        })
        .join("\n")
        .trim();

      if (joined) return joined;
    }
  }

  if (Array.isArray(payload?.data) && payload.data.length > 0) {
    const joined = payload.data
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item?.text === "string") return item.text;
        if (typeof item?.content === "string") return item.content;
        return "";
      })
      .join("\n")
      .trim();

    if (joined) return joined;
  }

  return "";
}

function buildRequestBody({
  systemPrompt,
  userPrompt,
  model,
  temperature,
  maxTokens,
  responseFormat,
}) {
  return {
    model: model || "gpt-4.1",
    temperature: typeof temperature === "number" ? temperature : 0.7,
    max_tokens: typeof maxTokens === "number" ? maxTokens : 2200,
    response_format: responseFormat || { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };
}

async function requestModel({
  systemPrompt,
  userPrompt,
  model,
  temperature = 0.7,
  maxTokens = 2200,
  timeout = DEFAULT_TIMEOUT,
  responseFormat = { type: "json_object" },
  endpoint = AI_CHAT_ENDPOINT,
  headers = {},
}) {
  const url = buildUrl(endpoint);
  const { signal, clear } = createTimeoutSignal(timeout);

  try {
    const response = await fetch(url, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(
        buildRequestBody({
          systemPrompt,
          userPrompt,
          model,
          temperature,
          maxTokens,
          responseFormat,
        }),
      ),
    });

    const payload = await safeReadJson(response);

    if (!response.ok) {
      const message =
        payload?.error?.message ||
        payload?.message ||
        `AI 请求失败（${response.status}）`;
      throw new Error(message);
    }

    return payload;
  } finally {
    clear();
  }
}

function normalizeInput(params = {}) {
  const topic = safeTrim(params.topic);
  const audience = safeTrim(params.audience || "通用用户");
  const platform = safeTrim(params.platform || "generic");
  const candidateCountPerStyle = Math.max(
    1,
    Math.min(10, Number(params.candidateCountPerStyle || 3)),
  );

  let preferredStyle = safeTrim(params.preferredStyle || "");
  const target = safeTrim(params.target || "");

  if (!preferredStyle && target) {
    preferredStyle = inferStyleByTarget(target);
  }

  if (!preferredStyle) {
    preferredStyle = "balanced";
  }

  return {
    topic,
    audience,
    platform,
    preferredStyle,
    target,
    candidateCountPerStyle,
    model: safeTrim(params.model || ""),
    endpoint: safeTrim(params.endpoint || ""),
    timeout:
      typeof params.timeout === "number" && params.timeout > 0
        ? params.timeout
        : DEFAULT_TIMEOUT,
    temperature:
      typeof params.temperature === "number" ? params.temperature : 0.7,
    maxTokens: typeof params.maxTokens === "number" ? params.maxTokens : 2200,
    headers: isObject(params.headers) ? params.headers : {},
  };
}

function validateInput(params) {
  if (!params.topic) {
    throw new Error("topic 不能为空");
  }
}

function createMeta({
  source,
  usedFallback,
  duration,
  preferredStyle,
  platform,
  audience,
  candidateCountPerStyle,
}) {
  return {
    source,
    usedFallback,
    duration,
    preferredStyle,
    platform,
    audience,
    candidateCountPerStyle,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * 主接口：生成标题分析结果
 *
 * 入参：
 * {
 *   topic: string,                  // 必填
 *   platform?: string,              // wechat / xiaohongshu / douyin / zhihu / generic ...
 *   audience?: string,              // 目标人群
 *   preferredStyle?: string,        // balanced / conflict / practical
 *   target?: string,                // click / trust / conversion，可替代 preferredStyle
 *   candidateCountPerStyle?: number,
 *   model?: string,
 *   endpoint?: string,
 *   timeout?: number,
 *   temperature?: number,
 *   maxTokens?: number,
 *   headers?: object
 * }
 *
 * 出参：
 * {
 *   success: true,
 *   data: {
 *     platform,
 *     audience,
 *     topic,
 *     recommendedStyle,
 *     candidates: [...],
 *     bestTitle: {...}
 *   },
 *   meta: {...}
 * }
 */
export async function generateTitleAnalysis(input = {}) {
  const startedAt = Date.now();
  const params = normalizeInput(input);

  validateInput(params);

  const {
    systemPrompt,
    userPrompt,
  } = buildTitleIntegratedPrompt({
    topic: params.topic,
    platform: params.platform,
    audience: params.audience,
    preferredStyle: params.preferredStyle,
    candidateCountPerStyle: params.candidateCountPerStyle,
  });

  try {
    const payload = await requestModel({
      systemPrompt,
      userPrompt,
      model: params.model || "gpt-4.1",
      temperature: params.temperature,
      maxTokens: params.maxTokens,
      timeout: params.timeout,
      responseFormat: { type: "json_object" },
      endpoint: params.endpoint || AI_CHAT_ENDPOINT,
      headers: params.headers,
    });

    const modelText = extractModelText(payload);
    let parsed = null;

    if (isObject(payload) && Array.isArray(payload?.candidates)) {
      parsed = payload;
    } else {
      parsed = parseTitleAnalysisText(modelText);
    }

    if (!parsed || !Array.isArray(parsed.candidates) || parsed.candidates.length === 0) {
      throw new Error("模型返回内容无法解析为有效标题结果");
    }

    const data = normalizeTitleAnalysisResult(parsed, {
      topic: params.topic,
      platform: TITLE_PLATFORMS[params.platform] || params.platform || "通用平台",
      audience: params.audience,
      recommendedStyle: params.preferredStyle,
    });

    return {
      success: true,
      data,
      meta: createMeta({
        source: "model",
        usedFallback: false,
        duration: Date.now() - startedAt,
        preferredStyle: params.preferredStyle,
        platform: params.platform,
        audience: params.audience,
        candidateCountPerStyle: params.candidateCountPerStyle,
      }),
    };
  } catch (error) {
    const data = createFallbackTitleCandidates({
      topic: params.topic,
      preferredStyle: params.preferredStyle,
    });

    return {
      success: true,
      data,
      meta: createMeta({
        source: "fallback",
        usedFallback: true,
        duration: Date.now() - startedAt,
        preferredStyle: params.preferredStyle,
        platform: params.platform,
        audience: params.audience,
        candidateCountPerStyle: params.candidateCountPerStyle,
      }),
      error: {
        message: error instanceof Error ? error.message : "未知错误",
      },
    };
  }
}

export function getTitleStyleOptions() {
  return Object.values(TITLE_STYLES).map((item) => ({
    value: item.key,
    label: item.label,
    description: item.description,
  }));
}

export function getTitleTargetOptions() {
  return Object.values(TITLE_TARGETS).map((item) => ({
    value: item.key,
    label: item.label,
    style: item.style,
  }));
}

export function getTitlePlatformOptions() {
  return Object.entries(TITLE_PLATFORMS).map(([value, label]) => ({
    value,
    label,
  }));
}
export async function analyzeTitleDetail({ title, topic }) {
  const url = buildUrl('/api/ai/analyze-title');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, topic }),
  });

  const payload = await safeReadJson(res);

  if (!res.ok) {
    throw new Error(
      payload?.error?.message || payload?.message || `分析失败（${res.status}）`
    );
  }

  return payload;
}
const aiService = {
  generateTitleAnalysis,
  analyzeTitleDetail,
  getTitleStyleOptions,
  getTitleTargetOptions,
  getTitlePlatformOptions,
};



export default aiService;