"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchDiagram } from "~/lib/fetch-backend";
import { getCachedDiagram, cacheDiagram } from "~/app/_actions/cache";
import MainCard from "~/components/main-card";
import Loading from "~/components/loading";
import MermaidChart from "~/components/mermaid-diagram";
import {
  handleModify,
  handleRegenerate,
  handleCopy,
} from "~/lib/action-buttons";
import { getLastGeneratedDate } from "~/app/_actions/repo";

export default function Repo() {
  const params = useParams<{ username: string; repo: string }>();
  const [diagram, setDiagram] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [lastGenerated, setLastGenerated] = useState<Date | undefined>();

  useEffect(() => {
    async function getDiagram() {
      setLoading(true);
      setError("");
      try {
        // First, try to get the cached diagram
        const cached = await getCachedDiagram(params.username, params.repo);

        if (cached) {
          console.log("Diagram code: ", cached);
          setDiagram(cached);
          // Fetch last generated date only after successful diagram retrieval
          const date = await getLastGeneratedDate(params.username, params.repo);
          setLastGenerated(date ?? undefined);
        } else {
          const result = await fetchDiagram(params.username, params.repo);
          if (result.error) {
            setError(result.error);
          } else if (result.response) {
            await cacheDiagram(params.username, params.repo, result.response);
            console.log("Diagram code: ", result.response);
            setDiagram(result.response);
            // Fetch last generated date only after successful diagram retrieval
            const date = await getLastGeneratedDate(
              params.username,
              params.repo,
            );
            setLastGenerated(date ?? undefined);
          }
        }
      } catch (error) {
        console.error("Error in getDiagram:", error);
        setError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    void getDiagram();
  }, [params.username, params.repo]);

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
