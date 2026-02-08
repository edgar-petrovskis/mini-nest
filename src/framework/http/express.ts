import express from 'express';
import type { RouteRecord } from './router';
import type { Container } from '../di/container';
import {
  type GuardContext,
  type GuardToken,
  METADATA_KEYS,
  type ParamPipeDefinition,
  type PipeMetadata,
  type PipeToken,
  type RouteParamDefinition,
} from './constants';
import { HttpException } from './exceptions';

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

function instantiatePipe(pipe: PipeToken) {
  if (typeof pipe === 'function') {
    return new pipe();
  }
  return pipe;
}

async function runPipeChain(
  value: unknown,
  pipes: PipeToken[],
  metadata: PipeMetadata,
): Promise<unknown> {
  let current = value;
  for (const pipeToken of pipes) {
    const pipe = instantiatePipe(pipeToken);
    current = await pipe.transform(current, metadata);
  }
  return current;
}

function instantiateGuard(guard: GuardToken) {
  if (typeof guard === 'function') {
    return new guard();
  }
  return guard;
}

async function runGuardChain(
  guards: GuardToken[],
  context: GuardContext,
): Promise<void> {
  for (const guardToken of guards) {
    const guard = instantiateGuard(guardToken);
    const allowed = await guard.canActivate(context);
    if (!allowed) {
      throw new HttpException(403, 'Forbidden');
    }
  }
}

async function invokeRoute(
  matched: MatchedRoute,
  container: Container,
  req: express.Request,
  globalPipes: PipeToken[],
  globalGuards: GuardToken[],
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
  const controllerPipes: PipeToken[] =
    Reflect.getMetadata(METADATA_KEYS.controllerPipes, route.controllerToken) ??
    [];
  const methodPipes: PipeToken[] =
    Reflect.getMetadata(
      METADATA_KEYS.methodPipes,
      route.controllerToken.prototype,
      route.handlerName,
    ) ?? [];
  const paramPipes: ParamPipeDefinition[] =
    Reflect.getMetadata(
      METADATA_KEYS.paramPipes,
      route.controllerToken.prototype,
      route.handlerName,
    ) ?? [];
  const controllerGuards: GuardToken[] =
    Reflect.getMetadata(
      METADATA_KEYS.controllerGuards,
      route.controllerToken,
    ) ?? [];
  const methodGuards: GuardToken[] =
    Reflect.getMetadata(
      METADATA_KEYS.methodGuards,
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

    const scopedParamPipes =
      paramPipes.find((entry) => entry.index === param.index)?.pipes ?? [];

    value = await runPipeChain(value, globalPipes, {
      type: param.source,
      data: param.name,
    });
    value = await runPipeChain(value, controllerPipes, {
      type: param.source,
      data: param.name,
    });
    value = await runPipeChain(value, methodPipes, {
      type: param.source,
      data: param.name,
    });
    value = await runPipeChain(value, scopedParamPipes, {
      type: param.source,
      data: param.name,
    });

    args[param.index] = value;
  }

  await runGuardChain(globalGuards, {
    request: req,
    controller,
    handlerName: route.handlerName,
    args,
  });
  await runGuardChain(controllerGuards, {
    request: req,
    controller,
    handlerName: route.handlerName,
    args,
  });
  await runGuardChain(methodGuards, {
    request: req,
    controller,
    handlerName: route.handlerName,
    args,
  });

  return await handler.call(controller, ...args);
}

async function dispatch(
  routes: RouteRecord[],
  container: Container,
  globalPipes: PipeToken[],
  globalGuards: GuardToken[],
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
        req as any,
        res as any,
      );
      return;
    }
    res.status(405).type('text/plain').send('Method Not Allowed');
  });

  return app;
}
