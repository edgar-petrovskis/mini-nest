import { Module } from '../framework/module';
import {
  Controller,
  Get,
  UseFilter,
  UseInterceptor,
  Query,
  UseGuard,
} from '../framework/http/decorators';

import { HttpException } from '../framework/http/errors/exceptions';

class AuthGuard {
  canActivate(ctx: any) {
    if (ctx.request.query?.auth !== 'ok') {
      throw new HttpException(403, 'AuthGuard');
    }
    return true;
  }
}

class BlockGuard {
  canActivate(): never {
    throw new HttpException(403, 'BlockGuard');
  }
}

class ControllerTraceInterceptor {
  async intercept(ctx: any, next: any) {
    const req = ctx.request as any;
    req.trace ??= [];
    req.trace.push('controller-before');

    const result = await next.handle();

    req.trace.push('controller-after');
    return { ...(result ?? {}), trace: [...req.trace] };
  }
}

class MethodTraceInterceptor {
  async intercept(ctx: any, next: any) {
    const req = ctx.request as any;
    req.trace ??= [];
    req.trace.push('method-before');

    const result = await next.handle();

    req.trace.push('method-after');
    return { ...(result ?? {}), trace: [...req.trace] };
  }
}

class ControllerErrorFilter {
  catch(exception: any) {
    return {
      status: 461,
      body: {
        from: 'controller-filter',
        message: exception?.message ?? 'unknown',
      },
      contentType: 'json' as const,
    };
  }
}

class MethodErrorFilter {
  catch(exception: any) {
    return {
      status: 460,
      body: {
        from: 'method-filter',
        message: exception?.message ?? 'unknown',
      },
      contentType: 'json' as const,
    };
  }
}

@UseGuard(AuthGuard)
@Controller('/guards')
class GuardsController {
  @Get('/pass')
  pass(@Query('auth') auth: string) {
    return { ok: true, auth };
  }

  @UseGuard(BlockGuard)
  @Get('/blocked')
  blocked() {
    return { ok: true };
  }
}

@UseInterceptor(ControllerTraceInterceptor)
@Controller('/interceptors')
class InterceptorsController {
  @UseInterceptor(MethodTraceInterceptor)
  @Get('/smoke')
  smoke() {
    return { ok: true };
  }
}

@UseFilter(ControllerErrorFilter)
@Controller('/filters')
class FiltersController {
  @UseFilter(MethodErrorFilter)
  @Get('/method')
  methodLevel() {
    throw new HttpException(400, 'method boom');
  }

  @Get('/controller')
  controllerLevel() {
    throw new HttpException(401, 'controller boom');
  }

  @Get('/global')
  globalLevel() {
    throw new Error('global boom');
  }
}

@Module({
  controllers: [GuardsController, InterceptorsController, FiltersController],
  providers: [],
  imports: [],
})
export class AppModule {}
