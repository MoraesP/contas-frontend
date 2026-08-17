import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PessoasStore, RascunhoPessoa } from '../../core/store/pessoas.store';
import { DebitosStore } from '../../core/store/debitos.store';
import { DialogService } from '../../shared/services/dialog.service';
import { Pessoa } from '../../core/models';

const RASCUNHO_VAZIO: RascunhoPessoa = { nome: '', cor: '#3fada0' };

@Component({
  selector: 'app-pessoas-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pessoas-list.html',
})
export class PessoasList {
  protected readonly store = inject(PessoasStore);
  private readonly debitos = inject(DebitosStore);
  private readonly dialog = inject(DialogService);

  protected readonly editandoId = signal<string | null>(null);
  protected readonly mostrarForm = signal(false);
  protected rascunho: RascunhoPessoa = { ...RASCUNHO_VAZIO };

  protected novo(): void {
    this.rascunho = { ...RASCUNHO_VAZIO };
    this.editandoId.set(null);
    this.mostrarForm.set(true);
  }

  protected editar(p: Pessoa): void {
    this.rascunho = { nome: p.nome, cor: p.cor };
    this.editandoId.set(p.id);
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

  protected async excluir(p: Pessoa): Promise<void> {
    const usada = this.debitos.debitos().some((d) => d.pessoaId === p.id);
    if (usada) {
      await this.dialog.alert(`Não é possível excluir "${p.nome}": ela está associada a débitos existentes.`);
      return;
    }
    if (await this.dialog.confirm(`Excluir "${p.nome}"?`)) {
      this.store.remover(p.id);
    }
  }
}
