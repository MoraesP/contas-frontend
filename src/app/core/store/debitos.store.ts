import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { normalizarId } from '../http/normalizar-id';
import { Debito, TipoDebito } from '../models';

const URL_FATURAS = `${environment.apiBaseUrl}/faturas`;
const URL_DEBITOS = `${environment.apiBaseUrl}/debitos`;

interface CamposComuns {
  descricao: string;
  dataCompra: string;
  pessoaId?: string;
  categoriaId?: string;
}

export type NovoDebito =
  | (CamposComuns & { tipo: Exclude<TipoDebito, 'parcelado'>; valor: number })
  | (CamposComuns & { tipo: 'parcelado'; valorTotal: number; numeroParcelas: number });

export interface PatchDebito {
  descricao?: string;
  valor?: number;
  pessoaId?: string;
  categoriaId?: string;
  dataCompra?: string;
}

@Injectable({ providedIn: 'root' })
export class DebitosStore {
  private readonly http = inject(HttpClient);

  async porFatura(faturaId: string): Promise<Debito[]> {
    const lista = await firstValueFrom(
      this.http.get<Record<string, unknown>[]>(`${URL_FATURAS}/${faturaId}/debitos`),
    );
    return lista.map((d) => normalizarId<Debito>(d));
  }

  async criar(faturaId: string, dados: NovoDebito): Promise<Debito> {
    const doc = await firstValueFrom(
      this.http.post<Record<string, unknown>>(`${URL_FATURAS}/${faturaId}/debitos`, dados),
    );
    return normalizarId<Debito>(doc);
  }

  async atualizar(id: string, patch: PatchDebito): Promise<Debito> {
    const doc = await firstValueFrom(this.http.put<Record<string, unknown>>(`${URL_DEBITOS}/${id}`, patch));
    return normalizarId<Debito>(doc);
  }

  async remover(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${URL_DEBITOS}/${id}`));
  }
}
