import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { normalizarId } from '../http/normalizar-id';
import { Cartao } from '../models';

export type RascunhoCartao = Omit<Cartao, 'id'>;

const URL_BASE = `${environment.apiBaseUrl}/cartoes`;

/**
 * Fonte de verdade dos cartões. Carrega da API sob demanda (chamar
 * `carregar()`); os métodos de escrita chamam a API e atualizam o cache
 * local com a resposta do servidor.
 */
@Injectable({ providedIn: 'root' })
export class CartoesStore {
  private readonly http = inject(HttpClient);
  private readonly _cartoes = signal<Cartao[]>([]);
  private readonly _carregado = signal(false);

  readonly cartoes = this._cartoes.asReadonly();
  readonly carregado = this._carregado.asReadonly();

  async carregar(): Promise<void> {
    const lista = await firstValueFrom(this.http.get<Record<string, unknown>[]>(URL_BASE));
    this._cartoes.set(lista.map((d) => normalizarId<Cartao>(d)));
    this._carregado.set(true);
  }

  porId(id: string): Cartao | undefined {
    return this._cartoes().find((c) => c.id === id);
  }

  async criar(input: RascunhoCartao): Promise<Cartao> {
    const doc = await firstValueFrom(this.http.post<Record<string, unknown>>(URL_BASE, input));
    const criado = normalizarId<Cartao>(doc);
    this._cartoes.update((atual) => [...atual, criado]);
    return criado;
  }

  async atualizar(id: string, patch: RascunhoCartao): Promise<void> {
    const doc = await firstValueFrom(this.http.put<Record<string, unknown>>(`${URL_BASE}/${id}`, patch));
    const atualizado = normalizarId<Cartao>(doc);
    this._cartoes.update((atual) => atual.map((c) => (c.id === id ? atualizado : c)));
  }

  async remover(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${URL_BASE}/${id}`));
    this._cartoes.update((atual) => atual.filter((c) => c.id !== id));
  }
}
