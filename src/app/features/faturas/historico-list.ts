import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartoesStore } from '../../core/store/cartoes.store';
import { FaturasStore } from '../../core/store/faturas.store';
import { DebitosStore } from '../../core/store/debitos.store';
import { formatarMes } from '../../shared/utils/mes';
import { centavosParaBRL } from '../../shared/utils/currency';
import { Fatura } from '../../core/models';

@Component({
  selector: 'app-historico-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './historico-list.html',
})
export class HistoricoList {
  protected readonly cartoesStore = inject(CartoesStore);
  private readonly faturasStore = inject(FaturasStore);
  private readonly debitosStore = inject(DebitosStore);

  protected readonly formatarMes = formatarMes;
  protected readonly centavosParaBRL = centavosParaBRL;

  protected readonly carregando = signal(true);
  protected readonly filtroCartaoId = signal<string | null>(null);
  protected readonly faturas = signal<Fatura[]>([]);
  protected readonly totaisPorFatura = signal<Record<string, number>>({});

  constructor() {
    void this.cartoesStore.carregar();
    effect(() => {
      const filtro = this.filtroCartaoId();
      void this.carregar(filtro);
    });
  }

  private async carregar(filtro: string | null): Promise<void> {
    this.carregando.set(true);
    const lista = await this.faturasStore.fechadas(filtro ? { cartaoId: filtro } : undefined);
    this.faturas.set(lista);

    const totais = await Promise.all(
      lista.map(
        async (f) => [f.id, (await this.debitosStore.porFatura(f.id)).reduce((s, d) => s + d.valor, 0)] as const,
      ),
    );
    this.totaisPorFatura.set(Object.fromEntries(totais));
    this.carregando.set(false);
  }

  protected nomeCartao(cartaoId: string): string {
    return this.cartoesStore.porId(cartaoId)?.nome ?? 'Cartão removido';
  }

  protected corCartao(cartaoId: string): string {
    return this.cartoesStore.porId(cartaoId)?.corCaracteristica ?? '#8E8B85';
  }

  protected totalFatura(faturaId: string): number {
    return this.totaisPorFatura()[faturaId] ?? 0;
  }
}
