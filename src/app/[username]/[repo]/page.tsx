"use client";

import { useParams } from "next/navigation";
import MermaidChart from "~/components/mermaid-diagram";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

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
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container my-8">
          <div className="rounded-lg border bg-card p-8 shadow-sm">
            <div className="mb-6 flex items-center space-x-2">
              <Input
                value={`https://github.com/${params.username}/${params.repo}`}
                readOnly
                className="font-mono"
              />
              <Button>Ingest</Button>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <MermaidChart chart={diagram} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
