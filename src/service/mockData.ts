
import {
  Usuario,
  Empresa,
  Produto,
  Entrada,
  Saida,
  Parcela,
  ResumoFinanceiro,
  Transacao,
} from '../../types';

// Dados mockados para desenvolvimento
export const mockUsers: Usuario[] = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    papel: 'pai',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    nome: 'Maria Silva',
    email: 'maria@email.com',
    papel: 'mae',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    nome: 'Pedro Silva',
    email: 'pedro@email.com',
    papel: 'filho',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
];

export const mockCompanies: Empresa[] = [
  {
    id: 1,
    nome: 'Supermercado ABC',
    cnpj: '12.345.678/0001-90',
    categoria: 'Alimentação',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    nome: 'Farmácia XYZ',
    cnpj: '98.765.432/0001-10',
    categoria: 'Saúde',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
];

export const mockProducts: Produto[] = [
  {
    id: 1,
    nome: 'Arroz Integral 1kg',
    codigoBarras: '7891234567890',
    preco: 8.50,
    categoria: 'Alimentação',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    nome: 'Feijão Preto 1kg',
    codigoBarras: '7891234567891',
    preco: 6.90,
    categoria: 'Alimentação',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
];

export const mockIncomes: Entrada[] = [
  {
    id: 1,
    descricao: 'Salário Janeiro',
    valor: 5000.00,
    data: '2024-01-05T00:00:00.000Z',
    usuarioId: 1,
    empresaId: null,
    observacoes: 'Salário mensal',
    criadoEm: '2024-01-05T00:00:00.000Z',
    atualizadoEm: '2024-01-05T00:00:00.000Z',
  },
  {
    id: 2,
    descricao: 'Freelance',
    valor: 1200.00,
    data: '2024-01-15T00:00:00.000Z',
    usuarioId: 2,
    empresaId: null,
    observacoes: 'Projeto de design',
    criadoEm: '2024-01-15T00:00:00.000Z',
    atualizadoEm: '2024-01-15T00:00:00.000Z',
  },
];

export const mockExpenses: Saida[] = [
  {
    id: 1,
    descricao: 'Compras do mês',
    valor: 450.00,
    data: '2024-01-10T00:00:00.000Z',
    usuarioId: 1,
    empresaId: 1,
    observacoes: 'Compras mensais supermercado',
    criadoEm: '2024-01-10T00:00:00.000Z',
    atualizadoEm: '2024-01-10T00:00:00.000Z',
  },
  {
    id: 2,
    descricao: 'Medicamentos',
    valor: 180.00,
    data: '2024-01-12T00:00:00.000Z',
    usuarioId: 2,
    empresaId: 2,
    observacoes: 'Medicamentos mensais',
    criadoEm: '2024-01-12T00:00:00.000Z',
    atualizadoEm: '2024-01-12T00:00:00.000Z',
  },
];

export const mockInstallments: Parcela[] = [
  {
    id: 1,
    saidaId: 1,
    numeroParcela: 1,
    totalParcelas: 3,
    valor: 150.00,
    dataVencimento: '2024-02-10T00:00:00.000Z',
    dataPagamento: null,
    pago: false,
    criadoEm: '2024-01-10T00:00:00.000Z',
    atualizadoEm: '2024-01-10T00:00:00.000Z',
  },
  {
    id: 2,
    saidaId: 1,
    numeroParcela: 2,
    totalParcelas: 3,
    valor: 150.00,
    dataVencimento: '2024-03-10T00:00:00.000Z',
    dataPagamento: null,
    pago: false,
    criadoEm: '2024-01-10T00:00:00.000Z',
    atualizadoEm: '2024-01-10T00:00:00.000Z',
  },
];

export const mockFinancialSummary: ResumoFinanceiro = {
  saldoTotal: 5570.00,
  entradasMes: 6200.00,
  saidasMes: 630.00,
  parcelasPendentes: 300.00,
};

export const mockTransactions: Transacao[] = [
  {
    id: 1,
    tipo: 'entrada',
    descricao: 'Salário Janeiro',
    valor: 5000.00,
    data: '2024-01-05T00:00:00.000Z',
    usuario: 'João Silva',
    empresa: 'Empresa ABC',
  },
  {
    id: 2,
    tipo: 'saida',
    descricao: 'Compras do mês',
    valor: 450.00,
    data: '2024-01-10T00:00:00.000Z',
    usuario: 'João Silva',
    empresa: 'Supermercado ABC',
  },
];

// Simulação de delay para requisições mock
export const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));
