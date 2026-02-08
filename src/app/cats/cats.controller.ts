import { z } from 'zod';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseFilter,
  UseGuard,
  UseInterceptor,
  UsePipe,
} from '../../framework/http/decorators';
import { HttpException } from '../../framework/http/errors/exceptions';
import { ZodValidationPipe } from '../../framework/http/pipes/zod-validation.pipe';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { TraceInterceptor } from '../common/interceptors/trace.interceptor';
import { IdToNumberPipe } from '../common/pipes/id-to-number.pipe';
import { CatsService } from './cats.service';

const createCatSchema = z.object({
  name: z.string().min(1),
  age: z.coerce.number().int().nonnegative(),
});

const patchCatSchema = z
  .object({
    name: z.string().min(1).optional(),
    age: z.coerce.number().int().nonnegative().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'Patch body must not be empty',
  });

class CatsControllerFilter {
  catch(exception: unknown) {
    if (exception instanceof HttpException) {
      return {
        status: exception.status,
        body: {
          source: 'cats-controller-filter',
          message: exception.message,
        },
        contentType: 'json' as const,
      };
    }
  }
}

@UseFilter(CatsControllerFilter)
@UseGuard(ApiKeyGuard)
@UseInterceptor(TraceInterceptor)
@Controller('/cats')
export class CatsController {
  constructor(private readonly cats: CatsService) {}

  @Get('/')
  list(@Query('limit') limit?: string) {
    const all = this.cats.list();
    const take = limit ? Math.max(0, Number(limit) || 0) : all.length;
    return { items: all.slice(0, take) };
  }

  @Get('/:id')
  byId(@UsePipe(IdToNumberPipe) @Param('id') id: number) {
    return this.cats.byId(id);
  }

  @Post('/')
  create(
    @UsePipe(new ZodValidationPipe(createCatSchema))
    @Body()
    body: any,
  ) {
    return this.cats.create(body.name, body.age);
  }

  @Put('/:id')
  replace(
    @UsePipe(IdToNumberPipe) @Param('id') id: number,
    @UsePipe(new ZodValidationPipe(createCatSchema))
    @Body()
    body: any,
  ) {
    return this.cats.replace(id, body.name, body.age);
  }

  @Patch('/:id')
  patch(
    @UsePipe(IdToNumberPipe) @Param('id') id: number,
    @UsePipe(new ZodValidationPipe(patchCatSchema))
    @Body()
    body: any,
  ) {
    return this.cats.patch(id, body);
  }

  @Delete('/:id')
  remove(@UsePipe(IdToNumberPipe) @Param('id') id: number) {
    return this.cats.remove(id);
  }
}
