import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MetricsPanel } from '@/components/MetricsPanel';
import { ThinkingPanel } from '@/components/ThinkingPanel';
import { ToolCallsPanel } from '@/components/ToolCallsPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import { HistoryPanel } from '@/components/HistoryPanel';
import { queryKimiK2 } from '@/lib/api';
import { ThinkingStep, ToolCall, Metrics, StreamEvent } from '@/types';
import { saveChatHistory, ChatHistoryItem } from '@/lib/historyStorage';
import { exportToPDF } from '@/lib/pdfExport';
import { Send, Sparkles, History, RotateCcw, FileDown } from 'lucide-react';

const EXAMPLE_QUERIES = [
  'Research Notion, Obsidian, and Roam Research. Find pricing, create a comparison chart, and generate a PDF report.',
  'Analyze the top 3 AI coding assistants. Research pricing and features, create visualizations, and export a PDF.',
  'Research cloud storage providers. Find pricing tiers, calculate cost per GB, create a chart, and generate a PDF decision matrix.',
];

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [resultContent, setResultContent] = useState('');
  const [metrics, setMetrics] = useState<Metrics>({
    thinkingTokens: 0,
    toolCalls: 0,
    elapsedTime: 0,
    inputTokens: 0,
    outputTokens: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [eventCount, setEventCount] = useState({
    thinking: 0,
    content: 0,
    toolCall: 0,
    metrics: 0,
  });

  const resetState = () => {
    setThinkingSteps([]);
    setToolCalls([]);
    setResultContent('');
    setMetrics({
      thinkingTokens: 0,
      toolCalls: 0,
      elapsedTime: 0,
      inputTokens: 0,
      outputTokens: 0,
    });
    setError(null);
    setEventCount({
      thinking: 0,
      content: 0,
      toolCall: 0,
      metrics: 0,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate query input
    if (!query.trim()) {
      setError('Please enter a query before submitting.');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    resetState();

    const startQuery = query;
    let finalMetrics: Metrics = {
      thinkingTokens: 0,
      toolCalls: 0,
      elapsedTime: 0,
      inputTokens: 0,
      outputTokens: 0,
    };
    let finalResult = '';
    const finalThinkingSteps: ThinkingStep[] = [];
    const finalToolCalls: string[] = [];

    try {
      await queryKimiK2(query, (event: StreamEvent) => {
        console.log('[App.tsx] Event received:', event.type, event);
        switch (event.type) {
          case 'thinking':
            setEventCount(prev => ({ ...prev, thinking: prev.thinking + 1 }));
            console.log('[App.tsx] THINKING event - data:', event.data);
            console.log('[App.tsx] THINKING event - content:', event.data?.content);
            console.log('[App.tsx] THINKING event - tokens:', event.data?.tokens);
            setThinkingSteps((prev) => {
              const timestamp = Date.now();
              const random = Math.random();
              const newStep = {
                id: `thinking-${timestamp}-${random}`,
                content: event.data.content,
                tokens: event.data.tokens,
                timestamp: timestamp,
              };
              console.log('[App.tsx] New thinking step created:', newStep);
              console.log('[App.tsx] Previous steps:', prev.length);
              finalThinkingSteps.push(newStep);
              const updated = [...prev, newStep];
              console.log('[App.tsx] Updated steps array length:', updated.length);
              return updated;
            });
            break;

          case 'tool_call':
            setEventCount(prev => ({ ...prev, toolCall: prev.toolCall + 1 }));
            setToolCalls((prev) => {
              const existing = prev.findIndex((tc) => tc.id === event.data.id);
              if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = event.data;
                return updated;
              }
              if (event.data.status === 'success' && !finalToolCalls.includes(event.data.name)) {
                finalToolCalls.push(event.data.name);
              }
              return [...prev, event.data];
            });
            break;

          case 'content':
            setEventCount(prev => ({ ...prev, content: prev.content + 1 }));
            console.log('[App.tsx] CONTENT event - data:', event.data);
            console.log('[App.tsx] CONTENT event - content:', event.data?.content);
            setResultContent((prev) => {
              finalResult = prev + event.data.content;
              console.log('[App.tsx] Result content updated. Length:', finalResult.length);
              console.log('[App.tsx] Full result so far:', finalResult.substring(0, 200));
              return finalResult;
            });
            break;

          case 'metrics':
            setEventCount(prev => ({ ...prev, metrics: prev.metrics + 1 }));
            console.log('[App.tsx] METRICS event received:', event.data);
            finalMetrics = event.data;
            setMetrics(event.data);
            break;

          case 'error':
            setError(event.data.message);
            break;

          case 'done':
            setIsLoading(false);

            if (finalResult) {
              const timestamp = Date.now();
              const historyItem: ChatHistoryItem = {
                id: `chat-${timestamp}`,
                timestamp: timestamp,
                query: startQuery,
                result: finalResult,
                metrics: finalMetrics,
                thinkingSteps: finalThinkingSteps.length,
                toolCallsExecuted: finalToolCalls,
              };
              saveChatHistory(historyItem);
            }
            break;
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const handleClearAll = () => {
    if (confirm('Clear all current results?')) {
      setQuery('');
      resetState();
    }
  };

  const handleSelectHistory = (item: ChatHistoryItem) => {
    setQuery(item.query);
    setResultContent(item.result);
    setMetrics(item.metrics);
  };

  const handleExportPDF = () => {
    console.log('[PDF Export] Starting export...');
    console.log('[PDF Export] Query:', query);
    console.log('[PDF Export] Result content length:', resultContent?.length);
    console.log('[PDF Export] Thinking steps:', thinkingSteps.length);

    if (!query || !resultContent) {
      const message = 'Please run a query first to generate a report before exporting.';
      console.warn('[PDF Export]', message);
      setError(message);
      return;
    }

    try {
      exportToPDF({
        query,
        thinkingSteps,
        result: resultContent,
        metrics,
      });
      console.log('[PDF Export] Export successful');
      // Clear any previous errors
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export PDF. Please try again.';
      console.error('[PDF Export] Error:', err);
      setError(`PDF Export Error: ${errorMessage}`);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 pt-8 pb-4">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Sparkles className="h-10 w-10 text-purple-400 animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-purple-500/30 animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Kimi K2 Thinking Demo
            </h1>
          </div>
          <p className="text-slate-300 text-lg">
            Watch the AI think, use tools, and generate research reports in real-time
          </p>
        </div>

        {/* Query Input */}
        <Card className="backdrop-blur-xl bg-slate-800/50 border-slate-700 shadow-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your research query..."
                  className="flex-1 min-h-[100px] w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none backdrop-blur-sm"
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map((example, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    disabled={isLoading}
                    className="text-xs border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-slate-100 hover:border-purple-500 transition-all"
                  >
                    Example {index + 1}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30 transition-all"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Query
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={isLoading || !resultContent}
                  className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-slate-100 hover:border-green-500"
                  title="Export results to PDF"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsHistoryOpen(true)}
                  disabled={isLoading}
                  className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-slate-100 hover:border-blue-500"
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={isLoading}
                  className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-slate-100 hover:border-red-500"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-950/50 border border-red-800 rounded-lg text-sm text-red-300 backdrop-blur-sm">
                <strong className="font-semibold">Error:</strong> {error}
              </div>
            )}

            {/* Diagnostic Info - Remove in production */}
            {(eventCount.thinking + eventCount.content + eventCount.toolCall + eventCount.metrics > 0) && (
              <div className="mt-4 p-3 bg-blue-950/30 border border-blue-800/50 rounded-lg text-xs text-blue-300 backdrop-blur-sm">
                <strong className="font-semibold">Debug - Events Received:</strong>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  <div>Thinking: {eventCount.thinking}</div>
                  <div>Content: {eventCount.content}</div>
                  <div>Tool Calls: {eventCount.toolCall}</div>
                  <div>Metrics: {eventCount.metrics}</div>
                </div>
                <div className="mt-2 text-slate-400">
                  Check browser console (F12) for detailed logs
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metrics */}
        <MetricsPanel metrics={metrics} />

        {/* Main Content - Three Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <ThinkingPanel steps={thinkingSteps} isLoading={isLoading} />
          <ToolCallsPanel toolCalls={toolCalls} />
          <ResultsPanel content={resultContent} isLoading={isLoading} />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-400 pb-6">
          <p>
            Powered by{' '}
            <a
              href="https://platform.moonshot.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
            >
              Moonshot AI Kimi K2
            </a>
            {' '}• Web search by{' '}
            <a
              href="https://tavily.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              Tavily
            </a>
          </p>
        </div>
      </div>

      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectHistory={handleSelectHistory}
      />
    </div>
  );
}

export default App;
