import { Injectable, signal } from '@angular/core';
import { Categoria } from '../models';
import { MOCK_CATEGORIAS } from '../mock/mock-data';
import { novoId } from '../../shared/utils/id';

@Injectable({ providedIn: 'root' })
export class CategoriasStore {
  private readonly _categorias = signal<Categoria[]>(MOCK_CATEGORIAS);
  readonly categorias = this._categorias.asReadonly();

  porId(id: string): Categoria | undefined {
    return this._categorias().find((c) => c.id === id);
  }

  criar(nome: string): Categoria {
    const existente = this._categorias().find((c) => c.nome.toLowerCase() === nome.trim().toLowerCase());
    if (existente) return existente;
    const categoria: Categoria = { id: novoId('categoria'), nome: nome.trim() };
    this._categorias.update((atual) => [...atual, categoria]);
    return categoria;
  }

  remover(id: string): void {
    this._categorias.update((atual) => atual.filter((c) => c.id !== id));
  }
}
