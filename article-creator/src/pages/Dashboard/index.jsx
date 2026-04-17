import { useEffect, useRef } from "react";
import TitleBriefForm from "./components/TitleBriefForm";
import TitleResultPanel from "./components/TitleResultPanel";
import ContentWorkspace from "./components/ContentWorkspace";
import { useDashboardTitleWorkbench } from "./hooks/useDashboardTitleWorkbench";

export default function Dashboard() {
  const vm = useDashboardTitleWorkbench();
  const titleSectionRef = useRef(null);
  const contentSectionRef = useRef(null);
  const lastAutoScrolledTitleRef = useRef("");

  useEffect(() => {
    if (!vm.titleLoading && vm.candidates.length > 0) {
      titleSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [vm.titleLoading, vm.candidates]);

  useEffect(() => {
    if (!vm.articleTitle) return;

    if (lastAutoScrolledTitleRef.current === vm.articleTitle) return;

    lastAutoScrolledTitleRef.current = vm.articleTitle;

    contentSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [vm.articleTitle]);

  return (
    <div className="min-h-full bg-gray-50 px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <TitleBriefForm
          topic={vm.topic}
          setTopic={vm.setTopic}
          platform={vm.platform}
          setPlatform={vm.setPlatform}
          platformOptions={vm.platformOptions}
          loading={vm.titleLoading}
          onGenerate={vm.handleGenerate}
          onStartNewCreation={vm.handleStartNewCreation}
        />

        <div ref={titleSectionRef}>
          <TitleResultPanel
            candidates={vm.candidates}
            loading={vm.titleLoading}
            error={vm.titleAnalysisError}
            onPickTitle={vm.handlePickTitle}
            selectedTitle={vm.selectedTitle}
            bestTitleItem={vm.bestTitleItem}
            onUseBestTitle={vm.handleUseBestTitle}
          />
        </div>

        <div ref={contentSectionRef}>
          <ContentWorkspace
            articleTitle={vm.articleTitle}
            articleContent={vm.articleContent}
            setArticleContent={vm.setArticleContent}
            onGenerateOpening={vm.handleGenerateOpening}
            contentLoading={vm.contentLoading}
          />
        </div>
      </div>
    </div>
  );
}