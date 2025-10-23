"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ModelConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: ModelConfig) => void;
}

export interface ModelConfig {
  provider: string;
  model: string;
  apiKey: string;
}

const PROVIDERS = {
  openrouter: {
    name: "OpenRouter",
    defaultModel: "openai/gpt-oss-20b:free",
  },
  openai: {
    name: "OpenAI",
    defaultModel: "gpt-4",
  },
  groq: {
    name: "Groq",
    defaultModel: "mixtral-8x7b-32768",
  },
  ollama: {
    name: "Ollama",
    defaultModel: "mistral",
  },
};

export function ModelConfigDialog({
  isOpen,
  onClose,
  onSubmit,
}: ModelConfigDialogProps) {
  const [config, setConfig] = useState<ModelConfig>({
    provider: "openrouter",
    model: PROVIDERS.openrouter.defaultModel,
    apiKey: "",
  });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem("model_config");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig) as ModelConfig);
    }
    
    // Check for dark mode
    const checkDarkMode = () => {
      if (typeof document !== 'undefined') {
        setIsDark(document.documentElement.classList.contains('dark'));
      }
    };
    
    // Initial check
    checkDarkMode();
    
    // Watch for theme changes
    if (typeof document !== 'undefined') {
      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
      
      return () => observer.disconnect();
    }
  }, []);

  const handleProviderChange = (provider: keyof typeof PROVIDERS) => {
    setConfig((prev) => ({
      ...prev,
      provider,
      model: PROVIDERS[provider].defaultModel,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("model_config", JSON.stringify(config));
    onSubmit(config);
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem("model_config");
    setConfig({
      provider: "openrouter",
      model: PROVIDERS.openrouter.defaultModel,
      apiKey: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Change the background color of the dialog based on the mode */}
      <DialogContent className={`border-[3px] border-black p-6 shadow-[8px_8px_0_0_#000000] sm:max-w-md ${isDark ? 'bg-purple-600' : 'bg-purple-200'}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            AI Model Configuration
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>
            Configure the AI model provider and settings. Your configuration will be
            stored locally in your browser.
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>Provider</label>
            <Select
              value={config.provider}
              onValueChange={handleProviderChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROVIDERS).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>Model</label>
            <Input
              type="text"
              placeholder={`e.g., ${PROVIDERS[config.provider as keyof typeof PROVIDERS].defaultModel}`}
              value={config.model}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, model: e.target.value }))
              }
              className="border-2 border-black bg-white"
            />
            <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Enter any OpenRouter-supported model ID. Leave empty to use default.
            </p>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>API Key</label>
            <Input
              type="password"
              placeholder="Enter API key"
              value={config.apiKey}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, apiKey: e.target.value }))
              }
              className="border-2 border-black bg-white"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={handleClear}
              className="border-2 border-black bg-white text-black hover:bg-gray-100"
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="border-2 border-black bg-purple-500 text-white hover:bg-purple-600"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
