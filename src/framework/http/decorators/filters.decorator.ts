import { METADATA_KEYS, type FilterToken } from '../constants';

export function UseFilter(filter: FilterToken): ClassDecorator & MethodDecorator {
  return (target: object, propertyKey?: string | symbol) => {
    if (propertyKey) {
      const existing: FilterToken[] =
        Reflect.getMetadata(METADATA_KEYS.methodFilters, target, propertyKey) ??
        [];
      existing.push(filter);
      Reflect.defineMetadata(
        METADATA_KEYS.methodFilters,
        existing,
        target,
        propertyKey,
      );
      return;
    }

    const existing: FilterToken[] =
      Reflect.getMetadata(METADATA_KEYS.controllerFilters, target) ?? [];
    existing.push(filter);
    Reflect.defineMetadata(METADATA_KEYS.controllerFilters, existing, target);
  };
}

