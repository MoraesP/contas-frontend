import { Injectable, computed, inject, signal } from '@angular/core';
import { CartoesStore } from '../../core/store/cartoes.store';
import { PessoasStore } from '../../core/store/pessoas.store';
import { CategoriasStore } from '../../core/store/categorias.store';
import { FaturasStore } from '../../core/store/faturas.store';
import { DebitosStore } from '../../core/store/debitos.store';
import { Debito } from '../../core/models';

export interface DebitoView extends Debito {
  cartaoNome: string;
  cartaoCor: string;
  pessoaNome: string;
  categoriaNome: string;
}

export interface TotalAgrupado {
  id: string;
  nome: string;
  total: number;
}

/**
 * Fonte dos dados do dashboard. Lê direto das stores compartilhadas
 * (core/store/*), não de cópias próprias — assim reflete o que for
 * criado/editado nas telas de cartões, pessoas e faturas.
 *
 * "Mês atual" aqui não é um mês-calendário fixo: como cada cartão abre e
 * fecha seu próprio mês de forma independente (ver docs/specs/faturas.md),
 * o dashboard soma os débitos de todas as faturas com status `aberta` de
 * cada cartão. "Mês anterior" é a última fatura fechada de cada cartão.
 */
@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private readonly cartoesStore = inject(CartoesStore);
  private readonly pessoasStore = inject(PessoasStore);
  private readonly categoriasStore = inject(CategoriasStore);
  private readonly faturasStore = inject(FaturasStore);
  private readonly debitosStore = inject(DebitosStore);

  readonly cartaoSelecionadoId = signal<string | null>(null);

  readonly listaCartoes = computed(() => this.cartoesStore.cartoes());

  private readonly faturaParaCartao = computed(() => {
    const map = new Map<string, string>();
    for (const f of this.faturasStore.faturas()) map.set(f.id, f.cartaoId);
    return map;
  });

  private readonly faturasAbertasIds = computed(
    () => new Set(this.faturasStore.faturas().filter((f) => f.status === 'aberta').map((f) => f.id)),
  );

  private readonly debitosDoMes = computed(() => {
    const abertas = this.faturasAbertasIds();
    return this.debitosStore.debitos().filter((d) => abertas.has(d.faturaId));
  });

  private readonly debitosEnriquecidos = computed<DebitoView[]>(() => {
    const faturaCartao = this.faturaParaCartao();
    const cartoesPorId = new Map(this.cartoesStore.cartoes().map((c) => [c.id, c]));
    const pessoasPorId = new Map(this.pessoasStore.pessoas().map((p) => [p.id, p]));
    const categoriasPorId = new Map(this.categoriasStore.categorias().map((c) => [c.id, c]));

    return this.debitosDoMes().map((d) => {
      const cartaoId = faturaCartao.get(d.faturaId);
      const cartao = cartaoId ? cartoesPorId.get(cartaoId) : undefined;
      return {
        ...d,
        cartaoNome: cartao?.nome ?? 'Cartão desconhecido',
        cartaoCor: cartao?.corCaracteristica ?? '#8E8B85',
        pessoaNome: d.pessoaId ? (pessoasPorId.get(d.pessoaId)?.nome ?? 'Pessoa removida') : 'Sem pessoa',
        categoriaNome: d.categoriaId
          ? (categoriasPorId.get(d.categoriaId)?.nome ?? 'Categoria removida')
          : 'Sem categoria',
      };
    });
  });

  readonly debitosVisiveis = computed<DebitoView[]>(() => {
    const id = this.cartaoSelecionadoId();
    const todos = this.debitosEnriquecidos();
    return id ? todos.filter((d) => this.faturaParaCartao().get(d.faturaId) === id) : todos;
  });

  readonly totalMes = computed(() => this.debitosEnriquecidos().reduce((s, d) => s + d.valor, 0));

  readonly totalCartaoSelecionadoOuMes = computed(() => {
    const id = this.cartaoSelecionadoId();
    return id ? this.totalPorCartao(id) : this.totalMes();
  });

  readonly totalMesAnterior = computed(() => {
    let total = 0;
    for (const c of this.cartoesStore.cartoes()) {
      const anterior = this.faturasStore.ultimaFechada(c.id);
      if (anterior) total += this.debitosStore.porFatura(anterior.id).reduce((s, d) => s + d.valor, 0);
    }
    return total;
  });

  readonly variacaoPercentual = computed(() => {
    const anterior = this.totalMesAnterior();
    return anterior === 0 ? 0 : ((this.totalMes() - anterior) / anterior) * 100;
  });

  readonly porCategoria = computed<TotalAgrupado[]>(() => this.agruparPor('categoriaId', 'categoriaNome'));
  readonly porPessoa = computed<TotalAgrupado[]>(() => this.agruparPor('pessoaId', 'pessoaNome'));

  readonly cartaoSelecionado = computed(() => {
    const id = this.cartaoSelecionadoId();
    return id ? (this.cartoesStore.cartoes().find((c) => c.id === id) ?? null) : null;
  });

  totalPorCartao(cartaoId: string): number {
    const faturaCartao = this.faturaParaCartao();
    return this.debitosEnriquecidos()
      .filter((d) => faturaCartao.get(d.faturaId) === cartaoId)
      .reduce((s, d) => s + d.valor, 0);
  }

  selecionarCartao(id: string): void {
    this.cartaoSelecionadoId.update((atual) => (atual === id ? null : id));
  }

  private agruparPor(chave: 'categoriaId' | 'pessoaId', nomeChave: 'categoriaNome' | 'pessoaNome'): TotalAgrupado[] {
    const mapa = new Map<string, TotalAgrupado>();
    for (const d of this.debitosVisiveis()) {
      const id = d[chave] ?? 'sem';
      const nome = d[nomeChave];
      const atual = mapa.get(id) ?? { id, nome, total: 0 };
      atual.total += d.valor;
      mapa.set(id, atual);
    }
    return [...mapa.values()].sort((a, b) => b.total - a.total);
  }
}
