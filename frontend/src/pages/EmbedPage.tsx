import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ThemeToggle } from '@/components/header/ThemeToggle';

// 和 Header 里保持一致的导航项
const NAV_ITEMS = [
  { key: 'chat', label: '💬 对话', path: '/' },
  { key: 'jobs', label: '📋 岗位', path: '/app/jobs' },
  { key: 'interviews', label: '🎯 面试', path: '/app/interviews' },
  { key: 'overview', label: '🏆 总览', path: '/app/overview' },
  { key: 'memory', label: '🧠 画像', path: '/app/memory' },
  { key: 'settings', label: '⚙️ 设置', path: '/app/settings' },
];

interface Props {
  src: string;
  title?: string;
}

/**
 * 嵌入 FastAPI 页面的通用组件。
 * 不依赖 SidebarProvider，使用独立的导航栏。
 */
export default function EmbedPage({ src, title }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveKey = () => {
    const match = NAV_ITEMS.find(item => item.path !== '/' && location.pathname.startsWith(item.path));
    return match?.key || 'chat';
  };
  const activeKey = getActiveKey();

  // 监听主题变化，通知 iframe
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains('dark');
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'themeChange', dark },
        '*'
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground">
      {/* 导航栏 — 和 Header 视觉一致但不依赖 SidebarProvider */}
      <div className="px-4 flex h-[48px] items-center gap-2 border-b border-border shrink-0">
        <span
          className="text-[15px] font-bold cursor-pointer mr-2 whitespace-nowrap"
          onClick={() => navigate('/')}
        >
          🤖 OfferBot
        </span>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeKey === item.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* iframe 内容 */}
      <iframe
        ref={iframeRef}
        src={src}
        title={title || ''}
        className="flex-1 w-full border-none"
      />
    </div>
  );
}
