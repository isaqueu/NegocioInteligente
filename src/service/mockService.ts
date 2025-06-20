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
} from '../../types';
import {
  mockUsers,
  mockCompanies,
  mockProducts,
  mockIncomes,
  mockExpenses,
  mockInstallments,
  mockFinancialSummary,
  mockTransactions,
  mockDelay,
} from './mockData';

// Simulação de storage local para dados mockados
let users = [...mockUsers];
let companies = [...mockCompanies];
let products = [...mockProducts];
let incomes = [...mockIncomes];
let expenses = [...mockExpenses];
let installments = [...mockInstallments];

// Serviços de Autenticação Mock
export const mockAuthService = {
  login: async (username: string, senha: string): Promise<{ user: Usuario; token: string }> => {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar credenciais - comparar com dados mock
    if (username === 'admin' && senha === '123456') {
      const user = {
        id: 1,
        nome: 'Administrador',
        username: 'admin',
        tipo: 'admin' as const,
        ativo: true,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };

      return {
        user,
        token: `mock-token-${user.id}-${Date.now()}`
      };
    }

    throw new Error('Credenciais inválidas');
  },

  logout: async (): Promise<void> => {
    await mockDelay(200);
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async (): Promise<Usuario> => {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Retornar usuário atual baseado no token (simulado)
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token não encontrado');
    }

    // Simular retorno do usuário admin
    return {
      id: 1,
      nome: 'Administrador',
      username: 'admin',
      tipo: 'admin',
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };
  },
};

