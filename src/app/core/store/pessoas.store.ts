import { Injectable, signal } from '@angular/core';
import { Pessoa } from '../models';
import { MOCK_PESSOAS } from '../mock/mock-data';
import { novoId } from '../../shared/utils/id';

export type RascunhoPessoa = Omit<Pessoa, 'id'>;

@Injectable({ providedIn: 'root' })
export class PessoasStore {
  private readonly _pessoas = signal<Pessoa[]>(MOCK_PESSOAS);
  readonly pessoas = this._pessoas.asReadonly();

  porId(id: string): Pessoa | undefined {
    return this._pessoas().find((p) => p.id === id);
  }

  criar(input: RascunhoPessoa): Pessoa {
    const pessoa: Pessoa = { id: novoId('pessoa'), ...input };
    this._pessoas.update((atual) => [...atual, pessoa]);
    return pessoa;
  }

  atualizar(id: string, patch: RascunhoPessoa): void {
    this._pessoas.update((atual) => atual.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  remover(id: string): void {
    this._pessoas.update((atual) => atual.filter((p) => p.id !== id));
  }
}
