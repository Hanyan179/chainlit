import { useEffect, useRef } from 'react';

import Page from 'pages/Page';

interface Props {
  src: string;
  title?: string;
}

/**
 * 嵌入 FastAPI 页面的通用组件。
 * 用 Page 包裹，复用 Header 导航栏 + LeftSidebar。
 */
export default function EmbedPage({ src, title }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 监听主题变化，通知 iframe 内的子页面
  useEffect(() => {
    const sendTheme = () => {
      const dark = document.documentElement.classList.contains('dark');
      iframeRef.current?.contentWindow?.postMessage({ type: 'themeChange', dark }, '*');
    };
    const timer = setTimeout(sendTheme, 500);
    const observer = new MutationObserver(sendTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);

  return (
    <Page>
      <iframe
        ref={iframeRef}
        src={src}
        title={title || ''}
        className="flex-1 w-full h-full border-none"
      />
    </Page>
  );
}
