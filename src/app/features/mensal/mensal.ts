import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MensalService, ResumoMensal } from './mensal.service';
import { DialogService } from '../../shared/services/dialog.service';
import { mensagemErro } from '../../core/http/mensagem-erro';
import { centavosParaBRL } from '../../shared/utils/currency';
import { mesAtualIso } from '../../shared/utils/mes';
import { Skeleton } from '../../shared/components/skeleton';

@Component({
  selector: 'app-mensal',
  standalone: true,
  imports: [FormsModule, RouterLink, Skeleton],
  templateUrl: './mensal.html',
})
export class Mensal {
  private readonly service = inject(MensalService);
  private readonly dialog = inject(DialogService);

  protected readonly centavosParaBRL = centavosParaBRL;
  protected mes = mesAtualIso();

  protected readonly carregando = signal(true);
  protected readonly resumo = signal<ResumoMensal | null>(null);

  constructor() {
    void this.carregar();
  }

  protected async carregar(): Promise<void> {
    if (!this.mes) return;
    this.carregando.set(true);
    try {
      const resultado = await this.service.buscar(this.mes);
      this.resumo.set(resultado);
    } catch (e) {
      await this.dialog.alert(mensagemErro(e));
    } finally {
      this.carregando.set(false);
    }
  }
}
