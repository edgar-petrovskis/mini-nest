import { Module } from '../framework/module';
import { Controller, Get, Query, UseGuard } from '../framework/http/decorators';

import { HttpException } from '../framework/http/exceptions';

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

@Module({
  controllers: [GuardsController],
  providers: [],
  imports: [],
})
export class AppModule {}
