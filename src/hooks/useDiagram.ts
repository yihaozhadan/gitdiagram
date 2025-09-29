import { useState, useEffect, useCallback } from "react";
import {
  cacheDiagramAndExplanation,
  getCachedDiagram,
} from "~/app/_actions/cache";
import { getLastGeneratedDate } from "~/app/_actions/repo";
import { getLatestCommitDate } from "~/app/_actions/github";

interface StreamState {
  status:
    | "idle"
    | "started"
    | "explanation_sent"
    | "explanation"
    | "explanation_chunk"
    | "mapping_sent"
    | "mapping"
    | "mapping_chunk"
    | "diagram_sent"
    | "diagram"
    | "diagram_chunk"
    | "complete"
    | "error";
  message?: string;
  explanation?: string;
  mapping?: string;
  diagram?: string;
  error?: string;
}

interface StreamResponse {
  status: StreamState["status"];
  message?: string;
  chunk?: string;
  explanation?: string;
  mapping?: string;
  diagram?: string;
  error?: string;
}

export function useDiagram(username: string, repo: string) {
  const [diagram, setDiagram] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [lastGenerated, setLastGenerated] = useState<Date | undefined>();
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  // const [tokenCount, setTokenCount] = useState<number>(0);
  const [state, setState] = useState<StreamState>({ status: "idle" });
  const [hasUsedFreeGeneration, setHasUsedFreeGeneration] = useState<boolean>(
    () => {
      if (typeof window === "undefined") return false;
      return localStorage.getItem("has_used_free_generation") === "true";
    },
  );

  const generateDiagram = useCallback(
    async (instructions = "", githubPat?: string) => {
      setState({
        status: "started",
        message: "Starting generation process...",
      });

      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_DEV_URL ?? "http://localhost:3000";

        const response = await fetch(`${baseUrl}/generate/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            repo,
            instructions,
            api_key: localStorage.getItem("api_key") ?? undefined,
            github_pat: githubPat,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to start streaming");
        }
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No reader available");
        }

        let explanation = "";
        let mapping = "";
        let diagram = "";
        let buffer = ""; // Buffer to accumulate incomplete data

        // Process the stream
        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Convert the chunk to text and add to buffer
              const chunk = new TextDecoder().decode(value);
              buffer += chunk;

              // Process complete lines from the buffer
              const lines = buffer.split('\n');
              
              // Keep the last potentially incomplete line in the buffer
              buffer = lines.pop() ?? '';

              // Process each complete line
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const jsonStr = line.slice(6).trim();
                  
                  // Skip empty data lines
                  if (!jsonStr) continue;
                  
                  try {
                    const data = JSON.parse(jsonStr) as StreamResponse;

                    // If we receive an error, preserve any existing diagram text
                    if (data.error) {
                      setState((prev) => ({
                        status: "error",
                        error: data.error,
                        diagram: data.diagram ?? prev.diagram, // Keep existing diagram if available
                        explanation: prev.explanation,
                        mapping: prev.mapping
                      }));
                      setLoading(false);
                      return;
                    }

                    // Update state based on the message type
                    switch (data.status) {
                      case "started":
                        setState((prev) => ({
                          ...prev,
                          status: "started",
                          message: data.message,
                        }));
                        break;
                      case "explanation_sent":
                        setState((prev) => ({
                          ...prev,
                          status: "explanation_sent",
                          message: data.message,
                        }));
                        break;
                      case "explanation":
                        setState((prev) => ({
                          ...prev,
                          status: "explanation",
                          message: data.message,
                        }));
                        break;
                      case "explanation_chunk":
                        if (data.chunk) {
                          explanation += data.chunk;
                          setState((prev) => ({ ...prev, explanation }));
                        }
                        break;
                      case "mapping_sent":
                        setState((prev) => ({
                          ...prev,
                          status: "mapping_sent",
                          message: data.message,
                        }));
                        break;
                      case "mapping":
                        setState((prev) => ({
                          ...prev,
                          status: "mapping",
                          message: data.message,
                        }));
                        break;
                      case "mapping_chunk":
                        if (data.chunk) {
                          mapping += data.chunk;
                          setState((prev) => ({ ...prev, mapping }));
                        }
                        break;
                      case "diagram_sent":
                        setState((prev) => ({
                          ...prev,
                          status: "diagram_sent",
                          message: data.message,
                        }));
                        break;
                      case "diagram":
                        setState((prev) => ({
                          ...prev,
                          status: "diagram",
                          message: data.message,
                        }));
                        break;
                      case "diagram_chunk":
                        if (data.chunk) {
                          diagram += data.chunk;
                          setState((prev) => ({ ...prev, diagram }));
                        }
                        break;
                      case "complete":
                        console.log(`[Stream Debug] Complete status received`);
                        console.log(`[Stream Debug] data.diagram length:`, data.diagram?.length ?? 0);
                        console.log(`[Stream Debug] data.explanation length:`, data.explanation?.length ?? 0);
                        console.log(`[Stream Debug] accumulated diagram length:`, diagram.length);
                        console.log(`[Stream Debug] accumulated explanation length:`, explanation.length);
                        
                        // Use accumulated data if server data is empty
                        const finalDiagram = data.diagram ?? diagram;
                        const finalExplanation = data.explanation ?? explanation;
                        
                        console.log(`[Stream Debug] final diagram length:`, finalDiagram.length);
                        console.log(`[Stream Debug] final explanation length:`, finalExplanation.length);
                        
                        setState({
                          status: "complete",
                          explanation: finalExplanation,
                          diagram: finalDiagram,
                        });
                        const date = await getLastGeneratedDate(username, repo);
                        setLastGenerated(date ?? undefined);
                        if (!hasUsedFreeGeneration) {
                          localStorage?.setItem(
                            "has_used_free_generation",
                            "true",
                          );
                          setHasUsedFreeGeneration(true);
                        }
                        break;
                      case "error":
                        setState({ status: "error", error: data.error });
                        break;
                    }
                  } catch (parseError) {
                    // If there's a JSON parse error, log it and try to extract useful data
                    console.error("Error parsing SSE message:", parseError);
                    console.error("Raw SSE line (first 200 chars):", jsonStr.substring(0, 200));
                    
                    // Try to handle the case where the JSON might be malformed
                    // but still contains useful data (especially for complete status)
                    if (jsonStr.includes('"status":"complete"') && jsonStr.includes('"diagram"')) {
                      // Try to extract diagram from malformed JSON using regex
                      try {
                        // Look for the diagram field in the JSON string
                        const diagramRegex = /"diagram":\s*"((?:[^"\\]|\\.)*)"/;
                        const diagramMatch = diagramRegex.exec(jsonStr);
                        if (diagramMatch?.[1]) {
                          const extractedDiagram = diagramMatch[1]
                            .replace(/\\n/g, '\n')
                            .replace(/\\"/g, '"')
                            .replace(/\\\\/g, '\\')
                            .replace(/\\t/g, '\t')
                            .replace(/\\r/g, '\r');
                          
                          // Also try to extract explanation if available
                          const explanationRegex = /"explanation":\s*"((?:[^"\\]|\\.)*)"/;
                          const explanationMatch = explanationRegex.exec(jsonStr);
                          const extractedExplanation = explanationMatch?.[1]
                            ?.replace(/\\n/g, '\n')
                            ?.replace(/\\"/g, '"')
                            ?.replace(/\\\\/g, '\\') ?? "Diagram generated successfully";
                          
                          console.log(`[Stream Debug] Extracted diagram from malformed JSON, length: ${extractedDiagram.length}`);
                          
                          setState({
                            status: "complete",
                            diagram: extractedDiagram,
                            explanation: extractedExplanation,
                          });
                          
                          const date = await getLastGeneratedDate(username, repo);
                          setLastGenerated(date ?? undefined);
                          if (!hasUsedFreeGeneration) {
                            localStorage?.setItem("has_used_free_generation", "true");
                            setHasUsedFreeGeneration(true);
                          }
                          return; // Exit the processing loop since we got the complete data
                        }
                      } catch (extractError) {
                        console.error("Failed to extract diagram from malformed JSON:", extractError);
                      }
                    }
                  }
                }
              }
            }
            
            // Process any remaining data in the buffer
            if (buffer.trim()) {
              const lines = buffer.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const jsonStr = line.slice(6).trim();
                  if (!jsonStr) continue;
                  
                  try {
                    const data = JSON.parse(jsonStr) as StreamResponse;
                    
                    if (data.status === "complete") {
                      console.log(`[Stream Debug] Final buffer complete status`);
                      console.log(`[Stream Debug] Final buffer data.diagram length:`, data.diagram?.length ?? 0);
                      console.log(`[Stream Debug] Final buffer accumulated diagram length:`, diagram.length);
                      
                      // Use accumulated data if server data is empty
                      const finalDiagram = data.diagram ?? diagram;
                      const finalExplanation = data.explanation ?? explanation;
                      
                      setState({
                        status: "complete",
                        explanation: finalExplanation,
                        diagram: finalDiagram,
                      });
                      const date = await getLastGeneratedDate(username, repo);
                      setLastGenerated(date ?? undefined);
                      if (!hasUsedFreeGeneration) {
                        localStorage?.setItem("has_used_free_generation", "true");
                        setHasUsedFreeGeneration(true);
                      }
                    }
                  } catch (parseError) {
                    console.error("Error parsing final buffer:", parseError);
                    // Try regex extraction for final buffer too
                    if (jsonStr.includes('"status":"complete"') && jsonStr.includes('"diagram"')) {
                      try {
                        const diagramRegex = /"diagram":\s*"((?:[^"\\]|\\.)*)"/;
                        const diagramMatch = diagramRegex.exec(jsonStr);
                        if (diagramMatch?.[1]) {
                          const extractedDiagram = diagramMatch[1]
                            .replace(/\\n/g, '\n')
                            .replace(/\\"/g, '"')
                            .replace(/\\\\/g, '\\');
                          
                          setState({
                            status: "complete",
                            diagram: extractedDiagram,
                            explanation: "Diagram generated successfully",
                          });
                          
                          const date = await getLastGeneratedDate(username, repo);
                          setLastGenerated(date ?? undefined);
                          if (!hasUsedFreeGeneration) {
                            localStorage?.setItem("has_used_free_generation", "true");
                            setHasUsedFreeGeneration(true);
                          }
                        }
                      } catch (extractError) {
                        console.error("Failed to extract from final buffer:", extractError);
                      }
                    }
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        };

        await processStream();
      } catch (error) {
        setState((prev) => ({
          status: "error",
          error: error instanceof Error ? error.message : "An unknown error occurred",
          diagram: prev.diagram, // Keep existing diagram
          explanation: prev.explanation,
          mapping: prev.mapping
        }));
        setLoading(false);
      }
    },
    [username, repo, hasUsedFreeGeneration],
  );

  useEffect(() => {
    if (state.status === "complete" && state.diagram) {
      console.log(`[useDiagram] Caching completed diagram (${state.diagram.length} chars)`);
      
      // Cache the completed diagram with the usedOwnKey flag
      const hasApiKey = !!localStorage.getItem("api_key");
      
      cacheDiagramAndExplanation(
        username,
        repo,
        state.diagram,
        state.explanation ?? "No explanation provided",
        hasApiKey,
      ).then(() => {
        console.log(`[useDiagram] Cache operation completed successfully`);
      }).catch((error) => {
        console.error(`[useDiagram] Cache operation failed:`, error);
      });
      
      setDiagram(state.diagram);
      setLoading(false); // Set loading to false when diagram generation is complete
      void getLastGeneratedDate(username, repo).then((date) =>
        setLastGenerated(date ?? undefined),
      );
    } else if (state.status === "error") {
      setLoading(false);
    }
  }, [state.status, state.diagram, username, repo, state.explanation]);

  const getDiagram = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Check cache first and compare with latest commit date
      const cached = await getCachedDiagram(username, repo);
      const lastGenerated = await getLastGeneratedDate(username, repo);
      const github_pat = localStorage.getItem("github_pat");
      const latestCommitDate = await getLatestCommitDate(username, repo);

      // Debug logging
      console.debug('[Cache Debug] Latest commit date:', latestCommitDate?.toISOString());
      console.debug('[Cache Debug] Last generated date:', lastGenerated?.toISOString());
      console.debug('[Cache Debug] Cache exists:', !!cached);

      if (cached && lastGenerated && latestCommitDate) {
        // Check if cache is newer than or within 24 hours of the latest commit
        const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        // Ensure we're working with Date objects
        const commitDate = new Date(latestCommitDate);
        const cacheDate = new Date(lastGenerated);
        const cacheAge = cacheDate.getTime() - commitDate.getTime();
        
        console.debug('[Cache Debug] Commit date:', commitDate.toISOString());
        console.debug('[Cache Debug] Cache date:', cacheDate.toISOString());
        console.debug('[Cache Debug] Cache age (ms):', cacheAge);
        console.debug('[Cache Debug] Cache age (hours):', cacheAge / (60 * 60 * 1000));
        console.debug('[Cache Debug] Is cache valid?', cacheAge >= -ONE_DAY);
        
        // Use cache if it's newer than commit or less than 24 hours older than commit
        if (cacheAge >= -ONE_DAY) {
          console.debug('[Cache Debug] Using cached diagram (within 24h of commit)');
          setDiagram(cached);
          setLastGenerated(cacheDate);
          setLoading(false);
          return;
        }
        console.debug('[Cache Debug] Cache too old, regenerating diagram');
        // Cache is too old (more than 24 hours older than latest commit)
      } else {
        console.debug('[Cache Debug] Missing required data for cache validation');
        if (!cached) console.debug('[Cache Debug] No cached diagram found');
        if (!lastGenerated) console.debug('[Cache Debug] No last generated date found');
        if (!latestCommitDate) console.debug('[Cache Debug] No latest commit date found');
      }

      // Start streaming generation
      await generateDiagram("", github_pat ?? undefined);

      // Note: The diagram and lastGenerated will be set by the generateDiagram function
      // through the state updates
    } catch (error) {
      console.error("Error in getDiagram:", error);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [username, repo, generateDiagram]);

  useEffect(() => {
    void getDiagram();
  }, [getDiagram]);

  const handleModify = async (instructions: string) => {
    setLoading(true);
    setError("");
    try {
      // Start streaming generation with instructions
      await generateDiagram(instructions);
    } catch (error) {
      console.error("Error modifying diagram:", error);
      setError("Failed to modify diagram. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (instructions: string) => {
    setLoading(true);
    setError("");
    try {
      const github_pat = localStorage.getItem("github_pat");

      // Start streaming generation with instructions
      await generateDiagram(instructions, github_pat ?? undefined);
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

  const handleExportImage = () => {
    const svgElement = document.querySelector(".mermaid svg");
    if (!(svgElement instanceof SVGSVGElement)) return;

    try {
      const canvas = document.createElement("canvas");
      const scale = 4;

      const bbox = svgElement.getBBox();
      const transform = svgElement.getScreenCTM();
      if (!transform) return;

      const width = Math.ceil(bbox.width * transform.a);
      const height = Math.ceil(bbox.height * transform.d);
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();

      img.onload = () => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);

        const a = document.createElement("a");
        a.download = "diagram.png";
        a.href = canvas.toDataURL("image/png", 1.0);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error("Error generating PNG:", error);
    }
  };

  const handleApiKeySubmit = async (apiKey: string) => {
    setShowApiKeyDialog(false);
    setLoading(true);
    setError("");

    // Store the key first
    localStorage.setItem("api_key", apiKey);

    // Then generate diagram using stored key
    const github_pat = localStorage.getItem("github_pat");
    try {
      await generateDiagram("", github_pat ?? undefined);
    } catch (error) {
      console.error("Error generating with API key:", error);
      setError("Failed to generate diagram with provided API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseApiKeyDialog = () => {
    setShowApiKeyDialog(false);
  };

  const handleApiKeyDialog = () => {
    setShowApiKeyDialog(true);
  };

  return {
    diagram,
    error,
    loading,
    lastGenerated,
    handleModify,
    handleRegenerate,
    handleCopy,
    showApiKeyDialog,
    // tokenCount,
    handleApiKeySubmit,
    handleCloseApiKeyDialog,
    handleApiKeyDialog,
    handleExportImage,
    state,
  };
}
