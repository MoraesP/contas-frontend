import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartoesStore } from '../../core/store/cartoes.store';
import { FaturasStore } from '../../core/store/faturas.store';
import { DebitosStore } from '../../core/store/debitos.store';
import { CategoriasStore } from '../../core/store/categorias.store';
import { PessoasStore } from '../../core/store/pessoas.store';
import { FaturaWorkflowService } from './fatura-workflow.service';
import { DialogService } from '../../shared/services/dialog.service';
import { mensagemErro } from '../../core/http/mensagem-erro';
import { centavosParaBRL } from '../../shared/utils/currency';
import { formatarMes, mesAtualIso, proximoMes } from '../../shared/utils/mes';
import { TipoBadge } from '../../shared/components/tipo-badge';
import { Skeleton } from '../../shared/components/skeleton';
import { Debito, Fatura, TipoDebito } from '../../core/models';

type TipoOrdenacao = 'padrao' | 'valor' | 'pessoa' | 'parcela';

/** Chave usada pra agrupar débitos sem pessoaId (não deveria existir em débitos novos, mas é defensivo). */
const SEM_PESSOA = '__sem_pessoa__';

interface RascunhoDebito {
  descricao: string;
  valorReais: number | null;
  tipo: TipoDebito;
  numeroParcelas: number | null;
  parcelaAtual: number | null;
  pessoaId: string;
  categoriaId: string;
  dataCompra: string;
}

function rascunhoVazio(): RascunhoDebito {
  return {
    descricao: '',
    valorReais: null,
    tipo: 'unico',
    numeroParcelas: null,
    parcelaAtual: null,
    pessoaId: '',
    categoriaId: '',
    dataCompra: new Date().toISOString().slice(0, 10),
  };
}

@Component({
  selector: 'app-fatura-workspace',
  standalone: true,
  imports: [RouterLink, FormsModule, TipoBadge, Skeleton],
  templateUrl: './fatura-workspace.html',
})
export class FaturaWorkspace {
  cartaoId = input.required<string>();

  protected readonly cartoesStore = inject(CartoesStore);
  private readonly faturasStore = inject(FaturasStore);
  private readonly debitosStore = inject(DebitosStore);
  protected readonly categoriasStore = inject(CategoriasStore);
  protected readonly pessoasStore = inject(PessoasStore);
  private readonly workflow = inject(FaturaWorkflowService);
  private readonly dialog = inject(DialogService);

  protected readonly centavosParaBRL = centavosParaBRL;
  protected readonly formatarMes = formatarMes;

  protected readonly cartao = computed(() => this.cartoesStore.porId(this.cartaoId()));

  protected readonly carregando = signal(true);
  protected readonly faturaAberta = signal<Fatura | null>(null);
  protected readonly ultimaFechada = signal<Fatura | null>(null);
  protected readonly historicoDoCartao = signal<Fatura[]>([]);
  protected readonly debitos = signal<Debito[]>([]);
  protected readonly candidatosRolloverDisponiveis = signal<Debito[]>([]);

  protected readonly total = computed(() => this.debitos().reduce((s, d) => s + d.valor, 0));

