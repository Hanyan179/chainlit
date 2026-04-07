import { useEffect, useRef } from 'react';

import { Header } from '@/components/header';

interface Props {
  src: string;
  title?: string;
}

/**
 * 嵌入 FastAPI 页面的通用组件。
 * 只有 Header 导航栏 + iframe，不显示对话历史侧边栏。
 */
export default function EmbedPage({ src, title }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const sendTheme = () => {
      const dark = document.documentElement.classList.contains('dark');
      iframeRef.current?.contentWindow?.postMessage({ type: 'themeChange', dark }, '*');
    };
    const iframe = iframeRef.current;
    const onLoad = () => sendTheme();
    iframe?.addEventListener('load', onLoad);
    const timer = setTimeout(sendTheme, 300);
    const observer = new MutationObserver(sendTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { clearTimeout(timer); observer.disconnect(); iframe?.removeEventListener('load', onLoad); };
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground">
      <Header />
      <iframe
        ref={iframeRef}
        src={src}
        title={title || ''}
        className="flex-1 w-full border-none"
      />
    </div>
  );
}
