/** Gera um id local (mock). Quando a API real existir, o backend passa a gerar os ids. */
export function novoId(prefixo: string): string {
  return `${prefixo}-${crypto.randomUUID().slice(0, 8)}`;
}
