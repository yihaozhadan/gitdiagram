import { Key } from "lucide-react";
import { Button } from "./ui/button";

interface ApiKeyButtonProps {
  onClick: () => void;
}

export function ApiKeyButton({ onClick }: ApiKeyButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="border-[3px] border-black dark:border-white bg-purple-400 dark:bg-purple-600 px-4 py-2 text-black dark:text-white shadow-[4px_4px_0_0_#000000] dark:shadow-[4px_4px_0_0_#ffffff] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-purple-400 dark:hover:bg-purple-600"
    >
      <Key className="mr-2 h-5 w-5" />
      Use Your API Key
    </Button>
  );
}
