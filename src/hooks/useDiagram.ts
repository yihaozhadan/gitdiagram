import { useState, useEffect, useCallback } from "react";
import { getCachedDiagram } from "~/app/_actions/cache";
import { getLastGeneratedDate } from "~/app/_actions/repo";
import {
  generateAndCacheDiagram,
  modifyAndCacheDiagram,
  getCostOfGeneration,
} from "~/lib/fetch-backend";
import { exampleRepos } from "~/lib/exampleRepos";

export function useDiagram(username: string, repo: string) {
  const [diagram, setDiagram] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [lastGenerated, setLastGenerated] = useState<Date | undefined>();
  const [cost, setCost] = useState<string>("");

  const getDiagram = useCallback(async () => {
    setLoading(true);
    setError("");
    setCost("");
    try {
      const cached = await getCachedDiagram(username, repo);

      if (cached) {
        setDiagram(cached);
        const date = await getLastGeneratedDate(username, repo);
        setLastGenerated(date ?? undefined);
      } else {
        const costEstimate = await getCostOfGeneration(username, repo, ""); // empty instructions so lru cache is used

        if (costEstimate.error) {
          console.error("Cost estimation failed:", costEstimate.error);
          setError(costEstimate.error);
        }

        setCost(costEstimate.cost ?? "");

        const result = await generateAndCacheDiagram(username, repo);

        if (result.error) {
          console.error("Diagram generation failed:", result.error);
          setError(result.error);
        } else if (result.diagram) {
          setDiagram(result.diagram);
          const date = await getLastGeneratedDate(username, repo);
          setLastGenerated(date ?? undefined);
        }
      }
    } catch (error) {
      console.error("Error in getDiagram:", error);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [username, repo]);

  useEffect(() => {
    void getDiagram();
  }, [getDiagram]);

  const isExampleRepo = (repoName: string): boolean => {
    return Object.values(exampleRepos).some((value) =>
      value.includes(repoName),
    );
  };

  const handleModify = async (instructions: string) => {
    if (isExampleRepo(repo)) {
      setError("Example repositories cannot be modified.");
      return;
    }

    setLoading(true);
    setError("");
    setCost("");
    setIsRegenerating(false);
    try {
      const result = await modifyAndCacheDiagram(username, repo, instructions);
      if (result.diagram) {
        setDiagram(result.diagram);
        const date = await getLastGeneratedDate(username, repo);
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

  const handleRegenerate = async (instructions: string) => {
    if (isExampleRepo(repo)) {
      setError("Example repositories cannot be regenerated.");
      return;
    }

    setLoading(true);
    setError("");
    setCost("");
    setIsRegenerating(true);
    try {
      const costEstimate = await getCostOfGeneration(username, repo, "");

      if (costEstimate.error) {
        console.error("Cost estimation failed:", costEstimate.error);
        setError(costEstimate.error);
      }

      setCost(costEstimate.cost ?? "");

      const result = await generateAndCacheDiagram(
        username,
        repo,
        instructions,
      );
      if (result.error) {
        console.error("Diagram generation failed:", result.error);
        setError(result.error);
      } else if (result.diagram) {
        setDiagram(result.diagram);
        const date = await getLastGeneratedDate(username, repo);
        setLastGenerated(date ?? undefined);
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

  return {
    diagram,
    error,
    loading,
    lastGenerated,
    cost,
    isRegenerating,
    handleModify,
    handleRegenerate,
    handleCopy,
  };
}
