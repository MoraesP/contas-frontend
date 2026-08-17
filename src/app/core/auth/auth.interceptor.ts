import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/** Injeta o Bearer token nas chamadas à nossa API e desloga em caso de 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const paraApi = req.url.startsWith(environment.apiBaseUrl);
  const token = auth.token();

  const requisicao = paraApi && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      if (paraApi && erro instanceof HttpErrorResponse && erro.status === 401) {
        auth.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => erro);
    }),
  );
};
