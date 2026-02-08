import type express from 'express';
import type { Container } from '../../di/container';
import {
  type GuardToken,
  type InterceptorContext,
  type InterceptorToken,
  METADATA_KEYS,
  type ParamPipeDefinition,
  type PipeToken,
  type RouteParamDefinition,
} from '../constants';
import type { MatchedRoute } from './route-matcher';
import { runGuardChain } from './guards';
import { runInterceptorChain } from './interceptors';
import { runPipeChain } from './pipes';

export async function invokeRoute(
  matched: MatchedRoute,
  container: Container,
  req: express.Request,
  globalPipes: PipeToken[],
  globalGuards: GuardToken[],
  globalInterceptors: InterceptorToken[],
): Promise<unknown> {
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
  const controllerInterceptors: InterceptorToken[] =
    Reflect.getMetadata(
      METADATA_KEYS.controllerInterceptors,
      route.controllerToken,
    ) ?? [];
  const methodInterceptors: InterceptorToken[] =
    Reflect.getMetadata(
      METADATA_KEYS.methodInterceptors,
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

  const context: InterceptorContext = {
    request: req,
    controller,
    handlerName: route.handlerName,
    args,
  };

  const interceptors: InterceptorToken[] = [
    ...globalInterceptors,
    ...controllerInterceptors,
    ...methodInterceptors,
  ];

  return runInterceptorChain(interceptors, context, async () => {
    return handler.call(controller, ...args);
  });
}

