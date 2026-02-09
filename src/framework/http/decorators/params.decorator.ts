import {
  METADATA_KEYS,
  type RouteParamDefinition,
  type RouteParamSource,
} from '../constants';

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

