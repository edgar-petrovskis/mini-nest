import type { PipeMetadata, PipeTransform } from '../../../framework/http/constants';

export class TrimStringPipe implements PipeTransform {
  transform(value: unknown, _metadata: PipeMetadata): unknown {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const out: Record<string, unknown> = {};
      for (const [key, entry] of Object.entries(value)) {
        out[key] = typeof entry === 'string' ? entry.trim() : entry;
      }
      return out;
    }

    return value;
  }
}
