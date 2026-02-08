import {
  METADATA_KEYS,
  type ParamPipeDefinition,
  type PipeToken,
  type RouteParamDefinition,
  type RouteParamSource,
} from './constants';

export function Controller(prefix = ''): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.controllerPrefix, prefix, target);
  };
}

export function Get(path = '/'): MethodDecorator {
  return (target, handlerName) => {
    const constructor = target.constructor;

    const existingRoutes =
      Reflect.getMetadata(METADATA_KEYS.routes, constructor) ?? [];

    const next = {
      method: 'GET',
      path,
      handlerName,
    };

    existingRoutes.push(next);

    Reflect.defineMetadata(METADATA_KEYS.routes, existingRoutes, constructor);
  };
}

function defineRouteParam(
  source: RouteParamSource,
  name?: string,
): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (!propertyKey) {
      throw new Error(
        '@Param/@Query/@Body can only be used on controller methods',
      );
    }

    const existing: RouteParamDefinition[] =
      Reflect.getMetadata(METADATA_KEYS.routeParams, target, propertyKey) ?? [];

    const next: RouteParamDefinition = {
      index: parameterIndex,
      source,
      name,
    };

    const withoutSameIndex = existing.filter(
      (param) => param.index !== parameterIndex,
    );

    withoutSameIndex.push(next);
    withoutSameIndex.sort((a, b) => a.index - b.index);

    Reflect.defineMetadata(
      METADATA_KEYS.routeParams,
      withoutSameIndex,
      target,
      propertyKey,
    );
  };
}

export function Param(name?: string): ParameterDecorator {
  return defineRouteParam('param', name);
}

export function Query(name?: string): ParameterDecorator {
  return defineRouteParam('query', name);
}

export function Body(): ParameterDecorator {
  return defineRouteParam('body');
}

export function UsePipe(
  pipe: PipeToken,
): ClassDecorator & MethodDecorator & ParameterDecorator {
  return (
    target: object,
    propertyKey?: string | symbol,
    descriptorOrParameterIndex?: PropertyDescriptor | number,
  ) => {
    if (typeof descriptorOrParameterIndex === 'number') {
      if (!propertyKey) {
        throw new Error('@UsePipe on parameter requires a method key');
      }

      const existing: ParamPipeDefinition[] =
        Reflect.getMetadata(METADATA_KEYS.paramPipes, target, propertyKey) ??
        [];

      const index = descriptorOrParameterIndex;
      const sameParam = existing.find((entry) => entry.index === index);

      if (sameParam) {
        sameParam.pipes.push(pipe);
      } else {
        existing.push({ index, pipes: [pipe] });
        existing.sort((a, b) => a.index - b.index);
      }

      Reflect.defineMetadata(
        METADATA_KEYS.paramPipes,
        existing,
        target,
        propertyKey,
      );
      return;
    }

    if (propertyKey) {
      const existing: PipeToken[] =
        Reflect.getMetadata(METADATA_KEYS.methodPipes, target, propertyKey) ??
        [];
      existing.push(pipe);
      Reflect.defineMetadata(
        METADATA_KEYS.methodPipes,
        existing,
        target,
        propertyKey,
      );
      return;
    }

    const existing: PipeToken[] =
      Reflect.getMetadata(METADATA_KEYS.controllerPipes, target) ?? [];
    existing.push(pipe);
    Reflect.defineMetadata(METADATA_KEYS.controllerPipes, existing, target);
  };
}
