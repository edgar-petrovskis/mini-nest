import { Module } from '../framework/module';
import { CatsModule } from './cats/cats.module';

@Module({
  controllers: [],
  providers: [],
  imports: [CatsModule],
})
export class AppModule {}
