import { Inject } from '../../framework/di/inject';
import { Injectable } from '../../framework/di/injectable';
import { HttpException } from '../../framework/http/errors/exceptions';
import { CatsRepository, type CatRecord } from './cats.repository';

@Injectable()
export class CatsService {
  constructor(@Inject(CatsRepository) private readonly repo: CatsRepository) {}

  list(): CatRecord[] {
    return this.repo.findAll();
  }

  byId(id: number): CatRecord {
    const item = this.repo.findById(id);
    if (!item) throw new HttpException(404, `Cat ${id} not found`);
    return item;
  }

  create(name: string, age: number): CatRecord {
    return this.repo.create({ name, age });
  }

  replace(id: number, name: string, age: number): CatRecord {
    const item = this.repo.replace(id, { name, age });
    if (!item) throw new HttpException(404, `Cat ${id} not found`);
    return item;
  }

  patch(id: number, patch: { name?: string; age?: number }): CatRecord {
    const item = this.repo.patch(id, patch);
    if (!item) throw new HttpException(404, `Cat ${id} not found`);
    return item;
  }

  remove(id: number): { deleted: true } {
    const ok = this.repo.remove(id);
    if (!ok) throw new HttpException(404, `Cat ${id} not found`);
    return { deleted: true };
  }
}
