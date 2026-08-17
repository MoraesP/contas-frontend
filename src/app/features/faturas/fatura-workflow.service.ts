import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { normalizarId } from '../../core/http/normalizar-id';
import { Debito, Fatura } from '../../core/models';

const URL_CARTOES = `${environment.apiBaseUrl}/cartoes`;
const URL_FATURAS = `${environment.apiBaseUrl}/faturas`;

/** Fachada fina sobre os endpoints de abrir/fechar fatura — ver docs/specs/faturas.md. */
@Injectable({ providedIn: 'root' })
export class FaturaWorkflowService {
  private readonly http = inject(HttpClient);

  async candidatosRollover(cartaoId: string): Promise<Debito[]> {
    const lista = await firstValueFrom(
      this.http.get<Record<string, unknown>[]>(`${URL_CARTOES}/${cartaoId}/faturas/candidatos-rollover`),
    );
    return lista.map((d) => normalizarId<Debito>(d));
  }

  async abrirNovoMes(cartaoId: string, mesReferencia: string, idsParaRolar: string[]): Promise<Fatura> {
    const doc = await firstValueFrom(
      this.http.post<Record<string, unknown>>(`${URL_CARTOES}/${cartaoId}/faturas`, { mesReferencia, idsParaRolar }),
    );
    return normalizarId<Fatura>(doc);
  }

  async fechar(faturaId: string): Promise<void> {
    await firstValueFrom(this.http.post(`${URL_FATURAS}/${faturaId}/fechar`, {}));
  }
}
