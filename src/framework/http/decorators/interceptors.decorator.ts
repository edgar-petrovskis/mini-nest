import { METADATA_KEYS, type InterceptorToken } from '../constants';

export function UseInterceptor(
  interceptor: InterceptorToken,
): ClassDecorator & MethodDecorator {
  return (target: object, propertyKey?: string | symbol) => {
    if (propertyKey) {
      const existing: InterceptorToken[] =
        Reflect.getMetadata(
          METADATA_KEYS.methodInterceptors,
          target,
          propertyKey,
        ) ?? [];
      existing.push(interceptor);
      Reflect.defineMetadata(
        METADATA_KEYS.methodInterceptors,
        existing,
        target,
        propertyKey,
      );
      return;
    }

    const existing: InterceptorToken[] =
      Reflect.getMetadata(METADATA_KEYS.controllerInterceptors, target) ?? [];
    existing.push(interceptor);
    Reflect.defineMetadata(
      METADATA_KEYS.controllerInterceptors,
      existing,
      target,
    );
  };
}

