import { HttpErrorResponse } from '@angular/common/http';

/** Extrai a mensagem legível de `{ error: { message, code } }` que o backend sempre retorna. */
export function mensagemErro(erro: unknown): string {
  if (erro instanceof HttpErrorResponse) {
    const msg = (erro.error as { error?: { message?: string } } | null)?.error?.message;
    if (msg) return msg;
    if (erro.status === 0) return 'Não foi possível conectar ao servidor. Ele está rodando?';
  }
  return 'Erro inesperado. Tente novamente.';
}
