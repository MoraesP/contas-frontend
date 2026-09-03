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

/** Data ISO (ex: "2026-08-05T00:00:00.000Z") -> "05/08/2026". */
export function formatarDataCurta(dataIso: string): string {
  const d = new Date(dataIso);
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getUTCFullYear()}`;
}
