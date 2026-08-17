import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { mensagemErro } from '../../core/http/mensagem-erro';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected senha = '';
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected async entrar(): Promise<void> {
    if (!this.email.trim() || !this.senha) return;
    this.carregando.set(true);
    this.erro.set(null);
    try {
      await this.auth.login(this.email.trim(), this.senha);
      await this.router.navigateByUrl('/');
    } catch (e) {
      this.erro.set(mensagemErro(e));
    } finally {
      this.carregando.set(false);
    }
  }
}
