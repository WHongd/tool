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

// 过渡期先固定；后续改成从人设自动派生
const DEFAULT_PREFERRED_STYLE = "balanced";
const DEFAULT_TARGET = "trust";
const FIXED_CANDIDATE_COUNT = 3;

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

  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState(DEFAULT_PLATFORM);
  const [audience, setAudience] = useState("新手内容创作者");

  const [articleTitle, setArticleTitle] = useState("");
  const [articleContent, setArticleContent] = useState("");

  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleAnalysisResult, setTitleAnalysisResult] = useState(null);
  const [titleAnalysisError, setTitleAnalysisError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailResult, setDetailResult] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("");
const candidates = useMemo(
  () => getTopThreeCandidates(titleAnalysisResult),
  [titleAnalysisResult]
);

  const bestTitleItem = useMemo(() => {
    const normalized = normalizeTitleItem(getBestTitleItem(titleAnalysisResult));
    if (normalized?.title) return normalized;
    return candidates.length ? normalizeTitleItem(candidates[0]) : null;
  }, [titleAnalysisResult, candidates]);

  const modalSuggestions = useMemo(
    () =>
      candidates
        .map((item) => getTitleText(item))
        .filter(Boolean)
        .slice(0, FIXED_CANDIDATE_COUNT),
    [candidates]
  );

  const currentPlatformLabel = useMemo(() => {
    return (
      platformOptions.find((item) => item.value === platform)?.label || "微信公众号"
    );
  }, [platform, platformOptions]);

  const syncTitleSelection = (item) => {
    const normalized = normalizeTitleItem(item);
    const title = getTitleText(normalized);

    if (!title) return;

    setSelectedTitle(title);
    setArticleTitle(title);
    setDetailResult(normalized);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setTitleAnalysisError("请先输入主题");
      return;
    }

    setTitleLoading(true);
    setTitleAnalysisError("");
    setDetailResult(null);
    setSelectedTitle("");

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
        setSelectedTitle(best.title);
        setArticleTitle(best.title);
        setDetailResult(best);
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
      setTitleModalOpen(false);
      return;
    }

    syncTitleSelection(item);
    setTitleModalOpen(false);
  };

  const handleOpenDetail = async (item) => {
    setDetailLoading(true);
    try {
      const normalized = normalizeTitleItem(item);
      if (normalized?.title) {
        setSelectedTitle(normalized.title);
        setDetailResult(normalized);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUseBestTitle = () => {
    if (bestTitleItem?.title) {
      syncTitleSelection(bestTitleItem);
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

    titleModalOpen,
    setTitleModalOpen,
    titleLoading,
    titleAnalysisResult,
    titleAnalysisError,
    detailLoading,
    detailResult,
    selectedTitle,

    candidates,
    bestTitleItem,
    modalSuggestions,
    currentPlatformLabel,
    fixedCandidateCount: FIXED_CANDIDATE_COUNT,

    handleGenerate,
    handlePickTitle,
    handleOpenDetail,
    handleUseBestTitle,
  };
}