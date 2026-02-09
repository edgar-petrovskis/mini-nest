import { Injectable } from '../../framework/di/injectable';

export type CatRecord = {
  id: number;
  name: string;
  age: number;
};

@Injectable()
export class CatsRepository {
  private readonly items = new Map<number, CatRecord>();
  private nextId = 1;

  findAll(): CatRecord[] {
    return Array.from(this.items.values());
  }

  findById(id: number): CatRecord | undefined {
    return this.items.get(id);
  }

  create(data: Omit<CatRecord, 'id'>): CatRecord {
    const item: CatRecord = {
      id: this.nextId++,
      ...data,
    };

    this.items.set(item.id, item);
    return item;
  }

  replace(id: number, data: Omit<CatRecord, 'id'>): CatRecord | undefined {
    if (!this.items.has(id)) return undefined;

    const item: CatRecord = { id, ...data };
    this.items.set(id, item);
    return item;
  }

  patch(id: number, data: Partial<Omit<CatRecord, 'id'>>): CatRecord | undefined {
    const prev = this.items.get(id);
    if (!prev) return undefined;

    const next: CatRecord = { ...prev, ...data, id };
    this.items.set(id, next);
    return next;
  }

  remove(id: number): boolean {
    return this.items.delete(id);
  }
}
