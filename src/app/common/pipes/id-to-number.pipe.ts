import { BadRequestError } from '../../../framework/http/errors/exceptions';
import type { PipeMetadata, PipeTransform } from '../../../framework/http/constants';

export class IdToNumberPipe implements PipeTransform {
  transform(value: unknown, _metadata: PipeMetadata): number {
    const num = Number(value);

    if (!Number.isInteger(num) || num <= 0) {
      throw new BadRequestError('id must be a positive integer');
    }

    return num;
  }
}
