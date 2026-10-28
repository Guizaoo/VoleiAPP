import { useCallback, useEffect, useState } from 'react';

export type Route = 'quadras' | 'feed' | 'ranking';

export const routePaths: Record<Route, string> = {
  quadras: '/',
  feed: '/feed',
  ranking: '/ranking',
};

function routeFromPath(pathname: string): Route {
  const path = pathname.replace(/\/+$/, '');
  if (path === '/feed') return 'feed';
  if (path === '/ranking') return 'ranking';
  return 'quadras';
}

/**
 * Roteamento mínimo com a History API (sem dependências).
 * O vercel.json já redireciona /feed e /ranking para o index.html.
 */
export function useRoute() {
  const [route, setRoute] = useState<Route>(() => routeFromPath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setRoute(routeFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((next: Route, hash = '') => {
    const url = routePaths[next] + hash;
    if (window.location.pathname + window.location.hash !== url) {
      window.history.pushState(null, '', url);
    }
    setRoute(next);
  }, []);

  return { route, navigate };
}
