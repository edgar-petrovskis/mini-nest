import { z } from 'zod';
import type { PipeMetadata, PipeTransform } from '../constants';
import { BadRequestError } from '../errors/exceptions';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: any) {}

  transform(value: unknown, _metadata: PipeMetadata): unknown {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const message = z.prettifyError(result.error);
      throw new BadRequestError(message);
    }

    return result.data;
  }
}
