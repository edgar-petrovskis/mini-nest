import { Module } from '../../framework/module';
import { CatsController } from './cats.controller';
import { CatsRepository } from './cats.repository';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsRepository, CatsService],
  imports: [],
  exports: [CatsService],
})
export class CatsModule {}
