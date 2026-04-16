import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, lazy, Suspense, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ErrorBoundary from './components/ErrorBoundary';
import { usePersonaStore, useActivePersona } from './stores/usePersonaStore';
import { useArticleStore } from './stores/useArticleStore';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const PersonaLibrary = lazy(() => import('./pages/PersonaLibrary'));
const ArticleLibrary = lazy(() => import('./pages/ArticleLibrary'));
const Favorites = lazy(() => import('./pages/Favorites'));

const routes = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    title: '创作工作台',
  },
  {
    path: '/personas',
    element: <PersonaLibrary />,
    title: '人设库',
  },
  {
    path: '/published',
    element: <ArticleLibrary />,
    title: '已发布文章',
  },
  {
    path: '/favorites',
    element: <Favorites />,
    title: '收藏夹',
  },
];

function AppLayout({ sidebarCollapsed, setSidebarCollapsed }) {
  const location = useLocation();
  const activePersona = useActivePersona();

  const currentRoute =
    routes.find((route) => route.path === location.pathname) || {
      title: '创作工作台',
    };

  return (
    <div className="flex h-screen">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={currentRoute.title}
          activePersona={activePersona}
          onPersonaClick={() => {
            // 后续这里可以接“切换人设弹窗”或跳转到人设库
            console.log('open persona selector');
          }}
        />

        <main className="flex-1 overflow-auto bg-gray-50">
          <Suspense fallback={<div className="p-6 text-center">加载页面中...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { loadPersonas } = usePersonaStore();
  const { loadArticles, loadFavorites } = useArticleStore();

  useEffect(() => {
    loadPersonas();
    loadArticles();
    loadFavorites();
  }, [loadPersonas, loadArticles, loadFavorites]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppLayout
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;