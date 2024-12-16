"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GHForm from "~/components/gh-form";
import MermaidChart from "~/components/mermaid-diagram";

interface DiagramResponse {
  response: {
    text: string;
    type: string;
  }[];
}

export default function Repo() {
  const params = useParams<{ username: string; repo: string }>();
  const [diagram, setDiagram] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchDiagram() {
      setLoading(true);
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_DEV_URL ?? "https://api.gitdiagram.com";
        const response = await fetch(
          `${baseUrl}/analyze?username=${params.username}&repo=${params.repo}`,
        );
        const data = (await response.json()) as DiagramResponse;
        const diagramText = data.response[0]?.text ?? "";
        setDiagram(diagramText);
      } catch (error) {
        console.error("Error fetching diagram:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchDiagram();
  }, [params.username, params.repo]);

  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="flex w-full justify-center pt-8">
        <GHForm
          showExamples={false}
          username={params.username}
          repo={params.repo}
        />
      </div>
      <div className="flex w-full justify-center pt-8">
        {loading ? <p>Loading diagram...</p> : <MermaidChart chart={diagram} />}
      </div>
    </div>
  );
}
