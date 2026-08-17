import { Injectable, signal } from '@angular/core';
import { Cartao } from '../models';
import { MOCK_CARTOES } from '../mock/mock-data';
import { novoId } from '../../shared/utils/id';

export type RascunhoCartao = Omit<Cartao, 'id'>;

/**
 * Fonte de verdade dos cartões. Hoje é só um signal em memória seedado pelo
 * mock; quando a API existir, os métodos passam a chamar HTTP mas a
 * interface pública (signals + métodos) não muda.
 */
@Injectable({ providedIn: 'root' })
export class CartoesStore {
  private readonly _cartoes = signal<Cartao[]>(MOCK_CARTOES);
  readonly cartoes = this._cartoes.asReadonly();

  porId(id: string): Cartao | undefined {
    return this._cartoes().find((c) => c.id === id);
  }

  criar(input: RascunhoCartao): Cartao {
    const cartao: Cartao = { id: novoId('cartao'), ...input };
    this._cartoes.update((atual) => [...atual, cartao]);
    return cartao;
  }

  atualizar(id: string, patch: RascunhoCartao): void {
    this._cartoes.update((atual) => atual.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  remover(id: string): void {
    this._cartoes.update((atual) => atual.filter((c) => c.id !== id));
  }
}
