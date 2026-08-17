import { Component, inject } from '@angular/core';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-dialog-host',
  standalone: true,
  template: `
    @if (dialog.estado(); as d) {
      <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div
          class="max-w-sm w-full rounded-[10px] border border-hair p-5"
          [style.background]="'linear-gradient(155deg, var(--color-panel-2), var(--color-panel))'"
        >
          <p class="text-sm text-ink mb-5">{{ d.mensagem }}</p>
          <div class="flex gap-2 justify-end">
            @if (d.tipo === 'confirm') {
              <button
                type="button"
                (click)="dialog.responder(false)"
                class="text-sm font-semibold text-ink-soft px-4 py-2 rounded-md hover:text-ink transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="dialog.responder(true)"
                class="text-sm font-semibold bg-teal text-bg px-4 py-2 rounded-md hover:opacity-90 transition"
              >
                Confirmar
              </button>
            } @else {
              <button
                type="button"
                (click)="dialog.responder(true)"
                class="text-sm font-semibold bg-brass text-bg px-4 py-2 rounded-md hover:opacity-90 transition"
              >
                Ok
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class DialogHost {
  protected readonly dialog = inject(DialogService);
}
