import { Module } from '../framework/module';
import {
  Body,
  Controller,
  Get,
  Param,
  Query,
} from '../framework/http/decorators';

@Controller('/cats')
class CatsController {
  @Get('/ping')
  ping() {
    return 'pong';
  }

  @Get('/:id')
  byId(@Param('id') id: string) {
    return { id };
  }

  @Get('/search')
  search(@Query('q') q: unknown, @Query() allQuery: unknown) {
    return { q, allQuery };
  }

  @Get('/echo-body')
  echoBody(@Body() body: unknown) {
    return { body };
  }
}

@Module({
  controllers: [CatsController],
  providers: [],
  imports: [],
})
export class AppModule {}
