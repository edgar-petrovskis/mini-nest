import { METADATA_KEYS, type HttpMethod } from '../constants';

function createRouteDecorator(method: HttpMethod) {
  return (path = '/'): MethodDecorator => {
    return (target, handlerName) => {
      const constructor = target.constructor;

      const existingRoutes =
        Reflect.getMetadata(METADATA_KEYS.routes, constructor) ?? [];

      const next = {
        method,
        path,
        handlerName,
      };

      existingRoutes.push(next);

      Reflect.defineMetadata(METADATA_KEYS.routes, existingRoutes, constructor);
    };
  };
}

export const Get = createRouteDecorator('GET');
export const Post = createRouteDecorator('POST');
export const Put = createRouteDecorator('PUT');
export const Patch = createRouteDecorator('PATCH');
export const Delete = createRouteDecorator('DELETE');
