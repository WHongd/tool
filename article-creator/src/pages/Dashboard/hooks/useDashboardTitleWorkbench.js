import { useMemo, useState } from "react";
import aiService from "../../../services/aiService";
import {
  findCandidateByTitle,
  getBestTitleItem,
  getTitleCandidates,
  getTitleText,
  normalizeTitleItem,
} from "../utils/dashboardTitleMappers";

export function useDashboardTitleWorkbench() {
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
  const [titleAnalysisError, setTitleAnalysisError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailResult, setDetailResult] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("");

  const candidates = useMemo(
    () => getTitleCandidates(titleAnalysisResult),
    [titleAnalysisResult]
  );

  const bestTitleItem = useMemo(
    () => normalizeTitleItem(getBestTitleItem(titleAnalysisResult)),
    [titleAnalysisResult]
  );

  const modalSuggestions = useMemo(
    () => candidates.map((item) => getTitleText(item)).filter(Boolean),
    [candidates]
  );

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
        preferredStyle,
        target,
        candidateCountPerStyle,
      });

      setTitleAnalysisResult(result);

      const best = normalizeTitleItem(getBestTitleItem(result));
      if (best?.title) {
        setSelectedTitle(best.title);
        setArticleTitle(best.title);
        setDetailResult(best);
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
    preferredStyle,
    setPreferredStyle,
    target,
    setTarget,
    candidateCountPerStyle,
    setCandidateCountPerStyle,

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

    handleGenerate,
    handlePickTitle,
    handleOpenDetail,
    handleUseBestTitle,
  };
}