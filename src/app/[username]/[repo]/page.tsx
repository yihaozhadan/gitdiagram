"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCachedDiagram } from "~/app/_actions/cache";
import MainCard from "~/components/main-card";
import Loading from "~/components/loading";
import MermaidChart from "~/components/mermaid-diagram";
import { getLastGeneratedDate } from "~/app/_actions/repo";
import {
  generateAndCacheDiagram,
  modifyAndCacheDiagram,
} from "~/app/_actions/generate";
import { exampleRepos } from "~/lib/exampleRepos";

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
          console.log("Cached diagram code: ", cached);
          setDiagram(cached);
          const date = await getLastGeneratedDate(params.username, params.repo);
          setLastGenerated(date ?? undefined);
        } else {
          const result = await generateAndCacheDiagram(
            params.username,
            params.repo,
          );
          if (result.error) {
            setError(result.error);
          } else if (result.response) {
            console.log("Generated diagram code: ", result.response);
            setDiagram(result.response);
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

  const handleModify = async (instructions: string) => {
    if (isExampleRepo(params.repo)) {
      setError("Example repositories cannot be modified.");
      return;
    }

    setLoading(true);
    try {
      const result = await modifyAndCacheDiagram(
        params.username,
        params.repo,
        instructions,
      );
      if (result.response) {
        setDiagram(result.response);
        const date = await getLastGeneratedDate(params.username, params.repo);
        setLastGenerated(date ?? undefined);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (error) {
      console.error("Error modifying diagram:", error);
      setError("Failed to modify diagram. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const isExampleRepo = (repoName: string): boolean => {
    for (const value of Object.values(exampleRepos)) {
      if (value.includes(repoName)) {
        return true;
      }
    }
    return false;
  };

  const handleRegenerate = async (instructions: string) => {
    // Check if this is an example repo
    if (isExampleRepo(params.repo)) {
      setError("Example repositories cannot be regenerated.");
      return;
    }

    setLoading(true);
    try {
      const result = await generateAndCacheDiagram(
        params.username,
        params.repo,
        instructions,
      );
      if (result.response) {
        setDiagram(result.response);
        const date = await getLastGeneratedDate(params.username, params.repo);
        setLastGenerated(date ?? undefined);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (error) {
      console.error("Error regenerating diagram:", error);
      setError("Failed to regenerate diagram. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(diagram);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

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
