import getRouterBasename from '@/lib/router';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import AuthCallback from 'pages/AuthCallback';
import Element from 'pages/Element';
import EmbedPage from 'pages/EmbedPage';
import Env from 'pages/Env';
import Home from 'pages/Home';
import Login from 'pages/Login';
import Thread from 'pages/Thread';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />
    },
    {
      path: '/env',
      element: <Env />
    },
    {
      path: '/thread/:id?',
      element: <Thread />
    },
    {
      path: '/element/:id',
      element: <Element />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/login/callback',
      element: <AuthCallback />
    },
    {
      path: '/share/:id',
      element: <Thread />
    },
    // MooBot 自定义页面 — 嵌入 FastAPI 页面
    {
      path: '/app/jobs',
      element: <EmbedPage src="/page/jobs" title="岗位管理" />
    },
    {
      path: '/app/memory',
      element: <EmbedPage src="/page/memory" title="记忆画像" />
    },
    {
      path: '/app/settings',
      element: <EmbedPage src="/page/settings" title="设置" />
    },
    {
      path: '*',
      element: <Navigate replace to="/" />
    }
  ],
  { basename: getRouterBasename() }
);
