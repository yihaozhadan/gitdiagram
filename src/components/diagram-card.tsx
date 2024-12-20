import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { CopyButton } from "./copy-button";
import { Wand2, RefreshCw } from "lucide-react";
import { ActionButton } from "./action-button";

interface DiagramCardProps {
  onModify: (instructions: string) => void;
  onRegenerate: (instructions: string) => void;
  onCopy: () => void;
  lastGenerated: Date;
}

export default function DiagramCard({
  onModify,
  onRegenerate,
  onCopy,
  lastGenerated,
}: DiagramCardProps) {
  const [instructions, setInstructions] = useState("");

  return (
    <Card className="relative w-full max-w-3xl border-[3px] border-black bg-purple-200 p-4 shadow-[8px_8px_0_0_#000000] sm:p-8">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Input
            placeholder="Custom instructions (optional)"
            className="flex-1 rounded-md border-[3px] border-black px-3 py-4 text-base font-bold shadow-[4px_4px_0_0_#000000] placeholder:text-base placeholder:font-normal placeholder:text-gray-700 sm:px-4 sm:py-6 sm:text-lg sm:placeholder:text-lg"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />

          <ActionButton
            onClick={() => onModify(instructions)}
            icon={Wand2}
            tooltipText="Modify existing diagram"
          />

          <ActionButton
            onClick={() => onRegenerate(instructions)}
            icon={RefreshCw}
            tooltipText="Recreate with/without custom instructions"
          />

          <CopyButton onClick={onCopy} />
        </div>

        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Last generated: {lastGenerated.toLocaleString()}
          </span>
        </div>
      </div>
    </Card>
  );
}
