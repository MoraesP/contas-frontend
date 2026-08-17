import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { normalizarId } from '../http/normalizar-id';
import { Pessoa } from '../models';

export type RascunhoPessoa = Omit<Pessoa, 'id'>;

const URL_BASE = `${environment.apiBaseUrl}/pessoas`;

@Injectable({ providedIn: 'root' })
export class PessoasStore {
  private readonly http = inject(HttpClient);
  private readonly _pessoas = signal<Pessoa[]>([]);
  private readonly _carregado = signal(false);

  readonly pessoas = this._pessoas.asReadonly();
  readonly carregado = this._carregado.asReadonly();

  async carregar(): Promise<void> {
    const lista = await firstValueFrom(this.http.get<Record<string, unknown>[]>(URL_BASE));
    this._pessoas.set(lista.map((d) => normalizarId<Pessoa>(d)));
    this._carregado.set(true);
  }

  porId(id: string): Pessoa | undefined {
    return this._pessoas().find((p) => p.id === id);
  }

  async criar(input: RascunhoPessoa): Promise<Pessoa> {
    const doc = await firstValueFrom(this.http.post<Record<string, unknown>>(URL_BASE, input));
    const criada = normalizarId<Pessoa>(doc);
    this._pessoas.update((atual) => [...atual, criada]);
    return criada;
  }

  async atualizar(id: string, patch: RascunhoPessoa): Promise<void> {
    const doc = await firstValueFrom(this.http.put<Record<string, unknown>>(`${URL_BASE}/${id}`, patch));
    const atualizada = normalizarId<Pessoa>(doc);
    this._pessoas.update((atual) => atual.map((p) => (p.id === id ? atualizada : p)));
  }

  async remover(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${URL_BASE}/${id}`));
    this._pessoas.update((atual) => atual.filter((p) => p.id !== id));
  }
}
