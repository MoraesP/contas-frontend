import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PessoasStore, RascunhoPessoa } from '../../core/store/pessoas.store';
import { DialogService } from '../../shared/services/dialog.service';
import { mensagemErro } from '../../core/http/mensagem-erro';
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
  private readonly dialog = inject(DialogService);

  protected readonly carregando = signal(true);
  protected readonly editandoId = signal<string | null>(null);
  protected readonly mostrarForm = signal(false);
  protected rascunho: RascunhoPessoa = { ...RASCUNHO_VAZIO };

  constructor() {
    void this.carregar();
  }

  private async carregar(): Promise<void> {
    this.carregando.set(true);
    await this.store.carregar();
    this.carregando.set(false);
  }

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

  protected async salvar(): Promise<void> {
    if (!this.rascunho.nome.trim()) return;
    try {
      const id = this.editandoId();
      if (id) {
        await this.store.atualizar(id, this.rascunho);
      } else {
        await this.store.criar(this.rascunho);
      }
      this.cancelar();
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    }
  }

  protected async excluir(p: Pessoa): Promise<void> {
    if (!(await this.dialog.confirm(`Excluir "${p.nome}"?`))) return;
    try {
      await this.store.remover(p.id);
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    }
  }
}
