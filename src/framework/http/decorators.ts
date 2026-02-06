import { METADATA_KEYS } from './constants';

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
