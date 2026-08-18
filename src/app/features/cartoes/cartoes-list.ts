import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartoesStore, RascunhoCartao } from '../../core/store/cartoes.store';
import { FaturasStore } from '../../core/store/faturas.store';
import { DialogService } from '../../shared/services/dialog.service';
import { mensagemErro } from '../../core/http/mensagem-erro';
import { Cartao } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton';

type StatusFatura = 'aberta' | 'fechada' | 'nenhuma';

const RASCUNHO_VAZIO: RascunhoCartao = {
  nome: '',
  codigo: '',
  corCaracteristica: '#c9a24b',
  dataFechamento: 1,
  dataVencimento: 10,
};

@Component({
  selector: 'app-cartoes-list',
  standalone: true,
  imports: [RouterLink, FormsModule, Skeleton],
  templateUrl: './cartoes-list.html',
})
export class CartoesList {
  protected readonly store = inject(CartoesStore);
  private readonly faturas = inject(FaturasStore);
  private readonly dialog = inject(DialogService);

  protected readonly carregando = signal(true);
  protected readonly statusPorCartao = signal<Record<string, StatusFatura>>({});

  protected readonly editandoId = signal<string | null>(null);
  protected readonly mostrarForm = signal(false);
  protected rascunho: RascunhoCartao = { ...RASCUNHO_VAZIO };

  constructor() {
    void this.carregar();
  }

  private async carregar(): Promise<void> {
    this.carregando.set(true);
    await this.store.carregar();
    await this.carregarStatusFaturas();
    this.carregando.set(false);
  }

  private async carregarStatusFaturas(): Promise<void> {
    const entradas = await Promise.all(
      this.store.cartoes().map(async (c): Promise<[string, StatusFatura]> => {
        const aberta = await this.faturas.aberta(c.id);
        if (aberta) return [c.id, 'aberta'];
        const todas = await this.faturas.doCartao(c.id);
        return [c.id, todas.length > 0 ? 'fechada' : 'nenhuma'];
      }),
    );
    this.statusPorCartao.set(Object.fromEntries(entradas));
  }

  protected statusFatura(cartaoId: string): StatusFatura {
    return this.statusPorCartao()[cartaoId] ?? 'nenhuma';
  }

  protected novo(): void {
    this.rascunho = { ...RASCUNHO_VAZIO };
    this.editandoId.set(null);
    this.mostrarForm.set(true);
  }

  protected editar(c: Cartao): void {
    this.rascunho = {
      nome: c.nome,
      codigo: c.codigo,
      corCaracteristica: c.corCaracteristica,
      dataFechamento: c.dataFechamento,
      dataVencimento: c.dataVencimento,
    };
    this.editandoId.set(c.id);
    this.mostrarForm.set(true);
  }

  protected cancelar(): void {
    this.mostrarForm.set(false);
    this.editandoId.set(null);
  }

  protected async salvar(): Promise<void> {
    if (!this.rascunho.nome.trim() || !/^[A-Za-z]{3}$/.test(this.rascunho.codigo.trim())) return;
    this.rascunho.codigo = this.rascunho.codigo.trim().toUpperCase();
    try {
      const id = this.editandoId();
      if (id) {
        await this.store.atualizar(id, this.rascunho);
      } else {
        const criado = await this.store.criar(this.rascunho);
        this.statusPorCartao.update((atual) => ({ ...atual, [criado.id]: 'nenhuma' }));
      }
      this.cancelar();
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    }
  }

  protected async excluir(c: Cartao): Promise<void> {
    if (!(await this.dialog.confirm(`Excluir o cartão "${c.nome}"?`))) return;
    try {
      await this.store.remover(c.id);
      this.statusPorCartao.update((atual) => {
        const { [c.id]: _removido, ...resto } = atual;
        return resto;
      });
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    }
  }
}