  // --- filtro por pessoa ---
  protected readonly pessoasFiltroSelecionadas = signal<Set<string>>(new Set());
  protected readonly pessoasNaFatura = computed(() => {
    const mapa = new Map<string, string>();
    for (const d of this.debitos()) {
      const chave = d.pessoaId ?? SEM_PESSOA;
      if (!mapa.has(chave)) mapa.set(chave, this.nomePessoa(d.pessoaId));
    }
    return [...mapa.entries()].map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome));
  });
  protected readonly totalPorPessoa = computed(() => {
    const totais = new Map<string, number>();
    for (const d of this.debitos()) {
      const chave = d.pessoaId ?? SEM_PESSOA;
      totais.set(chave, (totais.get(chave) ?? 0) + d.valor);
    }
    return this.pessoasNaFatura().map((p) => ({ ...p, total: totais.get(p.id) ?? 0 }));
  });
  protected readonly debitosFiltrados = computed(() => {
    const selecionados = this.pessoasFiltroSelecionadas();
    return this.debitos().filter((d) => selecionados.has(d.pessoaId ?? SEM_PESSOA));
  });

  // --- ordenação da lista de débitos ---
  protected readonly ordenacao = signal<TipoOrdenacao>('padrao');
  protected readonly debitosOrdenados = computed(() => {
    const lista = [...this.debitosFiltrados()];
    switch (this.ordenacao()) {
      case 'valor':
        return lista.sort((a, b) => b.valor - a.valor);
      case 'pessoa':
        return lista.sort((a, b) => this.nomePessoa(a.pessoaId).localeCompare(this.nomePessoa(b.pessoaId)));
      case 'parcela':
        return lista.sort((a, b) => this.grupoParcela(a) - this.grupoParcela(b) || (b.numeroParcelas ?? 0) - (a.numeroParcelas ?? 0));
      default:
        return lista;
    }
  });

  private grupoParcela(d: Debito): number {
    if (d.tipo === 'parcelado') return 0;
    if (d.tipo === 'unico') return 1;
    return 2; // fixo
  }

  // --- exclusão em lote ---
  protected readonly mostrarModalExcluirLote = signal(false);
  protected readonly selecionadosExcluirLote = signal<Set<string>>(new Set());

  // --- form de débito (criar/editar) ---
  protected readonly mostrarForm = signal(false);
  protected readonly editandoId = signal<string | null>(null);
  protected rascunho: RascunhoDebito = rascunhoVazio();

  // --- form de abrir novo mês ---
  protected readonly mostrarFormNovoMes = signal(false);
  protected readonly candidatosSelecionados = signal<Set<string>>(new Set());
  protected mesEscolhido = '';

  constructor() {
    void this.cartoesStore.carregar();
    void this.categoriasStore.carregar();
    void this.pessoasStore.carregar();

    effect(() => {
      const id = this.cartaoId();
      void this.carregarFatura(id);
    });
  }

  private async carregarFatura(cartaoId: string): Promise<void> {
    this.carregando.set(true);
    try {
      const [aberta, todas] = await Promise.all([this.faturasStore.aberta(cartaoId), this.faturasStore.doCartao(cartaoId)]);
      this.faturaAberta.set(aberta);
      const fechadas = todas.filter((f) => f.status === 'fechada').sort((a, b) => b.mesReferencia.localeCompare(a.mesReferencia));
      this.historicoDoCartao.set(fechadas);
      this.ultimaFechada.set(fechadas[0] ?? null);
      const lista = aberta ? await this.debitosStore.porFatura(aberta.id) : [];
      this.debitos.set(lista);
      this.pessoasFiltroSelecionadas.set(new Set(lista.map((d) => d.pessoaId ?? SEM_PESSOA)));
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
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

  protected togglePessoaFiltro(id: string): void {
    this.pessoasFiltroSelecionadas.update((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  protected async iniciarNovoMes(): Promise<void> {
    const anterior = this.ultimaFechada();
    this.mesEscolhido = anterior ? proximoMes(anterior.mesReferencia) : mesAtualIso();
    const candidatos = await this.workflow.candidatosRollover(this.cartaoId());
    this.candidatosRolloverDisponiveis.set(candidatos);
    this.candidatosSelecionados.set(new Set(candidatos.map((d) => d.id)));
    this.mostrarFormNovoMes.set(true);
  }

  protected cancelarNovoMes(): void {
    this.mostrarFormNovoMes.set(false);
  }

  protected toggleCandidato(id: string): void {
    this.candidatosSelecionados.update((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  protected async confirmarNovoMes(): Promise<void> {
    if (!this.mesEscolhido) return;
    try {
      await this.workflow.abrirNovoMes(this.cartaoId(), this.mesEscolhido, [...this.candidatosSelecionados()]);
      this.mostrarFormNovoMes.set(false);
      await this.carregarFatura(this.cartaoId());
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    }
  }

  protected async fecharFatura(): Promise<void> {
    const fatura = this.faturaAberta();
    if (!fatura) return;
    const confirmado = await this.dialog.confirm(
      'Fechar esta fatura? Depois de fechada não é mais possível adicionar, editar ou remover débitos dela.',
    );
    if (!confirmado) return;
    try {
      await this.workflow.fechar(fatura.id);
      await this.carregarFatura(this.cartaoId());
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    }
  }

  protected novoDebito(): void {
    this.rascunho = rascunhoVazio();
    this.editandoId.set(null);
    this.mostrarForm.set(true);
  }

  protected editarDebito(d: Debito): void {
    this.rascunho = {
      descricao: d.descricao,
      valorReais: d.valor / 100,
      tipo: d.tipo,
      numeroParcelas: d.numeroParcelas ?? null,
      parcelaAtual: d.parcelaAtual ?? null,
      pessoaId: d.pessoaId ?? '',
      categoriaId: d.categoriaId ?? '',
      dataCompra: d.dataCompra.slice(0, 10),
    };
    this.editandoId.set(d.id);
    this.mostrarForm.set(true);
  }

  protected cancelar(): void {
    this.mostrarForm.set(false);
    this.editandoId.set(null);
  }

  protected async salvarDebito(): Promise<void> {
    const fatura = this.faturaAberta();
    if (!fatura || !this.rascunho.descricao.trim() || !this.rascunho.valorReais || !this.rascunho.pessoaId) return;

    try {
      const editandoId = this.editandoId();
      if (editandoId) {
        // Em edição, o valor informado é o desta parcela/débito específico —
        // tipo, valorTotal e número de parcelas ficam travados (não fazem
        // sentido mudar depois que a compra já foi lançada).
        await this.debitosStore.atualizar(editandoId, {
          descricao: this.rascunho.descricao.trim(),
          valor: Math.round(this.rascunho.valorReais * 100),
          pessoaId: this.rascunho.pessoaId,
          categoriaId: this.rascunho.categoriaId || undefined,
          dataCompra: this.rascunho.dataCompra,
        });
      } else {
        const base = {
          descricao: this.rascunho.descricao.trim(),
          pessoaId: this.rascunho.pessoaId,
          categoriaId: this.rascunho.categoriaId || undefined,
          dataCompra: this.rascunho.dataCompra,
        };

        if (this.rascunho.tipo === 'parcelado') {
          await this.debitosStore.criar(fatura.id, {
            ...base,
            tipo: 'parcelado',
            valorTotal: Math.round(this.rascunho.valorReais * 100),
            numeroParcelas: this.rascunho.numeroParcelas ?? 2,
            parcelaAtual: this.rascunho.parcelaAtual ?? undefined,
          });
        } else {
          await this.debitosStore.criar(fatura.id, {
            ...base,
            tipo: this.rascunho.tipo,
            valor: Math.round(this.rascunho.valorReais * 100),
          });
        }
      }
      this.cancelar();
      await this.carregarFatura(this.cartaoId());
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    }
  }

  protected async removerDebito(d: Debito): Promise<void> {
    if (!(await this.dialog.confirm(`Remover "${d.descricao}"?`))) return;
    try {
      await this.debitosStore.remover(d.id);
      await this.carregarFatura(this.cartaoId());
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    }
  }

  protected abrirModalExcluirLote(): void {
    this.selecionadosExcluirLote.set(new Set());
    this.mostrarModalExcluirLote.set(true);
  }

  protected fecharModalExcluirLote(): void {
    this.mostrarModalExcluirLote.set(false);
  }

  protected toggleSelecaoExcluirLote(id: string): void {
    this.selecionadosExcluirLote.update((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  protected marcarTodosExcluirLote(): void {
    this.selecionadosExcluirLote.set(new Set(this.debitos().map((d) => d.id)));
  }

  protected desmarcarTodosExcluirLote(): void {
    this.selecionadosExcluirLote.set(new Set());
  }

  protected async confirmarExclusaoLote(): Promise<void> {
    const ids = [...this.selecionadosExcluirLote()];
    if (ids.length === 0) return;
    const confirmado = await this.dialog.confirm(
      `Excluir ${ids.length} ${ids.length === 1 ? 'débito' : 'débitos'}? Essa ação não pode ser desfeita.`,
    );
    if (!confirmado) return;
    try {
      await Promise.all(ids.map((id) => this.debitosStore.remover(id)));
      this.mostrarModalExcluirLote.set(false);
      await this.carregarFatura(this.cartaoId());
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    }
  }
}
