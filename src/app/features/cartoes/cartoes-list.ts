import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartoesStore, RascunhoCartao } from '../../core/store/cartoes.store';
import { FaturasStore } from '../../core/store/faturas.store';
import { DialogService } from '../../shared/services/dialog.service';
import { Cartao } from '../../core/models';

const RASCUNHO_VAZIO: RascunhoCartao = {
  nome: '',
  corCaracteristica: '#c9a24b',
  dataFechamento: 1,
  dataVencimento: 10,
};

@Component({
  selector: 'app-cartoes-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './cartoes-list.html',
})
export class CartoesList {
  protected readonly store = inject(CartoesStore);
  protected readonly faturas = inject(FaturasStore);
  private readonly dialog = inject(DialogService);

  protected readonly editandoId = signal<string | null>(null);
  protected readonly mostrarForm = signal(false);
  protected rascunho: RascunhoCartao = { ...RASCUNHO_VAZIO };

  protected statusFatura(cartaoId: string): 'aberta' | 'fechada' | 'nenhuma' {
    if (this.faturas.aberta(cartaoId)) return 'aberta';
    return this.faturas.doCartao(cartaoId).length > 0 ? 'fechada' : 'nenhuma';
  }

  protected novo(): void {
    this.rascunho = { ...RASCUNHO_VAZIO };
    this.editandoId.set(null);
    this.mostrarForm.set(true);
  }

  protected editar(c: Cartao): void {
    this.rascunho = {
      nome: c.nome,
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

  protected salvar(): void {
    if (!this.rascunho.nome.trim()) return;
    const id = this.editandoId();
    if (id) {
      this.store.atualizar(id, this.rascunho);
    } else {
      this.store.criar(this.rascunho);
    }
    this.cancelar();
  }

  protected async excluir(c: Cartao): Promise<void> {
    if (this.faturas.doCartao(c.id).length > 0) {
      await this.dialog.alert(`Não é possível excluir "${c.nome}": existem faturas vinculadas a este cartão.`);
      return;
    }
    if (await this.dialog.confirm(`Excluir o cartão "${c.nome}"?`)) {
      this.store.remover(c.id);
    }
  }
}
