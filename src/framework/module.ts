import 'reflect-metadata';
import type { Token } from './di/types';

export const MODULE_METADATA_KEY = 'mini-nest:module';

export type ModuleMetadata = {
  providers?: Token<any>[];
  controllers?: Token<any>[];
  imports?: Token<any>[];
  exports?: Token<any>[];
};

export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(MODULE_METADATA_KEY, metadata, target);
  };
}

export function getModuleMetadata(
  target: Function,
): ModuleMetadata | undefined {
  return Reflect.getMetadata(MODULE_METADATA_KEY, target);
}
