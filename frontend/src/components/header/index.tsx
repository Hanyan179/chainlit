import { NAV_ITEMS } from '@/constants/nav';
import { memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { useAudio, useChatData, useConfig } from '@chainlit/react-client';

import AudioPresence from '@/components/AudioPresence';
import { Settings } from '@/components/icons/Settings';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Translator } from 'components/i18n';

import { chatSettingsSidebarOpenState } from '@/state/project';

import ChatProfiles from './ChatProfiles';
import { ThemeToggle } from './ThemeToggle';

const Header = memo(() => {
  const { audioConnection } = useAudio();
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useConfig();
  const { chatSettingsInputs } = useChatData();
  const setChatSettingsSidebarOpen = useSetRecoilState(
    chatSettingsSidebarOpenState
  );

  const showSettingsInHeader =
    config?.ui?.chat_settings_location === 'sidebar' &&
    chatSettingsInputs.length > 0;

  // 判断当前激活的导航项
  const currentPath = location.pathname;
  const getActiveKey = () => {
    if (currentPath === '/' || currentPath.startsWith('/thread')) return 'chat';
    const match = NAV_ITEMS.find(
      (item) => item.path !== '/' && currentPath.startsWith(item.path)
    );
    return match?.key || 'chat';
  };
  const activeKey = getActiveKey();

  return (
    <div
      className="px-4 flex h-[48px] items-center gap-2 border-b border-border"
      id="header"
    >
      {/* 品牌 */}
      <span
        className="text-[15px] font-bold cursor-pointer mr-2 whitespace-nowrap"
        onClick={() => navigate('/')}
      >
        🐄 MooBot
      </span>

      {/* 对话页面的控件 */}
      {activeKey === 'chat' && (
        <div className="flex items-center gap-1">
          <ChatProfiles navigate={navigate} />
        </div>
      )}

      {/* 音频 */}
      {audioConnection === 'on' && (
        <div className="flex-1 flex justify-center">
          <AudioPresence
            type="server"
            height={35}
            width={70}
            barCount={4}
            barSpacing={2}
          />
        </div>
      )}

      {/* 右侧：导航 + 工具 */}
      <div className="flex items-center gap-1 ml-auto">
        <nav className="flex items-center gap-1 mr-2">
          {NAV_ITEMS.filter((item) => item.key !== 'chat').map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`text-[12px] font-medium px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                activeKey === item.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {showSettingsInHeader && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="chat-settings-header-button"
                onClick={() => setChatSettingsSidebarOpen(true)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-muted-foreground"
              >
                <Settings className="!size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <Translator path="chat.settings.title" />
            </TooltipContent>
          </Tooltip>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
});

export { Header };
