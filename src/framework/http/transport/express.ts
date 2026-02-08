import express from 'express';
import type { RouteRecord } from '../routing/router';
import type { Container } from '../../di/container';
import {
  type FilterToken,
  type GuardToken,
  type InterceptorToken,
  METADATA_KEYS,
  type PipeToken,
} from '../constants';
import { invokeRoute } from '../pipeline/invoke-route';
import { runFilterChain } from '../pipeline/filters';
import { matchRoute } from '../routing/route-matcher';

async function dispatch(
  routes: RouteRecord[],
  container: Container,
  globalPipes: PipeToken[],
  globalGuards: GuardToken[],
  globalInterceptors: InterceptorToken[],
  globalFilters: FilterToken[],
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
    const controllerFilters: FilterToken[] =
      Reflect.getMetadata(
        METADATA_KEYS.controllerFilters,
        matched.route.controllerToken,
      ) ?? [];
    const methodFilters: FilterToken[] =
      Reflect.getMetadata(
        METADATA_KEYS.methodFilters,
        matched.route.controllerToken.prototype,
        matched.route.handlerName,
      ) ?? [];

    const result = await runFilterChain(
      error,
      {
        request: req,
        response: res,
        controller: matched.route.controllerToken,
        handlerName: matched.route.handlerName,
      },
      [...methodFilters, ...controllerFilters, ...globalFilters],
    );

    if (result.contentType === 'text') {
      res.status(result.status).type('text/plain').send(String(result.body));
      return;
    }

    res.status(result.status).json(result.body);
  }
}

export function createExpressApp(
  routes: RouteRecord[],
  container: Container,
  globalPipes: PipeToken[] = [],
  globalGuards: GuardToken[] = [],
  globalInterceptors: InterceptorToken[] = [],
  globalFilters: FilterToken[] = [],
) {
  const app = express();

  app.use(express.json());

  app.use((req, res) => {
    dispatch(
      routes,
      container,
      globalPipes,
      globalGuards,
      globalInterceptors,
      globalFilters,
      req as any,
      res as any,
    );
  });

  return app;
}
