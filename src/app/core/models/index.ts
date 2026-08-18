export interface Cartao {
  id: string;
  nome: string;
  corCaracteristica: string;
  dataFechamento: number;
  dataVencimento: number;
}

export interface Pessoa {
  id: string;
  nome: string;
}

export interface Categoria {
  id: string;
  nome: string;
}

export type StatusFatura = 'aberta' | 'fechada';

export interface Fatura {
  id: string;
  cartaoId: string;
  mesReferencia: string; // "YYYY-MM"
  status: StatusFatura;
  dataFechamentoReal?: string;
}

export type TipoDebito = 'fixo' | 'parcelado' | 'unico';

export interface Debito {
  id: string;
  faturaId: string;
  pessoaId?: string;
  categoriaId?: string;
  descricao: string;
  valor: number; // centavos
  dataCompra: string;
  tipo: TipoDebito;
  // apenas quando tipo === 'parcelado'
  valorTotal?: number;
  numeroParcelas?: number;
  parcelaAtual?: number;
  compraId?: string;
}
