import { Cartao, Categoria, Debito, Fatura, Pessoa } from '../models';

/**
 * Dados fictícios para desenvolver a UI antes do backend existir.
 * Estrutura espelha docs/specs/*.md — trocar por chamadas HTTP reais
 * quando a API estiver disponível (ver core/mock/README ou o service
 * de cada feature).
 */

export const MOCK_CARTOES: Cartao[] = [
  { id: 'nu', nome: 'Nubank Roxo', corCaracteristica: '#820AD1', dataFechamento: 14, dataVencimento: 21 },
  { id: 'inter', nome: 'Inter Laranja', corCaracteristica: '#FF7A00', dataFechamento: 5, dataVencimento: 12 },
  { id: 'c6', nome: 'C6 Carbon', corCaracteristica: '#3AA98F', dataFechamento: 20, dataVencimento: 27 },
];

export const MOCK_PESSOAS: Pessoa[] = [
  { id: 'voce', nome: 'Você' },
  { id: 'marina', nome: 'Marina' },
];

export const MOCK_CATEGORIAS: Categoria[] = [
  { id: 'mercado', nome: 'Mercado' },
  { id: 'assinaturas', nome: 'Assinaturas' },
  { id: 'eletronicos', nome: 'Eletrônicos' },
  { id: 'transporte', nome: 'Transporte' },
  { id: 'saude', nome: 'Saúde' },
  { id: 'casa', nome: 'Casa' },
];

export const MOCK_FATURAS: Fatura[] = [
  { id: 'fat-nu-2026-08', cartaoId: 'nu', mesReferencia: '2026-08', status: 'aberta' },
  { id: 'fat-inter-2026-08', cartaoId: 'inter', mesReferencia: '2026-08', status: 'aberta' },
  { id: 'fat-c6-2026-08', cartaoId: 'c6', mesReferencia: '2026-08', status: 'aberta' },
];

export const MOCK_DEBITOS: Debito[] = [
  { id: 'd1', faturaId: 'fat-nu-2026-08', pessoaId: 'voce', categoriaId: 'mercado', descricao: 'Mercado Extra', valor: 28490, dataCompra: '2026-08-03', tipo: 'unico' },
  { id: 'd2', faturaId: 'fat-nu-2026-08', pessoaId: 'voce', categoriaId: 'assinaturas', descricao: 'Netflix', valor: 5590, dataCompra: '2026-08-01', tipo: 'fixo' },
  { id: 'd3', faturaId: 'fat-nu-2026-08', pessoaId: 'marina', categoriaId: 'eletronicos', descricao: 'iPhone 15', valor: 45800, dataCompra: '2026-05-12', tipo: 'parcelado', valorTotal: 458000, numeroParcelas: 10, parcelaAtual: 4, compraId: 'compra-iphone' },
  { id: 'd4', faturaId: 'fat-inter-2026-08', pessoaId: 'voce', categoriaId: 'transporte', descricao: 'Posto Ipiranga', valor: 19000, dataCompra: '2026-08-07', tipo: 'unico' },
  { id: 'd5', faturaId: 'fat-inter-2026-08', pessoaId: 'marina', categoriaId: 'saude', descricao: 'Academia', valor: 12990, dataCompra: '2026-08-05', tipo: 'fixo' },
  { id: 'd6', faturaId: 'fat-inter-2026-08', pessoaId: 'voce', categoriaId: 'saude', descricao: 'Farmácia São João', valor: 6230, dataCompra: '2026-08-11', tipo: 'unico' },
  { id: 'd7', faturaId: 'fat-c6-2026-08', pessoaId: 'voce', categoriaId: 'casa', descricao: 'Sofá 3 lugares', valor: 21650, dataCompra: '2026-07-18', tipo: 'parcelado', valorTotal: 129900, numeroParcelas: 6, parcelaAtual: 2, compraId: 'compra-sofa' },
  { id: 'd8', faturaId: 'fat-c6-2026-08', pessoaId: 'marina', categoriaId: 'assinaturas', descricao: 'Spotify Família', valor: 3490, dataCompra: '2026-08-02', tipo: 'fixo' },
];

/**
 * Fatura fechada do mês anterior, só pra dar contexto de "variação vs. mês
 * anterior" no dashboard assim que o app abre (sem isso, o primeiro mês
 * sempre mostraria variação de 0%). Fatura fechada de verdade, então segue
 * as mesmas regras de qualquer outra fatura fechada.
 */
export const MOCK_FATURA_ANTERIOR_NU = 'fat-nu-2026-07';
export const MOCK_FATURAS_ANTERIORES: Fatura[] = [
  { id: MOCK_FATURA_ANTERIOR_NU, cartaoId: 'nu', mesReferencia: '2026-07', status: 'fechada', dataFechamentoReal: '2026-07-14' },
];
export const MOCK_DEBITOS_ANTERIORES: Debito[] = [
  { id: 'd0-1', faturaId: MOCK_FATURA_ANTERIOR_NU, pessoaId: 'voce', categoriaId: 'mercado', descricao: 'Mercado Extra', valor: 26200, dataCompra: '2026-07-04', tipo: 'unico' },
  { id: 'd0-2', faturaId: MOCK_FATURA_ANTERIOR_NU, pessoaId: 'voce', categoriaId: 'assinaturas', descricao: 'Netflix', valor: 5590, dataCompra: '2026-07-01', tipo: 'fixo' },
  { id: 'd0-3', faturaId: MOCK_FATURA_ANTERIOR_NU, pessoaId: 'marina', categoriaId: 'eletronicos', descricao: 'iPhone 15', valor: 45800, dataCompra: '2026-05-12', tipo: 'parcelado', valorTotal: 458000, numeroParcelas: 10, parcelaAtual: 3, compraId: 'compra-iphone' },
];
