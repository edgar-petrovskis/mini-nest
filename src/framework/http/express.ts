import express from 'express';
import type { RouteRecord } from './router';
import type { Container } from '../di/container';

function matchRoute(
  routes: RouteRecord[],
  req: express.Request,
): RouteRecord | undefined {
  const method = (req.method ?? 'GET').toUpperCase();
  const path = req.path || '/';

  return routes.find((r) => r.method === method && r.path === path);
}

async function invokeRoute(
  route: RouteRecord,
  container: Container,
): Promise<any> {
  const controller = container.resolve(route.controllerToken);

  const handler = (controller as any)[route.handlerName];

  if (typeof handler !== 'function') {
    throw new Error('Handler is not a function');
  }

  return await handler.call(controller);
}

async function dispatch(
  routes: RouteRecord[],
  container: Container,
  req: express.Request,
  res: express.Response,
) {
  const route = matchRoute(routes, req);

  if (!route) {
    res.status(404).type('text/plain').send('Not Found');
    return;
  }

  try {
    const result = await invokeRoute(route, container);

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
