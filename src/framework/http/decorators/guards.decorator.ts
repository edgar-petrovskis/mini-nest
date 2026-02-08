import { METADATA_KEYS, type GuardToken } from '../constants';

export function UseGuard(guard: GuardToken): ClassDecorator & MethodDecorator {
  return (target: object, propertyKey?: string | symbol) => {
    if (propertyKey) {
      const existing: GuardToken[] =
        Reflect.getMetadata(METADATA_KEYS.methodGuards, target, propertyKey) ??
        [];
      existing.push(guard);
      Reflect.defineMetadata(
        METADATA_KEYS.methodGuards,
        existing,
        target,
        propertyKey,
      );
      return;
    }

    const existing: GuardToken[] =
      Reflect.getMetadata(METADATA_KEYS.controllerGuards, target) ?? [];
    existing.push(guard);
    Reflect.defineMetadata(METADATA_KEYS.controllerGuards, existing, target);
  };
}

