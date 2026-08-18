import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImportacaoService, RelatorioImportacao } from './importacao.service';
import { mensagemErro } from '../../core/http/mensagem-erro';
import { formatarMes } from '../../shared/utils/mes';

@Component({
  selector: 'app-importacao',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './importacao.html',
})
export class Importacao {
  private readonly service = inject(ImportacaoService);

  protected readonly formatarMes = formatarMes;
  protected readonly arquivoSelecionado = signal<File | null>(null);
  protected readonly enviando = signal(false);
  protected readonly erroGeral = signal<string | null>(null);
  protected readonly relatorio = signal<RelatorioImportacao | null>(null);

  protected selecionarArquivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.arquivoSelecionado.set(input.files?.[0] ?? null);
    this.relatorio.set(null);
    this.erroGeral.set(null);
  }

  protected async importar(): Promise<void> {
    const arquivo = this.arquivoSelecionado();
    if (!arquivo) return;

    this.enviando.set(true);
    this.erroGeral.set(null);
    this.relatorio.set(null);
    try {
      const resultado = await this.service.importar(arquivo);
      this.relatorio.set(resultado);
    } catch (e) {
      this.erroGeral.set(mensagemErro(e));
    } finally {
      this.enviando.set(false);
    }
  }

  protected novaImportacao(): void {
    this.arquivoSelecionado.set(null);
    this.relatorio.set(null);
    this.erroGeral.set(null);
  }
}
