import { METADATA_KEYS } from '../constants';

export function Controller(prefix = ''): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.controllerPrefix, prefix, target);
  };
}

