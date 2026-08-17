import { Injectable, inject } from '@angular/core';
import { FaturasStore } from '../../core/store/faturas.store';
import { DebitosStore } from '../../core/store/debitos.store';
import { Debito, Fatura } from '../../core/models';

/**
 * Orquestra abrir/fechar fatura. Espelha os services `abrirNovoMes` e
 * `fecharFatura` descritos em docs/specs/faturas.md — quando a API existir,
 * este service passa a chamar os endpoints em vez de mexer nas stores
 * locais diretamente.
 */
@Injectable({ providedIn: 'root' })
export class FaturaWorkflowService {
  private readonly faturas = inject(FaturasStore);
  private readonly debitos = inject(DebitosStore);

  /** Débitos da última fatura fechada do cartão elegíveis a continuar (parcelas em aberto e fixos). */
  candidatosRollover(cartaoId: string): Debito[] {
    const anterior = this.faturas.ultimaFechada(cartaoId);
    if (!anterior) return [];
    return this.debitos
      .porFatura(anterior.id)
      .filter((d) => (d.tipo === 'parcelado' && (d.parcelaAtual ?? 0) < (d.numeroParcelas ?? 0)) || d.tipo === 'fixo');
  }

  /**
   * Abre a fatura do mês escolhido pelo usuário. Só rola pra ela os débitos
   * cujos ids estão em `idsParaRolar` — a seleção é do usuário (via
   * candidatosRollover), não automática.
   */
  abrirNovoMes(cartaoId: string, mesReferencia: string, idsParaRolar: string[]): Fatura {
    if (this.faturas.aberta(cartaoId)) {
      throw new Error('Já existe uma fatura aberta para este cartão. Feche-a antes de abrir um novo mês.');
    }
    if (this.faturas.doCartao(cartaoId).some((f) => f.mesReferencia === mesReferencia)) {
      throw new Error('Já existe uma fatura para esse mês neste cartão.');
    }

    const nova = this.faturas.criar(cartaoId, mesReferencia);
    if (idsParaRolar.length > 0) {
      this.debitos.rolarSelecionados(idsParaRolar, nova.id);
    }
    return nova;
  }

  fechar(faturaId: string): void {
    const fatura = this.faturas.porId(faturaId);
    if (!fatura) throw new Error('Fatura não encontrada.');
    if (fatura.status === 'fechada') throw new Error('Esta fatura já está fechada.');
    this.faturas.fechar(faturaId);
  }
}
