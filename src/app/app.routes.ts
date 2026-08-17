import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { CartoesList } from './features/cartoes/cartoes-list';
import { PessoasList } from './features/pessoas/pessoas-list';
import { FaturaWorkspace } from './features/faturas/fatura-workspace';
import { HistoricoList } from './features/faturas/historico-list';
import { HistoricoDetail } from './features/faturas/historico-detail';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'cartoes', component: CartoesList },
  { path: 'cartoes/:cartaoId/fatura', component: FaturaWorkspace },
  { path: 'pessoas', component: PessoasList },
  { path: 'historico', component: HistoricoList },
  { path: 'historico/:faturaId', component: HistoricoDetail },
];