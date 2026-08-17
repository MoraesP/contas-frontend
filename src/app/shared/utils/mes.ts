const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** "2026-08" -> "2026-09" */
export function proximoMes(mesReferencia: string): string {
  const [ano, mes] = mesReferencia.split('-').map(Number);
  const data = new Date(ano, mes, 1); // mes (0-indexado) já aponta pro mês seguinte
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
}

/** "2026-08" -> "Agosto 2026" */
export function formatarMes(mesReferencia: string): string {
  const [ano, mes] = mesReferencia.split('-').map(Number);
  return `${MESES[mes - 1]} ${ano}`;
}

/** Mês corrente no formato "YYYY-MM", usado quando um cartão abre a primeira fatura. */
export function mesAtualIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
