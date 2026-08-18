import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { CartoesList } from './features/cartoes/cartoes-list';
import { PessoasList } from './features/pessoas/pessoas-list';
import { CategoriasList } from './features/categorias/categorias-list';
import { Importacao } from './features/importacao/importacao';
import { FaturaWorkspace } from './features/faturas/fatura-workspace';
import { HistoricoList } from './features/faturas/historico-list';
import { HistoricoDetail } from './features/faturas/historico-detail';
import { Login } from './features/auth/login';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', component: Dashboard, canActivate: [authGuard] },
  { path: 'cartoes', component: CartoesList, canActivate: [authGuard] },
  { path: 'cartoes/:cartaoId/fatura', component: FaturaWorkspace, canActivate: [authGuard] },
  { path: 'pessoas', component: PessoasList, canActivate: [authGuard] },
  { path: 'categorias', component: CategoriasList, canActivate: [authGuard] },
  { path: 'importar', component: Importacao, canActivate: [authGuard] },
  { path: 'historico', component: HistoricoList, canActivate: [authGuard] },
  { path: 'historico/:faturaId', component: HistoricoDetail, canActivate: [authGuard] },
];
