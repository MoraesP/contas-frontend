import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MensalService, ResumoMensal, TotalPorPessoaMensal } from './mensal.service';
import { DialogService } from '../../shared/services/dialog.service';
import { mensagemErro } from '../../core/http/mensagem-erro';
import { centavosParaBRL } from '../../shared/utils/currency';
import { mesAtualIso } from '../../shared/utils/mes';
import { Skeleton } from '../../shared/components/skeleton';

@Component({
  selector: 'app-mensal',
  standalone: true,
  imports: [FormsModule, RouterLink, Skeleton],
  templateUrl: './mensal.html',
})
export class Mensal {
  private readonly service = inject(MensalService);
  private readonly dialog = inject(DialogService);

  protected readonly centavosParaBRL = centavosParaBRL;
  protected mes = mesAtualIso();

  protected readonly carregando = signal(true);
  protected readonly resumo = signal<ResumoMensal | null>(null);

  /** Soma o breakdown por pessoa de todos os cartões — total por pessoa no mês inteiro. */
  protected readonly totalPorPessoaGeral = computed<TotalPorPessoaMensal[]>(() => {
    const r = this.resumo();
    if (!r) return [];
    const mapa = new Map<string, TotalPorPessoaMensal>();
    for (const c of r.cartoes) {
      for (const p of c.porPessoa) {
        const atual = mapa.get(p.id) ?? { id: p.id, nome: p.nome, total: 0 };
        atual.total += p.total;
        mapa.set(p.id, atual);
      }
    }
    return [...mapa.values()].sort((a, b) => b.total - a.total);
  });

  constructor() {
    void this.carregar();
  }

  protected async carregar(): Promise<void> {
    if (!this.mes) return;
    this.carregando.set(true);
    try {
      const resultado = await this.service.buscar(this.mes);
      this.resumo.set(resultado);
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    } finally {
      this.carregando.set(false);
    }
  }
}
