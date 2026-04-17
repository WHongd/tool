import TitleSuggestionModal from "../../components/business/TitleSuggestionModal";
import TitleBriefForm from "./components/TitleBriefForm";
import TitleResultPanel from "./components/TitleResultPanel";
import ContentWorkspace from "./components/ContentWorkspace";
import { useDashboardTitleWorkbench } from "./hooks/useDashboardTitleWorkbench";

export default function Dashboard() {
  const vm = useDashboardTitleWorkbench();

  return (
    <div className="min-h-full bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <TitleBriefForm
            topic={vm.topic}
            setTopic={vm.setTopic}
            platform={vm.platform}
            setPlatform={vm.setPlatform}
            platformOptions={vm.platformOptions}
            loading={vm.titleLoading}
            onGenerate={vm.handleGenerate}
          />
        </section>

        <section>
          <TitleResultPanel
            candidates={vm.candidates}
            loading={vm.titleLoading}
            error={vm.titleAnalysisError}
            onPickTitle={vm.handlePickTitle}
            selectedTitle={vm.selectedTitle}
            bestTitleItem={vm.bestTitleItem}
            onUseBestTitle={vm.handleUseBestTitle}
          />
        </section>

        <section>
          <ContentWorkspace
            articleTitle={vm.articleTitle}
            articleContent={vm.articleContent}
            setArticleContent={vm.setArticleContent}
            onGenerateOpening={vm.handleGenerateOpening}
            contentLoading={vm.contentLoading}
          />
        </section>
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