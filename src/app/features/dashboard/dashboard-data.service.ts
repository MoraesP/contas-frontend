import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartoesStore } from '../../core/store/cartoes.store';
import { TipoDebito } from '../../core/models';

export interface DebitoDashboard {
  id: string;
  descricao: string;
  valor: number;
  dataCompra: string;
  tipo: TipoDebito;
  parcelaAtual?: number;
  numeroParcelas?: number;
  cartaoId: string;
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

interface RespostaDashboard {
  totalMes: number;
  totalMesAnterior: number;
  variacaoPercentual: number;
  porCartao: TotalAgrupado[];
  porCategoria: TotalAgrupado[];
  porPessoa: TotalAgrupado[];
  debitos: DebitoDashboard[];
}

const URL = `${environment.apiBaseUrl}/dashboard`;

/**
 * Busca o dashboard pronto do backend (agregação sobre faturas abertas — ver
 * docs/specs/dashboard.md) numa tacada só, e filtra por cartão selecionado
 * no cliente, sobre os dados já carregados — sem round-trip a cada clique.
 */
@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private readonly http = inject(HttpClient);
  private readonly cartoesStore = inject(CartoesStore);

  private readonly _dados = signal<RespostaDashboard | null>(null);
  readonly carregando = signal(false);
  readonly cartaoSelecionadoId = signal<string | null>(null);

  /** null = ordem original (a que veio da API); 'asc'/'desc' = por dataCompra. */
  readonly ordenacaoData = signal<'asc' | 'desc' | null>(null);

  toggleOrdenacaoData(): void {
    this.ordenacaoData.update((atual) => (atual === null ? 'desc' : atual === 'desc' ? 'asc' : null));
  }

  async carregar(): Promise<void> {
    this.carregando.set(true);
    try {
      const dados = await firstValueFrom(this.http.get<RespostaDashboard>(URL));
      this._dados.set(dados);
    } finally {
      this.carregando.set(false);
    }
  }

  readonly listaCartoes = computed(() => this.cartoesStore.cartoes());

  readonly debitosVisiveis = computed<DebitoDashboard[]>(() => {
    const dados = this._dados();
    if (!dados) return [];
    const id = this.cartaoSelecionadoId();
    const lista = id ? dados.debitos.filter((d) => d.cartaoId === id) : dados.debitos;

    const ordem = this.ordenacaoData();
    if (!ordem) return lista;
    return [...lista].sort((a, b) => {
      const diff = new Date(a.dataCompra).getTime() - new Date(b.dataCompra).getTime();
      return ordem === 'asc' ? diff : -diff;
    });
  });

  readonly totalMes = computed(() => this._dados()?.totalMes ?? 0);
  readonly variacaoPercentual = computed(() => this._dados()?.variacaoPercentual ?? 0);

  readonly totalCartaoSelecionadoOuMes = computed(() => {
    const id = this.cartaoSelecionadoId();
    return id ? this.totalPorCartao(id) : this.totalMes();
  });

  readonly porCategoria = computed<TotalAgrupado[]>(() => this.agruparVisiveis('categoriaNome'));
  readonly porPessoa = computed<TotalAgrupado[]>(() => this.agruparVisiveis('pessoaNome'));

  readonly cartaoSelecionado = computed(() => {
    const id = this.cartaoSelecionadoId();
    return id ? (this.cartoesStore.porId(id) ?? null) : null;
  });

  totalPorCartao(cartaoId: string): number {
    return this._dados()?.porCartao.find((c) => c.id === cartaoId)?.total ?? 0;
  }

  selecionarCartao(id: string): void {
    this.cartaoSelecionadoId.update((atual) => (atual === id ? null : id));
  }

  private agruparVisiveis(chaveNome: 'categoriaNome' | 'pessoaNome'): TotalAgrupado[] {
    const mapa = new Map<string, TotalAgrupado>();
    for (const d of this.debitosVisiveis()) {
      const nome = d[chaveNome];
      const atual = mapa.get(nome) ?? { id: nome, nome, total: 0 };
      atual.total += d.valor;
      mapa.set(nome, atual);
    }
    return [...mapa.values()].sort((a, b) => b.total - a.total);
  }
}
