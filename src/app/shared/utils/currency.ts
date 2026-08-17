/** Converte centavos (inteiro, como o backend armazena) para uma string em BRL. */
export function centavosParaBRL(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
