import { Card, CardContent } from '@/components/ui/card';
import { Metrics } from '@/types';
import { formatNumber, formatTime } from '@/lib/utils';
import { Brain, Wrench, Clock, ArrowDown, ArrowUp } from 'lucide-react';

interface MetricsPanelProps {
  metrics: Metrics;
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  const metricItems = [
    {
      icon: Brain,
      label: 'Thinking Tokens',
      value: formatNumber(metrics.thinkingTokens),
      color: 'purple',
      bgGradient: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      icon: Wrench,
      label: 'Tool Calls',
      value: metrics.toolCalls,
      color: 'blue',
      bgGradient: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      icon: Clock,
      label: 'Elapsed Time',
      value: formatTime(metrics.elapsedTime),
      color: 'green',
      bgGradient: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
    },
    {
      icon: ArrowDown,
      label: 'Input Tokens',
      value: formatNumber(metrics.inputTokens),
      color: 'orange',
      bgGradient: 'from-orange-500/20 to-orange-600/20',
      borderColor: 'border-orange-500/30',
      iconColor: 'text-orange-400',
    },
    {
      icon: ArrowUp,
      label: 'Output Tokens',
      value: formatNumber(metrics.outputTokens),
      color: 'pink',
      bgGradient: 'from-pink-500/20 to-pink-600/20',
      borderColor: 'border-pink-500/30',
      iconColor: 'text-pink-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {metricItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card
            key={index}
            className={`backdrop-blur-xl bg-gradient-to-br ${item.bgGradient} border ${item.borderColor} shadow-lg hover:shadow-xl transition-all`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900/50">
                  <Icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-400 font-medium">
                    {item.label}
                  </div>
                  <div className="text-2xl font-bold text-slate-100 truncate">
                    {item.value}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
