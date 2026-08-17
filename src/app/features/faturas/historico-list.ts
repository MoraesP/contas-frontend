import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartoesStore } from '../../core/store/cartoes.store';
import { FaturasStore } from '../../core/store/faturas.store';
import { DebitosStore } from '../../core/store/debitos.store';
import { formatarMes } from '../../shared/utils/mes';
import { centavosParaBRL } from '../../shared/utils/currency';

@Component({
  selector: 'app-historico-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './historico-list.html',
})
export class HistoricoList {
  protected readonly cartoesStore = inject(CartoesStore);
  protected readonly faturasStore = inject(FaturasStore);
  private readonly debitosStore = inject(DebitosStore);

  protected readonly formatarMes = formatarMes;
  protected readonly centavosParaBRL = centavosParaBRL;

  protected readonly filtroCartaoId = signal<string | null>(null);

  protected readonly faturas = computed(() => {
    const filtro = this.filtroCartaoId();
    return this.faturasStore.fechadas(filtro ? { cartaoId: filtro } : undefined);
  });

  protected nomeCartao(cartaoId: string): string {
    return this.cartoesStore.porId(cartaoId)?.nome ?? 'Cartão removido';
  }

  protected corCartao(cartaoId: string): string {
    return this.cartoesStore.porId(cartaoId)?.corCaracteristica ?? '#8E8B85';
  }

  protected totalFatura(faturaId: string): number {
    return this.debitosStore.porFatura(faturaId).reduce((s, d) => s + d.valor, 0);
  }
}
