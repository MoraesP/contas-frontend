import { Injectable, signal } from '@angular/core';

interface EstadoDialog {
  tipo: 'confirm' | 'alert';
  mensagem: string;
  resolve: (valor: boolean) => void;
}

/** Substitui confirm()/alert() nativos por um diálogo no estilo do app. */
@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly estado = signal<EstadoDialog | null>(null);

  confirm(mensagem: string): Promise<boolean> {
    return new Promise((resolve) => this.estado.set({ tipo: 'confirm', mensagem, resolve }));
  }

  alert(mensagem: string): Promise<void> {
    return new Promise((resolve) => this.estado.set({ tipo: 'alert', mensagem, resolve: () => resolve() }));
  }

  responder(valor: boolean): void {
    this.estado()?.resolve(valor);
    this.estado.set(null);
  }
}
