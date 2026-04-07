import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

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
  completed: { icon: '✅', label: '完成', color: 'text-green-400' },
  failed: { icon: '❌', label: '失败', color: 'text-red-400' },
  timeout: { icon: '⏰', label: '超时', color: 'text-yellow-400' },
  pending: { icon: '🔄', label: '等待', color: 'text-muted-foreground' }
};

export default function TaskPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stopping, setStopping] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const resp = await fetch('/api/tasks');
        const data = await resp.json();
        const t = data.tasks || [];
        setTasks(t);

        if (t.length > 0) {
          setVisible(true);
          // 全部完成 → 5秒后自动隐藏
          const allDone = t.every(
            (x: Task) => x.status !== 'running' && x.status !== 'pending'
          );
          if (allDone) {
            if (!hideTimer.current) {
              hideTimer.current = setTimeout(() => {
                setVisible(false);
                hideTimer.current = null;
              }, 5000);
            }
          } else if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
          }
        }
      } catch {
        /* silent */
      }
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => {
      clearInterval(id);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
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

  if (!visible || !tasks.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <span className="text-[11px] font-semibold text-muted-foreground">
          任务
        </span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {tasks.filter((t) => t.status === 'running').length > 0
            ? '进行中'
            : '已完成'}
        </span>
      </div>
      <div className="px-3 py-2 space-y-2 max-h-48 overflow-y-auto">
        {tasks.map((t, i) => {
          const s = STATUS_MAP[t.status] || STATUS_MAP.pending;
          const isRunning = t.status === 'running' || t.status === 'pending';
          const elapsed =
            t.elapsed_s >= 60
              ? `${Math.floor(t.elapsed_s / 60)}m${t.elapsed_s % 60}s`
              : `${t.elapsed_s}s`;

          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{s.icon}</span>
                <span className="text-[11px] font-medium flex-1 truncate">
                  {t.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {elapsed}
                </span>
              </div>
              {t.progress_text && (
                <div className="text-[10px] text-muted-foreground pl-4">
                  {t.progress_text}
                </div>
              )}
              <div className="h-0.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isRunning && 'bg-blue-500 animate-pulse',
                    t.status === 'completed' && 'bg-green-500',
                    (t.status === 'failed' || t.status === 'timeout') &&
                      'bg-red-500'
                  )}
                  style={{
                    width: isRunning
                      ? `${Math.min(90, 20 + t.elapsed_s)}%`
                      : '100%'
                  }}
                />
              </div>
              {isRunning && (
                <button
                  onClick={() => handleStop(t.platform)}
                  disabled={stopping === t.platform}
                  className="text-[10px] text-red-400 hover:text-red-300 pl-4 disabled:opacity-50"
                >
                  {stopping === t.platform ? '停止中...' : '停止'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
