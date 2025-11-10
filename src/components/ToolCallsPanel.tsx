import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToolCall } from '@/types';
import { Wrench, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ToolCallsPanelProps {
  toolCalls: ToolCall[];
}

export function ToolCallsPanel({ toolCalls }: ToolCallsPanelProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />;
    }
  };

  return (
    <Card className="flex flex-col h-full backdrop-blur-xl bg-slate-800/40 border-slate-700 shadow-xl">
      <CardHeader className="pb-3 border-b border-slate-700/50">
        <CardTitle className="flex items-center gap-2 text-base text-slate-100">
          <Wrench className="h-5 w-5 text-blue-400" />
          Tool Calls
          {toolCalls.length > 0 && (
            <span className="ml-auto text-xs font-normal text-slate-400">
              {toolCalls.length} call{toolCalls.length !== 1 ? 's' : ''}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-3">
            {toolCalls.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p className="text-sm">Waiting for tool calls...</p>
              </div>
            ) : (
              toolCalls.map((toolCall) => {
                const inputData = (toolCall as any).input || toolCall.arguments;
                return (
                  <div
                    key={toolCall.id}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 space-y-2 hover:bg-slate-900/70 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getStatusIcon(toolCall.status)}
                        <span className="text-sm font-semibold truncate text-slate-100">
                          {toolCall.name}
                        </span>
                      </div>
                      <span
                        className={
                          'text-xs px-2.5 py-1 rounded-full font-medium ' +
                          (toolCall.status === 'success'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : toolCall.status === 'error'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30')
                        }
                      >
                        {toolCall.status}
                      </span>
                    </div>
                    {inputData && (
                      <div className="text-xs bg-slate-950/50 border border-slate-700/30 rounded p-2.5 overflow-auto max-h-24">
                        <pre className="text-slate-400 whitespace-pre-wrap break-words font-mono">
                          {typeof inputData === 'string'
                            ? inputData
                            : JSON.stringify(inputData, null, 2)}
                        </pre>
                      </div>
                    )}
                    {toolCall.error && (
                      <div className="text-xs bg-red-950/30 border border-red-800/50 rounded p-2 text-red-300">
                        <strong>Error:</strong> {toolCall.error}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
