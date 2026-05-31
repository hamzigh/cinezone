import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '',       renderMode: RenderMode.Server },
  { path: 'login',  renderMode: RenderMode.Server },
  { path: 'signup', renderMode: RenderMode.Server },
  { path: 'browse',      renderMode: RenderMode.Client },
  { path: 'movie/:id',   renderMode: RenderMode.Client },
  { path: 'watch/:id',   renderMode: RenderMode.Client },
  { path: 'watchlist',   renderMode: RenderMode.Client },
  { path: 'profile',     renderMode: RenderMode.Client },
  { path: '**',     renderMode: RenderMode.Server }
];
