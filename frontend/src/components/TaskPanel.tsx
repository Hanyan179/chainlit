import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface Task {
  name: string;
  platform: string;
  status: string;
  elapsed_s: number;
  progress_text?: string;
}

const STATUS_MAP: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  running: { icon: '⏳', label: '运行中', color: 'text-blue-400' },
  completed: { icon: '✅', label: '已完成', color: 'text-green-400' },
  failed: { icon: '❌', label: '失败', color: 'text-red-400' },
  timeout: { icon: '⏰', label: '超时', color: 'text-yellow-400' },
  pending: { icon: '🔄', label: '等待中', color: 'text-muted-foreground' }
};

export default function TaskPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stopping, setStopping] = useState<string | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const resp = await fetch('/api/tasks');
        const data = await resp.json();
        setTasks(data.tasks || []);
      } catch {
        /* silent */
      }
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, []);

  const handleStop = async (platform: string) => {
    setStopping(platform);
    try {
      await fetch(`/api/tasks/${platform}/stop`, { method: 'POST' });
    } catch {
      /* silent */
    }
    setStopping(null);
  };

  if (!tasks.length) return null;

  const hasRunning = tasks.some(
    (t) => t.status === 'running' || t.status === 'pending'
  );

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="text-xs font-semibold text-muted-foreground">
          📋 任务
        </span>
        {hasRunning && (
          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
            进行中
          </span>
        )}
      </div>
      <div className="px-3 pb-3 space-y-2">
        {tasks.map((t, i) => {
          const s = STATUS_MAP[t.status] || STATUS_MAP.pending;
          const elapsed =
            t.elapsed_s >= 60
              ? `${Math.floor(t.elapsed_s / 60)}分${t.elapsed_s % 60}秒`
              : `${t.elapsed_s}秒`;
          const isRunning = t.status === 'running' || t.status === 'pending';
          const barWidth = isRunning
            ? `${Math.min(90, 20 + t.elapsed_s)}%`
            : t.status === 'completed'
            ? '100%'
            : '100%';

          return (
            <div key={i} className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{s.icon}</span>
                <span className="text-xs font-medium flex-1 truncate">
                  {t.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {elapsed}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-[11px] font-medium', s.color)}>
                  {s.label}
                </span>
                {t.progress_text && (
                  <span className="text-[11px] text-muted-foreground truncate">
                    {t.progress_text}
                  </span>
                )}
              </div>
              {/* 进度条 */}
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isRunning && 'bg-blue-500 animate-pulse',
                    t.status === 'completed' && 'bg-green-500',
                    (t.status === 'failed' || t.status === 'timeout') &&
                      'bg-red-500'
                  )}
                  style={{ width: barWidth }}
                />
              </div>
              {/* 停止按钮 */}
              {isRunning && (
                <button
                  onClick={() => handleStop(t.platform)}
                  disabled={stopping === t.platform}
                  className="text-[11px] text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                >
                  {stopping === t.platform ? '停止中...' : '⏹ 停止任务'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
