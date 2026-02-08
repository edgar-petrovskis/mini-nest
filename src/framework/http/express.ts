import express from 'express';
import type { RouteRecord } from './router';
import type { Container } from '../di/container';
import { METADATA_KEYS, type RouteParamDefinition } from './constants';

type MatchedRoute = {
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

function matchRoute(
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

async function invokeRoute(
  matched: MatchedRoute,
  container: Container,
  req: express.Request,
): Promise<any> {
  const { route, params } = matched;
  const controller = container.resolve(route.controllerToken);

  const handler = (controller as any)[route.handlerName];

  if (typeof handler !== 'function') {
    throw new Error('Handler is not a function');
  }

  const paramMeta: RouteParamDefinition[] =
    Reflect.getMetadata(
      METADATA_KEYS.routeParams,
      route.controllerToken.prototype,
      route.handlerName,
    ) ?? [];

  const args: any[] = [];
  for (const param of paramMeta) {
    let value: unknown;

    if (param.source === 'param') {
      value = !param.name ? params : params?.[param.name];
    } else if (param.source === 'query') {
      value = !param.name ? req.query : req.query?.[param.name];
    } else {
      value = req.body;
    }

    args[param.index] = value;
  }

  return await handler.call(controller, ...args);
}

async function dispatch(
  routes: RouteRecord[],
  container: Container,
  req: express.Request,
  res: express.Response,
) {
  const matched = matchRoute(routes, req);

  if (!matched) {
    res.status(404).type('text/plain').send('Not Found');
    return;
  }

  try {
    const result = await invokeRoute(matched, container, req);

    if (typeof result === 'string') {
      res.type('text/plain').send(result);
      return;
    }

    res.json(result ?? null);
  } catch {
    res.status(500).type('text/plain').send('Internal Server Error');
  }
}

export function createExpressApp(routes: RouteRecord[], container: Container) {
  const app = express();

  app.use(express.json());

  app.use((req, res) => {
    if (req.method === 'GET') {
      void dispatch(routes, container, req as any, res as any);
      return;
    }
    res.status(405).type('text/plain').send('Method Not Allowed');
  });

  return app;
}
