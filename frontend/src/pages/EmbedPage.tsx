import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  src: string;
  title?: string;
}

/**
 * 嵌入 FastAPI 页面的通用组件。
 * 只保留返回按钮 + iframe，导航栏由 Header 统一处理。
 */
export default function EmbedPage({ src, title }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();

  // 监听主题变化，通知 iframe 内的子页面
  useEffect(() => {
    const sendTheme = () => {
      const dark = document.documentElement.classList.contains('dark');
      iframeRef.current?.contentWindow?.postMessage({ type: 'themeChange', dark }, '*');
    };
    // 初始发送
    const timer = setTimeout(sendTheme, 500);
    // 监听变化
    const observer = new MutationObserver(sendTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      {/* 返回栏 */}
      <div className="flex items-center gap-2 px-4 h-[36px] border-b border-border bg-background shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 返回对话
        </button>
        {title && <span className="text-xs text-muted-foreground">/ {title}</span>}
      </div>
      <iframe
        ref={iframeRef}
        src={src}
        title={title || ''}
        className="flex-1 w-full border-none"
      />
    </div>
  );
}
