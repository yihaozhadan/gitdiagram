"use client";

import { useParams } from "next/navigation";
import MainCard from "~/components/main-card";
import Loading from "~/components/loading";
import MermaidChart from "~/components/mermaid-diagram";
import { useDiagram } from "~/hooks/useDiagram";

export default function Repo() {
  const params = useParams<{ username: string; repo: string }>();
  const {
    diagram,
    error,
    loading,
    lastGenerated,
    handleModify,
    handleRegenerate,
    handleCopy,
  } = useDiagram(params.username, params.repo);

  return (
    <div className="flex min-h-screen flex-col items-center p-4">
      <div className="flex w-full justify-center pt-8">
        <MainCard
          isHome={false}
          username={params.username}
          repo={params.repo}
          showCustomization={!loading && !error}
          onModify={handleModify}
          onRegenerate={handleRegenerate}
          onCopy={handleCopy}
          lastGenerated={lastGenerated}
        />
      </div>
      <div className="mt-8 flex w-full flex-col items-center gap-8">
        {loading ? (
          <div className="mt-12">
            <Loading />
          </div>
        ) : error ? (
          <div className="mt-12 text-center">
            <p className="text-lg font-medium text-red-600">{error}</p>
            {error.includes("Rate limit") && (
              <p className="mt-2 text-sm text-gray-600">
                Rate limits: 1 request per minute, 5 requests per day
              </p>
            )}
          </div>
        ) : (
          <div className="flex w-full justify-center px-4">
            <MermaidChart chart={diagram} />
          </div>
        )}
      </div>
    </div>
  );
}
