import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ErroLinhaImportacao {
  linha: number;
  motivo: string;
}

export interface RelatorioImportacao {
  fatura: { id: string; cartaoId: string; mesReferencia: string; status: string };
  importados: number;
  erros: ErroLinhaImportacao[];
}

const URL = `${environment.apiBaseUrl}/importacoes`;

@Injectable({ providedIn: 'root' })
export class ImportacaoService {
  private readonly http = inject(HttpClient);

  async importar(arquivo: File): Promise<RelatorioImportacao> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return firstValueFrom(this.http.post<RelatorioImportacao>(URL, formData));
  }
}
