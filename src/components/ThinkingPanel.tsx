import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThinkingStep } from '@/types';
import { Brain } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';

interface ThinkingPanelProps {
  steps: ThinkingStep[];
  isLoading?: boolean;
}

export function ThinkingPanel({ steps, isLoading = false }: ThinkingPanelProps) {
  console.log('[ThinkingPanel] Rendered with steps:', steps.length, 'isLoading:', isLoading);
  console.log('[ThinkingPanel] Steps data:', steps);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [dots, setDots] = useState('');

  useEffect(() => {
    console.log('[ThinkingPanel] Steps changed, length:', steps.length);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  // Animated dots for loading state
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <Card className="flex flex-col h-full backdrop-blur-xl bg-slate-800/40 border-slate-700 shadow-xl">
      <CardHeader className="pb-3 border-b border-slate-700/50">
        <CardTitle className="flex items-center gap-2 text-base text-slate-100">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Thinking Process
          {steps.length > 0 && (
            <span className="ml-auto text-xs font-normal text-slate-400">
              {steps.length} step{steps.length !== 1 ? 's' : ''}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-3">
            {steps.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                {isLoading ? (
                  <div className="text-center space-y-3">
                    <Brain className="h-8 w-8 text-purple-400 mx-auto animate-pulse" />
                    <p className="text-sm font-medium">Thinking{dots}</p>
                    <p className="text-xs text-slate-500">
                      Processing your request and analyzing data
                    </p>
                    <p className="text-xs text-slate-600 mt-4">
                      Note: Thinking steps only appear for complex reasoning tasks
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-sm">No thinking steps recorded</p>
                    <p className="text-xs text-slate-500">
                      Simple queries may not include extended reasoning
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 space-y-2 hover:bg-slate-900/70 transition-colors animate-in slide-in-from-bottom-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-400">
                        Step {index + 1}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
                        {step.tokens} tokens
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {step.content}
                    </p>
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-3 space-y-2 animate-pulse">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-400 animate-pulse" />
                      <span className="text-xs font-semibold text-purple-400">
                        Thinking{dots}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
