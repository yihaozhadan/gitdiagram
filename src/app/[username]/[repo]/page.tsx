"use client";

import { useParams } from "next/navigation";
import GHForm from "~/components/gh-form";
import MermaidChart from "~/components/mermaid-diagram";

export default function Repo() {
  const params = useParams<{ username: string; repo: string }>();

  const diagram = `
    graph TD;
      A[Root Directory] --> B[Frontend];
      A --> C[Backend];
      B --> D[Components];
      B --> E[Utils];
      C --> F[API];
      click B "https://github.com/${params.username}/${params.repo}/frontend" "Go to Frontend Directory"
      click C "https://github.com/${params.username}/${params.repo}/backend" "Go to Backend Directory"
      click D "https://github.com/${params.username}/${params.repo}/frontend/components" "Go to Components Directory"
      click F "https://github.com/${params.username}/${params.repo}/backend/api" "Go to API Directory"
  `;

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
        <MermaidChart chart={diagram} />
      </div>
    </div>
  );
}
