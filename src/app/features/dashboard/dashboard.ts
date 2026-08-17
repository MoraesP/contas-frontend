import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardDataService } from './dashboard-data.service';
import { centavosParaBRL } from '../../shared/utils/currency';
import { TipoBadge } from '../../shared/components/tipo-badge';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, TipoBadge],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly data = inject(DashboardDataService);
  protected readonly centavosParaBRL = centavosParaBRL;

  protected larguraBarra(total: number, maximo: number): string {
    if (maximo === 0) return '0%';
    return `${(total / maximo) * 100}%`;
  }

  protected maiorTotal(totais: { total: number }[]): number {
    return Math.max(1, ...totais.map((t) => t.total));
  }
}
