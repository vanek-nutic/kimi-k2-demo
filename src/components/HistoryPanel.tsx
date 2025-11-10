import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2, Download, X, Clock, FileText, Zap } from 'lucide-react';
import { 
  getChatHistory, 
  clearChatHistory, 
  deleteChatHistoryItem, 
  exportChatHistory,
  ChatHistoryItem 
} from '@/lib/historyStorage';
import { formatTime } from '@/lib/utils';

interface HistoryPanelProps {
  onSelectHistory: (item: ChatHistoryItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryPanel({ onSelectHistory, isOpen, onClose }: HistoryPanelProps) {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getChatHistory());
    }
  }, [isOpen]);

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      clearChatHistory();
      setHistory([]);
    }
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChatHistoryItem(id);
    setHistory(getChatHistory());
  };

  const handleExport = () => {
    exportChatHistory();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-blue-500" />
              Chat History
              <span className="text-sm text-muted-foreground font-normal">
                ({history.length} {history.length === 1 ? 'conversation' : 'conversations'})
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExport}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No chat history yet</p>
              <p className="text-xs mt-1">Your conversations will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    onSelectHistory(item);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2">
                        {item.query}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 ml-2"
                      onClick={(e) => handleDeleteItem(item.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>{item.thinkingSteps || 0} thinking steps</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{item.toolCallsExecuted?.length || 0} tools used</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(item.metrics.elapsedTime)}</span>
                    </div>
                  </div>

                  {item.result && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {item.result.substring(0, 150)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
