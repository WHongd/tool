import TitleSuggestionModal from "../../components/business/TitleSuggestionModal";
import DashboardHero from "./components/DashboardHero";
import TitleBriefForm from "./components/TitleBriefForm";
import TitleStatsCardGroup from "./components/TitleStatsCardGroup";
import TitleResultPanel from "./components/TitleResultPanel";
import BestTitleCard from "./components/BestTitleCard";
import TitleDetailPanel from "./components/TitleDetailPanel";
import EmptyStateCard from "./components/EmptyStateCard";
import { useDashboardTitleWorkbench } from "./hooks/useDashboardTitleWorkbench";

export default function Dashboard() {
  const vm = useDashboardTitleWorkbench();

  return (
    <div className="min-h-full bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHero
          title="Dashboard V2"
          description="先完成标题工作台重构，后续再逐步接回正文、草稿、发布与收藏。"
        />

        <TitleStatsCardGroup
          topic={vm.topic}
          articleTitle={vm.articleTitle}
          result={vm.titleAnalysisResult}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <TitleBriefForm
              topic={vm.topic}
              setTopic={vm.setTopic}
              platform={vm.platform}
              setPlatform={vm.setPlatform}
              platformOptions={vm.platformOptions}
              loading={vm.titleLoading}
              onGenerate={vm.handleGenerate}
            />
          </div>

          <div className="space-y-6">
            <TitleResultPanel
              result={vm.titleAnalysisResult}
              loading={vm.titleLoading}
              error={vm.titleAnalysisError}
              onPickTitle={vm.handlePickTitle}
              onViewDetail={vm.handleOpenDetail}
              onOpenModal={() => vm.setTitleModalOpen(true)}
            />

            {!vm.titleAnalysisResult && !vm.titleLoading ? (
              <EmptyStateCard
                title="还没有生成标题方案"
                description="输入主题和基本参数后，先跑通第一版标题工作台。"
              />
            ) : null}
          </div>

          <div className="space-y-6">
            <BestTitleCard
              articleTitle={vm.articleTitle}
              result={vm.titleAnalysisResult}
              bestTitleItem={vm.bestTitleItem}
              onUseBestTitle={vm.handleUseBestTitle}
            />

            <TitleDetailPanel
              loading={vm.detailLoading}
              detail={vm.detailResult}
              selectedTitle={vm.selectedTitle}
            />
          </div>
        </div>
      </div>

      <TitleSuggestionModal
        isOpen={vm.titleModalOpen}
        onClose={() => vm.setTitleModalOpen(false)}
        suggestions={vm.modalSuggestions}
        onSelect={vm.handlePickTitle}
        onRegenerate={vm.handleGenerate}
        isLoading={vm.titleLoading}
      />
    </div>
  );
}