import { z } from 'zod';
import { Module } from '../framework/module';
import {
  Controller,
  Get,
  Param,
  Query,
  UsePipe,
} from '../framework/http/decorators';
import type { PipeMetadata, PipeTransform } from '../framework/http/constants';
import { BadRequestError } from '../framework/http/exceptions';
import { ZodValidationPipe } from '../framework/http/zod-validation.pipe';

class ToIntPipe implements PipeTransform {
  transform(value: unknown, _meta: PipeMetadata) {
    const n = Number(value);
    if (!Number.isInteger(n)) throw new BadRequestError('id must be integer');
    return n;
  }
}

@Controller('/cats')
class CatsController {
  @Get('/pipe/:id')
  pipeDemo(
    @UsePipe(ToIntPipe) @Param('id') id: number,
    @Query('q') q: unknown,
  ) {
    return { id, q, idType: typeof id };
  }

  @Get('/pipe-validate')
  validateQuery(
    @UsePipe(
      new ZodValidationPipe(z.object({ page: z.coerce.number().int().min(1) })),
    )
    @Query()
    query: unknown,
  ) {
    return query;
  }
}

@Module({
  controllers: [CatsController],
  providers: [],
  imports: [],
})
export class AppModule {}
