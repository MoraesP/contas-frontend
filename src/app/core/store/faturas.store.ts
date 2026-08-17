import { Injectable, signal } from '@angular/core';
import { Fatura, StatusFatura } from '../models';
import { MOCK_FATURAS, MOCK_FATURAS_ANTERIORES } from '../mock/mock-data';
import { novoId } from '../../shared/utils/id';

@Injectable({ providedIn: 'root' })
export class FaturasStore {
  private readonly _faturas = signal<Fatura[]>([...MOCK_FATURAS_ANTERIORES, ...MOCK_FATURAS]);
  readonly faturas = this._faturas.asReadonly();

  porId(id: string): Fatura | undefined {
    return this._faturas().find((f) => f.id === id);
  }

  /** Todas as faturas de um cartão, ordenadas da mais antiga pra mais recente. */
  doCartao(cartaoId: string): Fatura[] {
    return this._faturas()
      .filter((f) => f.cartaoId === cartaoId)
      .sort((a, b) => a.mesReferencia.localeCompare(b.mesReferencia));
  }

  aberta(cartaoId: string): Fatura | undefined {
    return this._faturas().find((f) => f.cartaoId === cartaoId && f.status === 'aberta');
  }

  ultimaFechada(cartaoId: string): Fatura | undefined {
    const fechadas = this.doCartao(cartaoId).filter((f) => f.status === 'fechada');
    return fechadas.at(-1);
  }

  /** Faturas fechadas de todos os cartões (ou só de um, se filtrado), mais recentes primeiro. */
  fechadas(filtro?: { cartaoId?: string }): Fatura[] {
    return this._faturas()
      .filter((f) => f.status === 'fechada' && (!filtro?.cartaoId || f.cartaoId === filtro.cartaoId))
      .sort((a, b) => b.mesReferencia.localeCompare(a.mesReferencia));
  }

  criar(cartaoId: string, mesReferencia: string): Fatura {
    const fatura: Fatura = { id: novoId('fatura'), cartaoId, mesReferencia, status: 'aberta' };
    this._faturas.update((atual) => [...atual, fatura]);
    return fatura;
  }

  fechar(id: string): void {
    this._faturas.update((atual) =>
      atual.map((f) =>
        f.id === id
          ? { ...f, status: 'fechada' as StatusFatura, dataFechamentoReal: new Date().toISOString() }
          : f,
      ),
    );
  }
}
