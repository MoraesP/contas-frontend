import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaturasStore } from '../../core/store/faturas.store';
import { DebitosStore } from '../../core/store/debitos.store';
import { CartoesStore } from '../../core/store/cartoes.store';
import { PessoasStore } from '../../core/store/pessoas.store';
import { CategoriasStore } from '../../core/store/categorias.store';
import { centavosParaBRL } from '../../shared/utils/currency';
import { formatarMes } from '../../shared/utils/mes';
import { TipoBadge } from '../../shared/components/tipo-badge';

@Component({
  selector: 'app-historico-detail',
  standalone: true,
  imports: [RouterLink, TipoBadge],
  templateUrl: './historico-detail.html',
})
export class HistoricoDetail {
  faturaId = input.required<string>();

  private readonly faturasStore = inject(FaturasStore);
  private readonly debitosStore = inject(DebitosStore);
  private readonly cartoesStore = inject(CartoesStore);
  private readonly pessoasStore = inject(PessoasStore);
  private readonly categoriasStore = inject(CategoriasStore);

  protected readonly centavosParaBRL = centavosParaBRL;
  protected readonly formatarMes = formatarMes;

  protected readonly fatura = computed(() => this.faturasStore.porId(this.faturaId()));
  protected readonly cartao = computed(() => {
    const f = this.fatura();
    return f ? this.cartoesStore.porId(f.cartaoId) : undefined;
  });
  protected readonly debitos = computed(() => this.debitosStore.porFatura(this.faturaId()));
  protected readonly total = computed(() => this.debitos().reduce((s, d) => s + d.valor, 0));

  protected nomePessoa(id?: string): string {
    return id ? (this.pessoasStore.porId(id)?.nome ?? 'Pessoa removida') : 'Sem pessoa';
  }

  protected nomeCategoria(id?: string): string {
    return id ? (this.categoriasStore.porId(id)?.nome ?? 'Categoria removida') : 'Sem categoria';
  }
}
