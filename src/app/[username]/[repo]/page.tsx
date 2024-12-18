"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchDiagram } from "~/lib/fetch-backend";
import { getCachedDiagram, cacheDiagram } from "~/app/_actions/cache";
import GHForm from "~/components/gh-form";
import Loading from "~/components/loading";
import MermaidChart from "~/components/mermaid-diagram";

export default function Repo() {
  const params = useParams<{ username: string; repo: string }>();
  const [diagram, setDiagram] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getDiagram() {
      setLoading(true);
      try {
        // First, try to get the cached diagram
        const cached = await getCachedDiagram(params.username, params.repo);

        if (cached) {
          setDiagram(cached);
        } else {
          const diagramText = await fetchDiagram(params.username, params.repo);
          await cacheDiagram(params.username, params.repo, diagramText);
          setDiagram(diagramText);
        }
      } catch (error) {
        console.error("Error in getDiagram:", error);
      } finally {
        setLoading(false);
      }
    }

    void getDiagram();
  }, [params.username, params.repo]);

  return (
    <div className="flex min-h-screen flex-col items-center p-4">
      <div className="flex w-full justify-center pt-8">
        <GHForm
          showExamples={false}
          username={params.username}
          repo={params.repo}
        />
      </div>
      <div className="mt-8 flex w-full justify-center">
        {loading ? (
          <div className="mt-12">
            <Loading />
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
