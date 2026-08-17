import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { normalizarId } from '../http/normalizar-id';
import { Categoria } from '../models';

const URL_BASE = `${environment.apiBaseUrl}/categorias`;

@Injectable({ providedIn: 'root' })
export class CategoriasStore {
  private readonly http = inject(HttpClient);
  private readonly _categorias = signal<Categoria[]>([]);
  private readonly _carregado = signal(false);

  readonly categorias = this._categorias.asReadonly();
  readonly carregado = this._carregado.asReadonly();

  async carregar(): Promise<void> {
    const lista = await firstValueFrom(this.http.get<Record<string, unknown>[]>(URL_BASE));
    this._categorias.set(lista.map((d) => normalizarId<Categoria>(d)));
    this._carregado.set(true);
  }

  porId(id: string): Categoria | undefined {
    return this._categorias().find((c) => c.id === id);
  }

  async criar(nome: string): Promise<Categoria> {
    const doc = await firstValueFrom(this.http.post<Record<string, unknown>>(URL_BASE, { nome }));
    const criada = normalizarId<Categoria>(doc);
    if (!this._categorias().some((c) => c.id === criada.id)) {
      this._categorias.update((atual) => [...atual, criada]);
    }
    return criada;
  }

  async remover(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${URL_BASE}/${id}`));
    this._categorias.update((atual) => atual.filter((c) => c.id !== id));
  }
}
