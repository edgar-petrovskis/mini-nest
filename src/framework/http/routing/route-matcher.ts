import type express from 'express';
import type { RouteRecord } from './router';

export type MatchedRoute = {
  route: RouteRecord;
  params: Record<string, string>;
  specificity: number;
};

function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function matchPath(
  routePath: string,
  requestPath: string,
): { params: Record<string, string>; specificity: number } | null {
  const routeParts = splitPath(routePath);
  const requestParts = splitPath(requestPath);

  if (routeParts.length !== requestParts.length) return null;

  const params: Record<string, string> = {};
  let specificity = 0;

  for (let i = 0; i < routeParts.length; i++) {
    const routePart = routeParts[i];
    const requestPart = requestParts[i];

    if (routePart.startsWith(':')) {
      params[routePart.slice(1)] = requestPart;
      continue;
    }

    specificity += 1;

    if (routePart !== requestPart) return null;
  }

  return { params, specificity };
}

export function matchRoute(
  routes: RouteRecord[],
  req: express.Request,
): MatchedRoute | undefined {
  const method = (req.method ?? 'GET').toUpperCase();
  const path = req.path || '/';
  let best: MatchedRoute | undefined;

  for (const route of routes) {
    if (route.method !== method) continue;

    const matched = matchPath(route.path, path);
    if (!matched) continue;

    if (!best || matched.specificity > best.specificity) {
      best = {
        route,
        params: matched.params,
        specificity: matched.specificity,
      };
    }
  }

  return best;
}
