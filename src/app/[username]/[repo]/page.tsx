import MermaidChart from "~/components/mermaid-diagram";

interface PageProps {
  params: { username: string; repo: string };
}

export default function Repo({ params }: PageProps) {
  const diagram = `
    graph TD;
      A[Root Directory] --> B[Frontend];
      A --> C[Backend];
      B --> D[Components];
      B --> E[Utils];
      C --> F[API];
      click B "https://github.com/your-repo/frontend" "Go to Frontend Directory"
      click C "https://github.com/your-repo/backend" "Go to Backend Directory"
      click D "https://github.com/your-repo/frontend/components" "Go to Components Directory"
      click F "https://github.com/your-repo/backend/api" "Go to API Directory"
  `;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-md dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Repository Details
        </h1>
        <div className="mt-4 space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            Username: <span className="font-semibold">{params.username}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Repository: <span className="font-semibold">{params.repo}</span>
          </p>
        </div>
      </div>
      hello
      <MermaidChart chart={diagram} />
    </div>
  );
}
