"use client";

import { useParams } from "next/navigation";
import MainCard from "~/components/main-card";
import Loading from "~/components/loading";
import MermaidChart from "~/components/mermaid-diagram";
import { useDiagram } from "~/hooks/useDiagram";
import { useState } from "react";
import { ApiKeyDialog } from "~/components/api-key-dialog";
import { ApiKeyButton } from "~/components/api-key-button";

export default function Repo() {
  const [zoomingEnabled, setZoomingEnabled] = useState(false);
  const params = useParams<{ username: string; repo: string }>();
  const {
    diagram,
    error,
    loading,
    lastGenerated,

    showApiKeyDialog,
    handleModify,
    handleRegenerate,
    handleCopy,
    handleApiKeySubmit,
    handleCloseApiKeyDialog,
    handleApiKeyDialog,
    handleExportImage,
    state,
  } = useDiagram(params.username.toLowerCase(), params.repo.toLowerCase());

  return (
    <div className="flex flex-col items-center p-4">
      <div className="flex w-full justify-center pt-8">
        <MainCard
          isHome={false}
          username={params.username.toLowerCase()}
          repo={params.repo.toLowerCase()}
          showCustomization={!loading && !error}
          onModify={handleModify}
          onRegenerate={handleRegenerate}
          onCopy={handleCopy}
          lastGenerated={lastGenerated}
          onExportImage={handleExportImage}
          zoomingEnabled={zoomingEnabled}
          onZoomToggle={() => setZoomingEnabled(!zoomingEnabled)}
          loading={loading}
        />
      </div>
      <div className="mt-8 flex w-full flex-col items-center gap-8">
        {loading ? (
          <Loading
            status={state.status}
            explanation={state.explanation}
            mapping={state.mapping}
            diagram={state.diagram}
          />
        ) : (
          <div className="flex w-full flex-col items-center gap-8">
            {/* Show error message if present */}
            {(error || state.error) && (
              <div className="text-center">
                <p className="max-w-4xl text-lg font-medium text-purple-600">
                  {error || state.error}
                </p>
                {(error?.includes("API key") ||
                  state.error?.includes("API key")) && (
                  <div className="mt-8 flex flex-col items-center gap-2">
                    <ApiKeyButton onClick={handleApiKeyDialog} />
                  </div>
                )}
              </div>
            )}
            {/* Always show diagram if available */}
            {diagram && (
              <div className="flex w-full justify-center px-4">
                <MermaidChart chart={diagram} zoomingEnabled={zoomingEnabled} />
              </div>
            )}
          </div>
        )}
      </div>

      <ApiKeyDialog
        isOpen={showApiKeyDialog}
        onClose={handleCloseApiKeyDialog}
        onSubmit={handleApiKeySubmit}
      />
    </div>
  );
}
