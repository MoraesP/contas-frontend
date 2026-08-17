import { Component, input } from '@angular/core';
import { TipoDebito } from '../../core/models';

@Component({
  selector: 'app-tipo-badge',
  standalone: true,
  template: `
    @if (tipo() === 'parcelado') {
      <span class="ml-2 text-[0.68rem] text-brass border border-brass rounded-[3px] px-1.5 py-px">
        {{ parcelaAtual() }}/{{ numeroParcelas() }}
      </span>
    } @else if (tipo() === 'fixo') {
      <span class="ml-2 text-[0.68rem] text-brass border border-brass rounded-[3px] px-1.5 py-px">fixo</span>
    }
  `,
})
export class TipoBadge {
  tipo = input.required<TipoDebito>();
  parcelaAtual = input<number>();
  numeroParcelas = input<number>();
}
