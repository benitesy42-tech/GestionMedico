import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 30000;

  get<T>(key: string, fallback: () => Observable<T>, ttl = this.DEFAULT_TTL): Observable<T> {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return of(cached.data as T);
    }
    return fallback().pipe(
      tap((data) => {
        this.cache.set(key, { data, expiry: Date.now() + ttl });
      }),
    );
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateStartingWith(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}
