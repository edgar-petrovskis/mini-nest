import { Module } from '../framework/module';
import { Controller, Get } from '../framework/http/decorators';

@Controller('/cats')
class CatsController {
  @Get('/ping')
  ping() {
    return 'pong';
  }
}

@Module({
  controllers: [CatsController],
  providers: [],
  imports: [],
})
export class AppModule {}
