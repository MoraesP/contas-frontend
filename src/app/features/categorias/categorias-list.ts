import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriasStore } from '../../core/store/categorias.store';
import { DialogService } from '../../shared/services/dialog.service';
import { mensagemErro } from '../../core/http/mensagem-erro';
import { Categoria } from '../../core/models';
import { Skeleton } from '../../shared/components/skeleton';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [FormsModule, Skeleton],
  templateUrl: './categorias-list.html',
})
export class CategoriasList {
  protected readonly store = inject(CategoriasStore);
  private readonly dialog = inject(DialogService);

  protected readonly carregando = signal(true);
  protected readonly mostrarForm = signal(false);
  protected nome = '';

  constructor() {
    void this.carregar();
  }

  private async carregar(): Promise<void> {
    this.carregando.set(true);
    await this.store.carregar();
    this.carregando.set(false);
  }

  protected novo(): void {
    this.nome = '';
    this.mostrarForm.set(true);
  }

  protected cancelar(): void {
    this.mostrarForm.set(false);
  }

  protected async salvar(): Promise<void> {
    if (!this.nome.trim()) return;
    try {
      await this.store.criar(this.nome.trim());
      this.cancelar();
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    }
  }

  protected async excluir(c: Categoria): Promise<void> {
    if (!(await this.dialog.confirm(`Excluir "${c.nome}"?`))) return;
    try {
      await this.store.remover(c.id);
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    }
  }
}
