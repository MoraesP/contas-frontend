import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const CHAVE_TOKEN = 'contas.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly _token = signal<string | null>(localStorage.getItem(CHAVE_TOKEN));

  readonly token = this._token.asReadonly();
  readonly autenticado = computed(() => this._token() !== null);

  async login(email: string, senha: string): Promise<void> {
    const resposta = await firstValueFrom(
      this.http.post<{ token: string }>(`${environment.apiBaseUrl}/auth/login`, { email, senha }),
    );
    this._token.set(resposta.token);
    localStorage.setItem(CHAVE_TOKEN, resposta.token);
  }

  logout(): void {
    this._token.set(null);
    localStorage.removeItem(CHAVE_TOKEN);
  }
}
