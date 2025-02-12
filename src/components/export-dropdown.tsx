import { useState } from "react";
import { CopyButton } from "./copy-button";
import { Image, ChevronDown, ChevronUp } from "lucide-react";
import { ActionButton } from "./action-button";

interface ExportDropdownProps {
  onCopy: () => void;
  lastGenerated: Date;
  onExportImage: () => void;
}

export function ExportDropdown({
  onCopy,
  lastGenerated,
  onExportImage,
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-4 w-full">
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between rounded-md border-[3px] border-black bg-purple-300 px-4 py-2 font-medium text-black transition-colors hover:bg-purple-400"
      >
        <span>Export Diagram</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <div className="relative">
        <div
          className={`transition-all duration-200 ${
            isOpen
              ? "pointer-events-auto mt-4 max-h-[500px] opacity-100"
              : "pointer-events-none max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-4">
            <div className="flex flex-row gap-3 sm:gap-4">
              <ActionButton
                onClick={onExportImage}
                icon={Image}
                tooltipText="Download diagram as PNG"
                text="Download PNG"
              />
              <CopyButton onClick={onCopy} />
            </div>

            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Last generated: {lastGenerated.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
