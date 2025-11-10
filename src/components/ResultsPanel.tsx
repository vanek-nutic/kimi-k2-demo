import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useEffect, useRef } from 'react';

interface ResultsPanelProps {
  content: string;
  isLoading?: boolean;
}

export function ResultsPanel({ content, isLoading = false }: ResultsPanelProps) {
  console.log('[ResultsPanel] Rendered with content length:', content?.length || 0, 'isLoading:', isLoading);
  console.log('[ResultsPanel] Content preview:', content?.substring(0, 100));

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    console.log('[ResultsPanel] Content changed, length:', content?.length || 0);
    if (scrollRef.current && content) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content]);
  return (
    <Card className="flex flex-col h-full backdrop-blur-xl bg-slate-800/40 border-slate-700 shadow-xl">
      <CardHeader className="pb-3 border-b border-slate-700/50">
        <CardTitle className="flex items-center gap-2 text-base text-slate-100">
          <FileText className="h-5 w-5 text-blue-400" />
          Results
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-4" ref={scrollRef}>
          <div className="prose prose-sm prose-invert max-w-none">
            {content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ node, ...props }) => (
                    <p className="mb-4 text-slate-300 leading-relaxed" {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-2xl font-bold mt-6 mb-4 text-slate-100 border-b border-slate-700 pb-2"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-xl font-bold mt-5 mb-3 text-slate-100"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-lg font-semibold mt-4 mb-2 text-slate-200"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside mb-4 space-y-1 text-slate-300" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside mb-4 space-y-1 text-slate-300" {...props} />
                  ),
                  li: ({ node, ...props }) => <li className="mb-1.5 text-slate-300" {...props} />,
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto mb-4 rounded-lg border border-slate-700">
                      <table className="min-w-full divide-y divide-slate-700" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-slate-800/50" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider"
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-4 py-3 text-sm text-slate-300 border-t border-slate-700" {...props} />
                  ),
                  code: ({ node, inline, ...props }: any) =>
                    inline ? (
                      <code
                        className="bg-slate-900/50 border border-slate-700 px-1.5 py-0.5 rounded text-sm text-purple-300 font-mono"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-slate-900/50 border border-slate-700 p-3 rounded text-sm overflow-x-auto text-slate-300 font-mono"
                        {...props}
                      />
                    ),
                  pre: ({ node, ...props }) => (
                    <pre
                      className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg mb-4 overflow-x-auto"
                      {...props}
                    />
                  ),
                  a: ({ node, ...props }) => (
                    <a
                      className="text-blue-400 hover:text-blue-300 underline transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-slate-900/30 rounded-r text-slate-300 italic"
                      {...props}
                    />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-slate-100" {...props} />
                  ),
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                {isLoading ? (
                  <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 text-blue-400 mx-auto animate-spin" />
                    <p className="text-sm font-medium">Generating results...</p>
                    <p className="text-xs text-slate-500">
                      The AI is processing your query
                    </p>
                  </div>
                ) : (
                  <p className="text-sm">Waiting for results...</p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