// Serviços de Usuários Mock
export const mockUserService = {
  getAll: async (): Promise<Usuario[]> => {
    await mockDelay();
    return users;
  },

  getById: async (id: number): Promise<Usuario> => {
    await mockDelay();
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('Usuário não encontrado');
    return user;
  },

  create: async (userData: UsuarioInput): Promise<Usuario> => {
    await mockDelay();
    const newUser: Usuario = {
      id: Math.max(...users.map(u => u.id)) + 1,
      ...userData,
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  },

  update: async (id: number, userData: Partial<UsuarioInput>): Promise<Usuario> => {
    await mockDelay();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Usuário não encontrado');

    users[index] = {
      ...users[index],
      ...userData,
      atualizadoEm: new Date().toISOString(),
    };
    return users[index];
  },

  delete: async (id: number): Promise<void> => {
    await mockDelay();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Usuário não encontrado');
    users.splice(index, 1);
  },
};

// Serviços de Empresas Mock
export const mockCompanyService = {
  getAll: async (): Promise<Empresa[]> => {
    await mockDelay();
    return companies;
  },

  getById: async (id: number): Promise<Empresa> => {
    await mockDelay();
    const company = companies.find(c => c.id === id);
    if (!company) throw new Error('Empresa não encontrada');
    return company;
  },

  create: async (companyData: EmpresaInput): Promise<Empresa> => {
    await mockDelay();
    const newCompany: Empresa = {
      id: Math.max(...companies.map(c => c.id)) + 1,
      ...companyData,
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    companies.push(newCompany);
    return newCompany;
  },

  update: async (id: number, companyData: Partial<EmpresaInput>): Promise<Empresa> => {
    await mockDelay();
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Empresa não encontrada');

    companies[index] = {
      ...companies[index],
      ...companyData,
      atualizadoEm: new Date().toISOString(),
    };
    return companies[index];
  },

  delete: async (id: number): Promise<void> => {
    await mockDelay();
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Empresa não encontrada');
    companies.splice(index, 1);
  },
};

// Serviços de Produtos Mock
export const mockProductService = {
  getAll: async (): Promise<Produto[]> => {
    await mockDelay();
    return products;
  },

  getById: async (id: number): Promise<Produto> => {
    await mockDelay();
    const product = products.find(p => p.id === id);
    if (!product) throw new Error('Produto não encontrado');
    return product;
  },

  getByBarcode: async (barcode: string): Promise<Produto> => {
    await mockDelay();
    const product = products.find(p => p.codigoBarras === barcode);
    if (!product) throw new Error('Produto não encontrado');
    return product;
  },

  create: async (productData: ProdutoInput): Promise<Produto> => {
    await mockDelay();
    const newProduct: Produto = {
      id: Math.max(...products.map(p => p.id)) + 1,
      ...productData,
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    products.push(newProduct);
    return newProduct;
  },

  update: async (id: number, productData: Partial<ProdutoInput>): Promise<Produto> => {
    await mockDelay();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');

    products[index] = {
      ...products[index],
      ...productData,
      atualizadoEm: new Date().toISOString(),
    };
    return products[index];
  },

  delete: async (id: number): Promise<void> => {
    await mockDelay();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
    products.splice(index, 1);
  },
};

// Serviços de Entradas Mock
export const mockIncomeService = {
  getAll: async (): Promise<Entrada[]> => {
    await mockDelay();
    return incomes;
  },

  getById: async (id: number): Promise<Entrada> => {
    await mockDelay();
    const income = incomes.find(i => i.id === id);
    if (!income) throw new Error('Entrada não encontrada');
    return income;
  },

  create: async (incomeData: EntradaInput): Promise<Entrada> => {
    await mockDelay();
    const newIncome: Entrada = {
      id: Math.max(...incomes.map(i => i.id)) + 1,
      ...incomeData,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    incomes.push(newIncome);
    return newIncome;
  },

  update: async (id: number, incomeData: Partial<EntradaInput>): Promise<Entrada> => {
    await mockDelay();
    const index = incomes.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Entrada não encontrada');

    incomes[index] = {
      ...incomes[index],
      ...incomeData,
      atualizadoEm: new Date().toISOString(),
    };
    return incomes[index];
  },

  delete: async (id: number): Promise<void> => {
    await mockDelay();
    const index = incomes.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Entrada não encontrada');
    incomes.splice(index, 1);
  },
};

// Serviços de Saídas Mock
export const mockExpenseService = {
  getAll: async (): Promise<Saida[]> => {
    await mockDelay();
    return expenses;
  },

  getById: async (id: number): Promise<Saida> => {
    await mockDelay();
    const expense = expenses.find(e => e.id === id);
    if (!expense) throw new Error('Saída não encontrada');
    return expense;
  },

  getWithInstallments: async (): Promise<Saida[]> => {
    await mockDelay();
    return expenses;
  },

  create: async (expenseData: SaidaInput): Promise<Saida> => {
    await mockDelay();
    const newExpense: Saida = {
      id: Math.max(...expenses.map(e => e.id)) + 1,
      ...expenseData,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    expenses.push(newExpense);
    return newExpense;
  },

  update: async (id: number, expenseData: Partial<Saida>): Promise<Saida> => {
    await mockDelay();
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Saída não encontrada');

    expenses[index] = {
      ...expenses[index],
      ...expenseData,
      atualizadoEm: new Date().toISOString(),
    };
    return expenses[index];
  },

  delete: async (id: number): Promise<void> => {
    await mockDelay();
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Saída não encontrada');
    expenses.splice(index, 1);
  },
};

// Serviços de Parcelas Mock
export const mockInstallmentService = {
  getAll: async () => {
    await mockDelay();
    return installments;
  },

  getById: async (id: number) => {
    await mockDelay();
    const installment = installments.find(i => i.id === id);
    if (!installment) throw new Error('Parcela não encontrada');
    return installment;
  },

  markAsPaid: async (id: number, paymentDate: string): Promise<void> => {
    await mockDelay();
    const index = installments.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Parcela não encontrada');

    installments[index] = {
      ...installments[index],
      pago: true,
      dataPagamento: paymentDate,
      atualizadoEm: new Date().toISOString(),
    };
  },
};

// Serviços de Relatórios Mock
export const mockReportService = {
  getFinancialSummary: async () => {
    await mockDelay();
    return mockFinancialSummary;
  },

  getRecentTransactions: async (limit = 10) => {
    await mockDelay();
    return mockTransactions.slice(0, limit);
  },

  getDetailedReport: async (filters: any) => {
    await mockDelay();
    return {
      transactions: mockTransactions,
      summary: mockFinancialSummary,
    };
  },
};