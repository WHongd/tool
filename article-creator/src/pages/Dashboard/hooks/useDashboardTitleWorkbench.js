import { useMemo, useState } from "react";
import aiService from "../../../services/aiService";
import {
  findCandidateByTitle,
  getBestTitleItem,
  getTitleCandidates,
  getTitleText,
  getTopThreeCandidates,
  normalizeTitleItem,
} from "../utils/dashboardTitleMappers";

const PLATFORM_OPTIONS = [
  { value: "toutiao", label: "今日头条" },
  { value: "weitoutiao", label: "微头条" },
  { value: "wechat", label: "微信公众号" },
];

const DEFAULT_PLATFORM = "wechat";
const DEFAULT_PREFERRED_STYLE = "balanced";
const DEFAULT_TARGET = "trust";
const FIXED_CANDIDATE_COUNT = 3;

function buildOpeningDraft({ topic, articleTitle }) {
  return `很多人一开始看到“${articleTitle}”这个问题时，第一反应往往是先去找方法、找案例、找捷径，但真正做起来才会发现，最关键的问题常常不是执行得不够，而是一开始理解错了重点。

围绕这个主题，真正值得先想清楚的，是为什么大多数人会在起步阶段就走偏，以及这种偏差会在后续带来什么问题。

接下来可以从三个方面展开：
1. 为什么这个问题很容易被误判
2. 大多数人最常见的错误动作是什么
3. 更稳妥、更适合普通人的进入方式应该怎么做

${
  topic?.trim()
    ? `如果把主题进一步落到“${topic.trim()}”上，你会发现，真正影响结果的，往往不是表面上的技巧，而是你一开始如何理解这件事、如何判断优先级，以及是否选对了切入方式。`
    : ""
}`;
}

export function useDashboardTitleWorkbench() {
  const styleOptions = useMemo(() => {
    if (typeof aiService.getTitleStyleOptions === "function") {
      return aiService.getTitleStyleOptions();
    }
    return [];
  }, []);

  const targetOptions = useMemo(() => {
    if (typeof aiService.getTitleTargetOptions === "function") {
      return aiService.getTitleTargetOptions();
    }
    return [];
  }, []);

  const platformOptions = useMemo(() => PLATFORM_OPTIONS, []);

  const [topic, setTopicState] = useState("");
  const [platform, setPlatformState] = useState(DEFAULT_PLATFORM);
  const [audience, setAudience] = useState("新手内容创作者");

  const [articleTitle, setArticleTitle] = useState("");
  const [articleContent, setArticleContentState] = useState("");
  const [contentDraftMap, setContentDraftMap] = useState({});

  const [titleLoading, setTitleLoading] = useState(false);
  const [titleAnalysisResult, setTitleAnalysisResult] = useState(null);
  const [titleAnalysisError, setTitleAnalysisError] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [creationSessionKey, setCreationSessionKey] = useState(0);

  const candidates = useMemo(
    () => getTopThreeCandidates(titleAnalysisResult),
    [titleAnalysisResult]
  );

  const bestTitleItem = useMemo(() => {
    const normalized = normalizeTitleItem(getBestTitleItem(titleAnalysisResult));
    if (normalized?.title) return normalized;
    return candidates.length ? normalizeTitleItem(candidates[0]) : null;
  }, [titleAnalysisResult, candidates]);

  const clearCurrentFlow = () => {
    setTitleAnalysisResult(null);
    setTitleAnalysisError("");
    setSelectedTitle("");
    setArticleTitle("");
    setArticleContentState("");
    setContentDraftMap({});
  };

  const handleStartNewCreation = () => {
    setTopicState("");
    setPlatformState(DEFAULT_PLATFORM);
    clearCurrentFlow();
    setCreationSessionKey((prev) => prev + 1);
  };

  const setTopic = (nextTopic) => {
    const normalizedNext = nextTopic ?? "";
    const normalizedCurrent = topic ?? "";

    if (normalizedNext === normalizedCurrent) return;

    setTopicState(normalizedNext);
    clearCurrentFlow();
  };

  const setPlatform = (nextPlatform) => {
    if (!nextPlatform || nextPlatform === platform) return;
    setPlatformState(nextPlatform);
    clearCurrentFlow();
  };

  const setArticleContent = (value) => {
    setArticleContentState(value);

    if (articleTitle) {
      setContentDraftMap((prev) => ({
        ...prev,
        [articleTitle]: value,
      }));
    }
  };

  const switchToTitle = (nextTitle) => {
    if (!nextTitle) return;

    if (articleTitle) {
      setContentDraftMap((prev) => ({
        ...prev,
        [articleTitle]: articleContent,
      }));
    }

    setSelectedTitle(nextTitle);
    setArticleTitle(nextTitle);

    setContentDraftMap((prev) => {
      const nextContent = prev[nextTitle] ?? "";
      setArticleContentState(nextContent);
      return prev;
    });
  };

  const syncTitleSelection = (item) => {
    const normalized = normalizeTitleItem(item);
    const title = getTitleText(normalized);

    if (!title) return;

    switchToTitle(title);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setTitleAnalysisError("请先输入主题");
      return;
    }

    setTitleLoading(true);
    setTitleAnalysisError("");

    try {
      const result = await aiService.generateTitleAnalysis({
        topic: topic.trim(),
        platform,
        audience,
        preferredStyle: DEFAULT_PREFERRED_STYLE,
        target: DEFAULT_TARGET,
        candidateCountPerStyle: 1,
        candidateCount: FIXED_CANDIDATE_COUNT,
      });

      setTitleAnalysisResult(result);

      const best = normalizeTitleItem(getBestTitleItem(result));
      if (best?.title) {
        switchToTitle(best.title);
      } else {
        const first = getTitleCandidates(result)[0];
        if (first) {
          syncTitleSelection(first);
        }
      }
    } catch (error) {
      setTitleAnalysisError(error?.message || "标题生成失败");
      setTitleAnalysisResult(null);
    } finally {
      setTitleLoading(false);
    }
  };

  const handlePickTitle = (item) => {
    if (typeof item === "string") {
      const found = findCandidateByTitle(titleAnalysisResult, item);
      syncTitleSelection(found || item);
      return;
    }

    syncTitleSelection(item);
  };

  const handleUseBestTitle = () => {
    if (bestTitleItem?.title) {
      syncTitleSelection(bestTitleItem);
    }
  };

  const handleGenerateOpening = async () => {
    if (!articleTitle) return;

    setContentLoading(true);
    try {
      const opening = buildOpeningDraft({
        topic,
        articleTitle,
      });

      const currentContent = articleContent.trim();

      if (!currentContent) {
        setArticleContent(opening);
        return;
      }

      const mergedContent = `${opening}

${currentContent}`;

      setArticleContent(mergedContent);
    } finally {
      setContentLoading(false);
    }
  };

  return {
    styleOptions,
    targetOptions,
    platformOptions,

    topic,
    setTopic,
    platform,
    setPlatform,
    audience,
    setAudience,

    articleTitle,
    setArticleTitle,
    articleContent,
    setArticleContent,
    contentDraftMap,

    titleLoading,
    titleAnalysisResult,
    titleAnalysisError,
    selectedTitle,
    contentLoading,
    creationSessionKey,

    candidates,
    bestTitleItem,
    fixedCandidateCount: FIXED_CANDIDATE_COUNT,

    handleGenerate,
    handlePickTitle,
    handleUseBestTitle,
    handleGenerateOpening,
    handleStartNewCreation,
  };
}