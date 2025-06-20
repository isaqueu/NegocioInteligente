import api from './api';
import {
  Usuario,
  UsuarioInput,
  Empresa,
  EmpresaInput,
  Produto,
  ProdutoInput,
  Entrada,
  EntradaInput,
  Saida,
  SaidaInput,
  Parcela,
  ResumoFinanceiro,
  Transacao,
} from '../../types';
// Configuração para desenvolvimento - remover dados mock

// Serviços de Autenticação
export const authService = {
  login: async (username: string, senha: string): Promise<{ user: Usuario; token: string }> => {
    const response = await api.post('/auth/login', { username, senha });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async (): Promise<Usuario> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Serviços de Usuários
export const userService = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  getById: async (id: number): Promise<Usuario> => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  create: async (userData: UsuarioInput): Promise<Usuario> => {
    const response = await api.post('/usuarios', userData);
    return response.data;
  },

  update: async (id: number, userData: Partial<UsuarioInput>): Promise<Usuario> => {
    const response = await api.put(`/usuarios/${id}`, userData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },
};

// Serviços de Empresas
export const companyService = {
  getAll: async (): Promise<Empresa[]> => {
    const response = await api.get('/empresas');
    return response.data;
  },

  getById: async (id: number): Promise<Empresa> => {
    const response = await api.get(`/empresas/${id}`);
    return response.data;
  },

  create: async (companyData: EmpresaInput): Promise<Empresa> => {
    const response = await api.post('/empresas', companyData);
    return response.data;
  },

  update: async (id: number, companyData: Partial<EmpresaInput>): Promise<Empresa> => {
    const response = await api.put(`/empresas/${id}`, companyData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/empresas/${id}`);
  },
};

// Serviços de Produtos
export const productService = {
  getAll: async (): Promise<Produto[]> => {
    const response = await api.get('/produtos');
    return response.data;
  },

  getById: async (id: number): Promise<Produto> => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  getByBarcode: async (barcode: string): Promise<Produto> => {
    const response = await api.get(`/produtos/barcode/${barcode}`);
    return response.data;
  },

  create: async (productData: ProdutoInput): Promise<Produto> => {
    const response = await api.post('/produtos', productData);
    return response.data;
  },

  update: async (id: number, productData: Partial<ProdutoInput>): Promise<Produto> => {
    const response = await api.put(`/produtos/${id}`, productData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/produtos/${id}`);
  },
};

// Serviços de Entradas
export const incomeService = {
  getAll: async (): Promise<Entrada[]> => {
    const response = await api.get('/entradas');
    return response.data;
  },

  getById: async (id: number): Promise<Entrada> => {
    const response = await api.get(`/entradas/${id}`);
    return response.data;
  },

  create: async (incomeData: EntradaInput): Promise<Entrada> => {
    const response = await api.post('/entradas', incomeData);
    return response.data;
  },

  update: async (id: number, incomeData: Partial<EntradaInput>): Promise<Entrada> => {
    const response = await api.put(`/entradas/${id}`, incomeData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/entradas/${id}`);
  },
};

// Serviços de Saídas
export const expenseService = {
  getAll: async (): Promise<Saida[]> => {
    const response = await api.get('/saidas');
    return response.data;
  },

  getById: async (id: number): Promise<Saida> => {
    const response = await api.get(`/saidas/${id}`);
    return response.data;
  },

  getWithInstallments: async (): Promise<Saida[]> => {
    const response = await api.get('/saidas/parcelas');
    return response.data;
  },

  create: async (expenseData: SaidaInput): Promise<Saida> => {
    const response = await api.post('/saidas', expenseData);
    return response.data;
  },

  update: async (id: number, expenseData: Partial<Saida>): Promise<Saida> => {
    const response = await api.put(`/saidas/${id}`, expenseData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/saidas/${id}`);
  },
};

// Serviços de Parcelas
export const installmentService = {
  getAll: async (): Promise<Parcela[]> => {
    const response = await api.get('/parcelas');
    return response.data;
  },

  getById: async (id: number): Promise<Parcela> => {
    const response = await api.get(`/parcelas/${id}`);
    return response.data;
  },

  markAsPaid: async (id: number, paymentDate: string): Promise<void> => {
    await api.put(`/parcelas/${id}/pagar`, { dataPagamento: paymentDate });
  },
};

// Serviços de Relatórios
export const reportService = {
  getFinancialSummary: async (): Promise<ResumoFinanceiro> => {
    const response = await api.get('/relatorios/resumo');
    return response.data;
  },

  getRecentTransactions: async (limit = 10): Promise<Transacao[]> => {
    const response = await api.get(`/relatorios/transacoes?limit=${limit}`);
    return response.data;
  },

  getDetailedReport: async (filters: any): Promise<any> => {
    const response = await api.post('/relatorios/detalhado', filters);
    return response.data;
  },
};