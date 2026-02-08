import express from 'express';
import type { RouteRecord } from './router';
import type { Container } from '../di/container';
import { type GuardToken, type InterceptorToken, type PipeToken } from './constants';
import { HttpException } from './exceptions';
import { invokeRoute } from './pipeline/invoke-route';
import { matchRoute } from './pipeline/route-matcher';

async function dispatch(
  routes: RouteRecord[],
  container: Container,
  globalPipes: PipeToken[],
  globalGuards: GuardToken[],
  globalInterceptors: InterceptorToken[],
  req: express.Request,
  res: express.Response,
) {
  const matched = matchRoute(routes, req);

  if (!matched) {
    res.status(404).type('text/plain').send('Not Found');
    return;
  }

  try {
    const result = await invokeRoute(
      matched,
      container,
      req,
      globalPipes,
      globalGuards,
      globalInterceptors,
    );

    if (typeof result === 'string') {
      res.type('text/plain').send(result);
      return;
    }

    res.json(result ?? null);
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.status).json({ message: error.message });
      return;
    }

    res.status(500).type('text/plain').send('Internal Server Error');
  }
}

export function createExpressApp(
  routes: RouteRecord[],
  container: Container,
  globalPipes: PipeToken[] = [],
  globalGuards: GuardToken[] = [],
  globalInterceptors: InterceptorToken[] = [],
) {
  const app = express();

  app.use(express.json());

  app.use((req, res) => {
    if (req.method === 'GET') {
      dispatch(
        routes,
        container,
        globalPipes,
        globalGuards,
        globalInterceptors,
        req as any,
        res as any,
      );
      return;
    }
    res.status(405).type('text/plain').send('Method Not Allowed');
  });

  return app;
}
