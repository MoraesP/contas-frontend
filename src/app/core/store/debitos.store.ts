import { Injectable, signal } from '@angular/core';
import { Debito } from '../models';
import { MOCK_DEBITOS, MOCK_DEBITOS_ANTERIORES } from '../mock/mock-data';
import { novoId } from '../../shared/utils/id';

export type RascunhoDebito = Omit<Debito, 'id' | 'compraId' | 'parcelaAtual'>;

@Injectable({ providedIn: 'root' })
export class DebitosStore {
  private readonly _debitos = signal<Debito[]>([...MOCK_DEBITOS_ANTERIORES, ...MOCK_DEBITOS]);
  readonly debitos = this._debitos.asReadonly();

  porFatura(faturaId: string): Debito[] {
    return this._debitos().filter((d) => d.faturaId === faturaId);
  }

  criar(input: RascunhoDebito): Debito {
    const id = novoId('debito');
    const debito: Debito = {
      ...input,
      id,
      parcelaAtual: input.tipo === 'parcelado' ? 1 : undefined,
      compraId: input.tipo === 'parcelado' ? id : undefined,
    };
    this._debitos.update((atual) => [...atual, debito]);
    return debito;
  }

  atualizar(id: string, patch: Partial<RascunhoDebito>): void {
    this._debitos.update((atual) => atual.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  remover(id: string): void {
    this._debitos.update((atual) => atual.filter((d) => d.id !== id));
  }

  /**
   * Rola os débitos indicados (parcelados avançam parcela, mesmo compraId;
   * fixos são clonados) pra uma nova fatura. A escolha de quais ids rolar é
   * feita pelo usuário (ver fatura-workflow.service.ts::candidatosRollover).
   */
  rolarSelecionados(ids: string[], novaFaturaId: string): Debito[] {
    const porId = new Map(this._debitos().map((d) => [d.id, d]));
    const criados: Debito[] = [];

    for (const id of ids) {
      const d = porId.get(id);
      if (!d) continue;
      if (d.tipo === 'parcelado') {
        criados.push(this.clonar(d, novaFaturaId, { parcelaAtual: (d.parcelaAtual ?? 0) + 1 }));
      } else if (d.tipo === 'fixo') {
        criados.push(this.clonar(d, novaFaturaId, {}));
      }
    }
    return criados;
  }

  private clonar(origem: Debito, novaFaturaId: string, overrides: Partial<Debito>): Debito {
    const clone: Debito = { ...origem, id: novoId('debito'), faturaId: novaFaturaId, ...overrides };
    this._debitos.update((atual) => [...atual, clone]);
    return clone;
  }
}
