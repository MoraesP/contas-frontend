import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type StatusCartaoMensal = 'aberta' | 'fechada' | 'sem_fatura';

export interface TotalPorPessoaMensal {
  id: string;
  nome: string;
  total: number;
}

export interface CartaoResumoMensal {
  cartaoId: string;
  faturaId?: string;
  nome: string;
  corCaracteristica: string;
  status: StatusCartaoMensal;
  total: number;
  porPessoa: TotalPorPessoaMensal[];
}

export interface ResumoMensal {
  mesReferencia: string;
  totalGeral: number;
  cartoes: CartaoResumoMensal[];
}

const URL = `${environment.apiBaseUrl}/dashboard/mensal`;

@Injectable({ providedIn: 'root' })
export class MensalService {
  private readonly http = inject(HttpClient);

  async buscar(mesReferencia: string): Promise<ResumoMensal> {
    return firstValueFrom(this.http.get<ResumoMensal>(URL, { params: { mes: mesReferencia } }));
  }
}
