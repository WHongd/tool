// 文件作用：文章总库页面，展示全部文章并支持按状态筛选
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useArticleStore } from '../../stores/useArticleStore';
import { usePersonaStore } from '../../stores/usePersonaStore';
import aiService from "../../services/aiService";
import { Eye, Trash2, Plus, BarChart3 } from 'lucide-react';
import ManualArticleModal from '../../components/business/ManualArticleModal';
import StyleAnalysisModal from '../../components/business/StyleAnalysisModal';
import { PLATFORM_NAMES } from '../../constants/platforms';

export default function ArticleLibrary() {
  const {
    publishedArticles,
    favorites,
    deletePublishedArticle,
    getArticleState,
  } = useArticleStore();
  const { personas, updatePersona } = usePersonaStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewingArticle, setViewingArticle] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [analysisModal, setAnalysisModal] = useState({
    isOpen: false,
    article: null,
    analysis: null,
    isApplying: false,
  });

  const favoriteIds = useMemo(
    () => new Set((favorites || []).map((item) => item.id)),
    [favorites],
  );

  const getPersonaName = (personaId) => {
    const p = personas.find((p) => p.id === personaId);
    return p ? p.name : '未知人设';
  };

  const filteredArticles = publishedArticles.filter((article) => {
    const plainText = (article.content || '').replace(/<[^>]*>/g, '');
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plainText.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPersona =
      selectedPersona === 'all' || article.personaId === selectedPersona;

    const matchesPlatform =
      selectedPlatform === 'all' || article.platform === selectedPlatform;

    const articleState = getArticleState(article);
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'draft' && articleState.isDraft) ||
      (selectedStatus === 'published' && articleState.isPublished) ||
      (selectedStatus === 'favorited' && favoriteIds.has(article.id));

    return matchesSearch && matchesPersona && matchesPlatform && matchesStatus;
  });

  const handleAnalyzeStyle = async (article) => {
    setAnalysisModal({
      isOpen: true,
      article,
      analysis: null,
      isApplying: false,
    });

    try {
      const analysis = await analyzeArticleStyle(article.content, null);
      setAnalysisModal((prev) => ({ ...prev, analysis }));
    } catch (error) {
      console.error('分析失败:', error);
      toast.error('分析失败，请稍后重试');
      setAnalysisModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleApplyStyle = async () => {
    const { article, analysis } = analysisModal;
    if (!article || !analysis) return;

    setAnalysisModal((prev) => ({ ...prev, isApplying: true }));

    try {
      const targetPersona = personas.find((p) => p.id === article.personaId);
      if (!targetPersona) throw new Error('未找到对应人设');

      const updatedPersona = {
        ...targetPersona,
        writingStyle: {
          ...targetPersona.writingStyle,
          description: analysis.styleDescription,
        },
      };

      updatePersona(targetPersona.id, updatedPersona);
      toast.success('人设风格已更新！');

      setAnalysisModal({
        isOpen: false,
        article: null,
        analysis: null,
        isApplying: false,
      });
    } catch (error) {
      console.error('应用失败:', error);
      toast.error('应用失败，请重试');
    } finally {
      setAnalysisModal((prev) => ({ ...prev, isApplying: false }));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">文章总库</h1>
        <button
          onClick={() => setIsManualModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          <Plus size={18} />
          <span>手动添加</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="搜索标题或内容..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg w-64"
        />

        <select
          value={selectedPersona}
          onChange={(e) => setSelectedPersona(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">所有人设</option>
          {personas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">全部平台</option>
          <option value="weitoutiao">微头条</option>
          <option value="toutiao">今日头条</option>
          <option value="baijiahao">百家号</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">全部状态</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="favorited">已收藏</option>
        </select>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无符合条件的文章。
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article, index) => {
            const articleState = getArticleState(article);

            return (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2 flex-wrap">
                      <span className="text-sm text-gray-500">#{index + 1}</span>

                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {getPersonaName(article.personaId)}
                      </span>

                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {PLATFORM_NAMES[article.platform] || article.platform}
                      </span>

                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {article.aiProvider === "deepseek"
                          ? "DeepSeek"
                          : article.aiProvider === "volc"
                            ? "豆包"
                            : "AI来源未知"}
                      </span>

                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                        {articleState.label}
                      </span>

                      <span className="text-xs text-gray-400">
                        {new Date(
                          article.publishedAt || article.createdAt,
                        ).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900">
                      {article.title}
                    </h3>

                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {(article.content || "")
                        .replace(/<[^>]*>/g, "")
                        .substring(0, 150)}
                      ...
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>状态：{articleState.label}</span>

                      <span>
                        AI：
                        {article.aiProvider === "deepseek"
                          ? "DeepSeek"
                          : article.aiProvider === "volc"
                            ? "豆包"
                            : "未知"}
                      </span>

                      <span>
                        平台：
                        {PLATFORM_NAMES[article.platform] || article.platform}
                      </span>

                      <span>
                        发布时间：
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleString()
                          : '未发布'}
                      </span>

                      <span>
                        字数：
                        {(article.content || "").replace(/<[^>]*>/g, "").length}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewingArticle(article)}
                      className="p-2 text-gray-500 hover:text-brand-600"
                      title="查看全文"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => handleAnalyzeStyle(article)}
                      className="p-2 text-gray-500 hover:text-brand-600"
                      title="分析风格"
                    >
                      <BarChart3 size={18} />
                    </button>

                    <button
                      onClick={async () => {
                        if (window.confirm("确定删除这篇文章吗？")) {
                          try {
                            await deletePublishedArticle(article.id);
                            toast.success("文章已删除");
                          } catch (error) {
                            toast.error(`删除失败：${error.message}`);
                          }
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-red-600"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewingArticle && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setViewingArticle(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{viewingArticle.title}</h2>
              <button
                onClick={() => setViewingArticle(null)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: viewingArticle.content }}
            />

            <div className="mt-4 text-right text-xs text-gray-400">
              发布时间：{" "}
              {viewingArticle.publishedAt
                ? new Date(viewingArticle.publishedAt).toLocaleString()
                : "未发布"}
            </div>
          </div>
        </div>
      )}

      <ManualArticleModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      <StyleAnalysisModal
        isOpen={analysisModal.isOpen}
        onClose={() =>
          setAnalysisModal({
            isOpen: false,
            article: null,
            analysis: null,
            isApplying: false,
          })
        }
        analysis={analysisModal.analysis}
        onApply={handleApplyStyle}
        isApplying={analysisModal.isApplying}
      />
    </div>
  );
}