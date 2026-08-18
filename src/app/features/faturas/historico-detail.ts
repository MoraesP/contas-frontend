import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaturasStore } from '../../core/store/faturas.store';
import { CartoesStore } from '../../core/store/cartoes.store';
import { PessoasStore } from '../../core/store/pessoas.store';
import { CategoriasStore } from '../../core/store/categorias.store';
import { centavosParaBRL } from '../../shared/utils/currency';
import { formatarMes } from '../../shared/utils/mes';
import { TipoBadge } from '../../shared/components/tipo-badge';
import { Skeleton } from '../../shared/components/skeleton';
import { Cartao, Debito, Fatura } from '../../core/models';

@Component({
  selector: 'app-historico-detail',
  standalone: true,
  imports: [RouterLink, TipoBadge, Skeleton],
  templateUrl: './historico-detail.html',
})
export class HistoricoDetail {
  faturaId = input.required<string>();

  private readonly faturasStore = inject(FaturasStore);
  private readonly cartoesStore = inject(CartoesStore);
  private readonly pessoasStore = inject(PessoasStore);
  private readonly categoriasStore = inject(CategoriasStore);

  protected readonly centavosParaBRL = centavosParaBRL;
  protected readonly formatarMes = formatarMes;

  protected readonly carregando = signal(true);
  protected readonly fatura = signal<Fatura | null>(null);
  protected readonly cartao = signal<Cartao | undefined>(undefined);
  protected readonly debitos = signal<Debito[]>([]);
  protected readonly total = computed(() => this.debitos().reduce((s, d) => s + d.valor, 0));

  constructor() {
    void this.pessoasStore.carregar();
    void this.categoriasStore.carregar();

    effect(() => {
      const id = this.faturaId();
      void this.carregar(id);
    });
  }

  private async carregar(id: string): Promise<void> {
    this.carregando.set(true);
    try {
      const [{ debitos, ...fatura }] = await Promise.all([
        this.faturasStore.porId(id),
        this.cartoesStore.carregado() ? Promise.resolve() : this.cartoesStore.carregar(),
      ]);
      this.fatura.set(fatura);
      this.debitos.set(debitos);
      this.cartao.set(this.cartoesStore.porId(fatura.cartaoId));
    } finally {
      this.carregando.set(false);
    }
  }

  protected nomePessoa(id?: string): string {
    return id ? (this.pessoasStore.porId(id)?.nome ?? 'Pessoa removida') : 'Sem pessoa';
  }

  protected nomeCategoria(id?: string): string {
    return id ? (this.categoriasStore.porId(id)?.nome ?? 'Categoria removida') : 'N/A';
  }
}
