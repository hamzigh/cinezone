import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // In dev, SSR must handle all routes. Using Client/Prerender without a
    // fallback can cause Express to return "Cannot GET /route" (404).
    renderMode: RenderMode.Server
  }
];
