import {
  METADATA_KEYS,
  type ParamPipeDefinition,
  type PipeToken,
} from '../constants';

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

