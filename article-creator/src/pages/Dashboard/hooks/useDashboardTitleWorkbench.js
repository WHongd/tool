import { useMemo, useState } from "react";
import aiService from "../../../services/aiService";

function getCandidates(result) {
  return Array.isArray(result?.data?.candidates) ? result.data.candidates : [];
}

function getBestTitle(result) {
  return result?.data?.bestTitle || getCandidates(result)[0] || null;
}

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
        preferredStyle,
        target,
        candidateCountPerStyle,
      });

      setTitleAnalysisResult(result);
      const best = getBestTitle(result);
      if (best?.title) {
        setSelectedTitle(best.title);
        setDetailResult(best);
      }
    } catch (error) {
      setTitleAnalysisError(error?.message || "标题生成失败");
    } finally {
      setTitleLoading(false);
    }
  };

  const handlePickTitle = (item) => {
    const title = typeof item === "string" ? item : item?.title || "";
    if (!title) return;

    setSelectedTitle(title);
    setArticleTitle(title);

    const found = getCandidates(titleAnalysisResult).find(
      (candidate) => candidate?.title === title
    );

    if (found) {
      setDetailResult(found);
    }

    setTitleModalOpen(false);
  };

  const handleOpenDetail = async (item) => {
    setDetailLoading(true);
    try {
      setSelectedTitle(item?.title || "");
      setDetailResult(item || null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUseBestTitle = () => {
    const best = getBestTitle(titleAnalysisResult);
    if (best?.title) {
      setArticleTitle(best.title);
      setSelectedTitle(best.title);
      setDetailResult(best);
    }
  };

  const modalSuggestions = useMemo(() => {
    return getCandidates(titleAnalysisResult).map((item) => item.title);
  }, [titleAnalysisResult]);

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

    modalSuggestions,

    handleGenerate,
    handlePickTitle,
    handleOpenDetail,
    handleUseBestTitle,
  };
}