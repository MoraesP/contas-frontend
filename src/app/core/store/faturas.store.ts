import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { normalizarId } from '../http/normalizar-id';
import { Debito, Fatura } from '../models';

const URL_CARTOES = `${environment.apiBaseUrl}/cartoes`;
const URL_FATURAS = `${environment.apiBaseUrl}/faturas`;

/**
 * Não existe endpoint pra "todas as faturas" — diferente de Cartão/Pessoa/
 * Categoria, não dá pra manter um cache global aqui. Cada método busca sob
 * demanda; quem consome guarda o resultado num signal local (ver
 * fatura-workspace.ts, historico-list.ts, historico-detail.ts).
 */
@Injectable({ providedIn: 'root' })
export class FaturasStore {
  private readonly http = inject(HttpClient);

  async doCartao(cartaoId: string): Promise<Fatura[]> {
    const lista = await firstValueFrom(
      this.http.get<Record<string, unknown>[]>(`${URL_CARTOES}/${cartaoId}/faturas`),
    );
    return lista.map((d) => normalizarId<Fatura>(d));
  }

  async aberta(cartaoId: string): Promise<Fatura | null> {
    try {
      const doc = await firstValueFrom(
        this.http.get<Record<string, unknown>>(`${URL_CARTOES}/${cartaoId}/faturas/aberta`),
      );
      return normalizarId<Fatura>(doc);
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) return null;
      throw e;
    }
  }

  async fechadas(filtro?: { cartaoId?: string }): Promise<Fatura[]> {
    const params = new URLSearchParams({ status: 'fechada' });
    if (filtro?.cartaoId) params.set('cartaoId', filtro.cartaoId);
    const lista = await firstValueFrom(this.http.get<Record<string, unknown>[]>(`${URL_FATURAS}?${params}`));
    return lista.map((d) => normalizarId<Fatura>(d));
  }

  async porId(id: string): Promise<Fatura & { debitos: Debito[] }> {
    const doc = await firstValueFrom(
      this.http.get<Record<string, unknown> & { debitos: Record<string, unknown>[] }>(`${URL_FATURAS}/${id}`),
    );
    const { debitos, ...resto } = doc;
    return {
      ...normalizarId<Fatura>(resto),
      debitos: debitos.map((d) => normalizarId<Debito>(d)),
    };
  }
}
