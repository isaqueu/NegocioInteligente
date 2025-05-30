import { 
  User, InsertUser, Empresa, InsertEmpresa, Produto, InsertProduto, 
  Entrada, InsertEntrada, Saida, InsertSaida, ItemSaida, InsertItemSaida,
  ResumoFinanceiro, SaidaCompleta, SaidaInput, SaidaParceladaInput
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  listUsers(): Promise<User[]>;

  // Empresas
  getEmpresa(id: number): Promise<Empresa | undefined>;
  createEmpresa(empresa: InsertEmpresa): Promise<Empresa>;
  updateEmpresa(id: number, empresa: Partial<InsertEmpresa>): Promise<Empresa>;
  deleteEmpresa(id: number): Promise<void>;
  listEmpresas(): Promise<Empresa[]>;

  // Produtos
  getProduto(id: number): Promise<Produto | undefined>;
  getProdutoByBarcode(barcode: string): Promise<Produto | undefined>;
  createProduto(produto: InsertProduto): Promise<Produto>;
  updateProduto(id: number, produto: Partial<InsertProduto>): Promise<Produto>;
  deleteProduto(id: number): Promise<void>;
  listProdutos(): Promise<Produto[]>;

  // Entradas
  getEntrada(id: number): Promise<Entrada | undefined>;
  createEntrada(entrada: InsertEntrada): Promise<Entrada>;
  listEntradas(): Promise<Entrada[]>;

  // Saídas
  getSaida(id: number): Promise<Saida | undefined>;
  createSaida(saida: SaidaInput): Promise<Saida>;
  updateSaida(id: number, saida: Partial<Saida>): Promise<Saida>;
  listSaidas(): Promise<Saida[]>;
  getSaidasCompletas(): Promise<SaidaCompleta[]>;
  getSaidasComParcelas(): Promise<Saida[]>;
  marcarParcelaPaga(id: number, dataPagamento: string): Promise<void>;

  // Itens de Saída
  getItensSaida(saidaId: number): Promise<ItemSaida[]>;

  // Relatórios
  getResumoFinanceiro(): Promise<ResumoFinanceiro>;
  getUltimasTransacoes(limit?: number): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private empresas: Map<number, Empresa> = new Map();
  private produtos: Map<number, Produto> = new Map();
  private entradas: Map<number, Entrada> = new Map();
  private saidas: Map<number, Saida> = new Map();
  private itensSaida: Map<number, ItemSaida> = new Map();
  
  private currentUserId = 1;
  private currentEmpresaId = 1;
  private currentProdutoId = 1;
  private currentEntradaId = 1;
  private currentSaidaId = 1;
  private currentItemSaidaId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Usuários
    const users = [
      { id: 1, nome: 'João Silva', username: 'admin', senha: '123456', papel: 'pai', saldo: '8500.00' },
      { id: 2, nome: 'Maria Silva', username: 'maria', senha: '123456', papel: 'mae', saldo: '4720.50' },
      { id: 3, nome: 'Pedro Silva', username: 'pedro', senha: '123456', papel: 'filho', saldo: '2200.00' }
    ];
    users.forEach(user => this.users.set(user.id, user as User));
    this.currentUserId = 4;

    // Empresas
    const empresas = [
      { id: 1, nome: 'Empresa ABC Ltda', tipo: 'pagadora' },
      { id: 2, nome: 'Supermercado Extra', tipo: 'recebedora' },
      { id: 3, nome: 'Magazine Luiza', tipo: 'recebedora' },
      { id: 4, nome: 'Freelance XYZ', tipo: 'pagadora' },
      { id: 5, nome: 'Consultoria Tech', tipo: 'pagadora' },
      { id: 6, nome: 'Posto Shell', tipo: 'recebedora' }
    ];
    empresas.forEach(empresa => this.empresas.set(empresa.id, empresa as Empresa));
    this.currentEmpresaId = 7;

    // Produtos
    const produtos = [
      { id: 1, codigoBarras: '7896030100123', nome: 'Arroz Branco 5kg', unidade: 'kg', classificacao: 'Alimento', precoUnitario: '12.50' },
      { id: 2, codigoBarras: '7896030100456', nome: 'Feijão Preto 1kg', unidade: 'kg', classificacao: 'Alimento', precoUnitario: '8.90' },
      { id: 3, codigoBarras: '7896030100789', nome: 'Óleo de Soja 900ml', unidade: 'ml', classificacao: 'Alimento', precoUnitario: '4.50' },
      { id: 4, codigoBarras: '7896030100321', nome: 'Leite Integral 1L', unidade: 'L', classificacao: 'Alimento', precoUnitario: '5.80' },
      { id: 5, codigoBarras: '7896030100654', nome: 'Açúcar Cristal 1kg', unidade: 'kg', classificacao: 'Alimento', precoUnitario: '3.20' }
    ];
    produtos.forEach(produto => this.produtos.set(produto.id, produto as Produto));
    this.currentProdutoId = 6;

    // Algumas entradas de exemplo
    const entradas = [
      { 
        id: 1, 
        usuarioTitularId: 1, 
        dataReferencia: new Date().toISOString().split('T')[0], 
        valor: '5000.00', 
        empresaPagadoraId: 1, 
        dataHoraRegistro: new Date(), 
        usuarioRegistroId: 1 
      },
      { 
        id: 2, 
        usuarioTitularId: 2, 
        dataReferencia: new Date(Date.now() - 86400000).toISOString().split('T')[0], 
        valor: '1200.00', 
        empresaPagadoraId: 4, 
        dataHoraRegistro: new Date(Date.now() - 86400000), 
        usuarioRegistroId: 2 
      }
    ];
    entradas.forEach(entrada => this.entradas.set(entrada.id, entrada as Entrada));
    this.currentEntradaId = 3;

    // Algumas saídas de exemplo com parcelas
    const currentDate = new Date();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    
    // Saída parcelada - Geladeira
    const saidaGeladeira = {
      id: 1,
      usuariosTitularesIds: JSON.stringify([1]),
      empresaId: 3,
      dataSaida: new Date(Date.now() - 2592000000).toISOString().split('T')[0], // 30 dias atrás
      tipoPagamento: 'parcelado',
      valorTotal: '3000.00',
      observacao: 'Geladeira Brastemp',
      usuarioRegistroId: 1,
      dataHoraRegistro: new Date(Date.now() - 2592000000),
      saidaOriginalId: null,
      numeroParcela: null,
      totalParcelas: 12,
      dataVencimento: null,
      valorParcela: null,
      status: 'pendente'
    };
    this.saidas.set(1, saidaGeladeira as Saida);

    // Parcelas da geladeira
    for (let i = 1; i <= 12; i++) {
      const dataVencimento = new Date(Date.now() - 2592000000 + (i * 30 * 24 * 60 * 60 * 1000));
      const status = dataVencimento < currentDate ? 'vencida' : 'a_vencer';
      
      const parcela = {
        id: i + 1,
        usuariosTitularesIds: JSON.stringify([1]),
        empresaId: 3,
        dataSaida: saidaGeladeira.dataSaida,
        tipoPagamento: 'parcelado',
        valorTotal: '3000.00',
        observacao: `Geladeira Brastemp - Parcela ${i}/12`,
        usuarioRegistroId: 1,
        dataHoraRegistro: saidaGeladeira.dataHoraRegistro,
        saidaOriginalId: 1,
        numeroParcela: i,
        totalParcelas: 12,
        dataVencimento: dataVencimento.toISOString().split('T')[0],
        valorParcela: '250.00',
        status: i === 1 ? 'paga' : status
      };
      this.saidas.set(i + 1, parcela as Saida);
    }

    this.currentSaidaId = 14;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id, saldo: '0.00' };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) throw new Error('Usuário não encontrado');
    
    const updated = { ...existing, ...user };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Empresas
  async getEmpresa(id: number): Promise<Empresa | undefined> {
    return this.empresas.get(id);
  }

  async createEmpresa(empresa: InsertEmpresa): Promise<Empresa> {
    const id = this.currentEmpresaId++;
    const newEmpresa: Empresa = { ...empresa, id };
    this.empresas.set(id, newEmpresa);
    return newEmpresa;
  }

  async updateEmpresa(id: number, empresa: Partial<InsertEmpresa>): Promise<Empresa> {
    const existing = this.empresas.get(id);
    if (!existing) throw new Error('Empresa não encontrada');
    
    const updated = { ...existing, ...empresa };
    this.empresas.set(id, updated);
    return updated;
  }

  async deleteEmpresa(id: number): Promise<void> {
    this.empresas.delete(id);
  }

  async listEmpresas(): Promise<Empresa[]> {
    return Array.from(this.empresas.values());
  }

  // Produtos
  async getProduto(id: number): Promise<Produto | undefined> {
    return this.produtos.get(id);
  }

  async getProdutoByBarcode(barcode: string): Promise<Produto | undefined> {
    return Array.from(this.produtos.values()).find(produto => produto.codigoBarras === barcode);
  }

  async createProduto(produto: InsertProduto): Promise<Produto> {
    const id = this.currentProdutoId++;
    const newProduto: Produto = { ...produto, id };
    this.produtos.set(id, newProduto);
    return newProduto;
  }

  async updateProduto(id: number, produto: Partial<InsertProduto>): Promise<Produto> {
    const existing = this.produtos.get(id);
    if (!existing) throw new Error('Produto não encontrado');
    
    const updated = { ...existing, ...produto };
    this.produtos.set(id, updated);
    return updated;
  }

  async deleteProduto(id: number): Promise<void> {
    this.produtos.delete(id);
  }

  async listProdutos(): Promise<Produto[]> {
    return Array.from(this.produtos.values());
  }

  // Entradas
  async getEntrada(id: number): Promise<Entrada | undefined> {
    return this.entradas.get(id);
  }

  async createEntrada(entrada: InsertEntrada): Promise<Entrada> {
    const id = this.currentEntradaId++;
    const newEntrada: Entrada = { 
      ...entrada, 
      id, 
      dataHoraRegistro: new Date()
    };
    this.entradas.set(id, newEntrada);

    // Atualizar saldo do usuário
    const user = this.users.get(entrada.usuarioTitularId);
    if (user) {
      const novoSaldo = parseFloat(user.saldo) + parseFloat(entrada.valor);
      user.saldo = novoSaldo.toFixed(2);
      this.users.set(user.id, user);
    }

    return newEntrada;
  }

  async listEntradas(): Promise<Entrada[]> {
    return Array.from(this.entradas.values());
  }

  // Saídas
  async getSaida(id: number): Promise<Saida | undefined> {
    return this.saidas.get(id);
  }

  async createSaida(saidaInput: SaidaInput): Promise<Saida> {
    const id = this.currentSaidaId++;
    
    // Calcular valor total dos itens
    const valorTotal = saidaInput.itens.reduce((total, item) => 
      total + (parseFloat(item.quantidade) * parseFloat(item.precoUnitario)), 0
    );

    if (saidaInput.tipoPagamento === 'avista') {
      // Criar saída à vista
      const novaSaida: Saida = {
        id,
        usuariosTitularesIds: saidaInput.usuariosTitularesIds,
        empresaId: saidaInput.empresaId,
        dataSaida: saidaInput.dataSaida,
        tipoPagamento: saidaInput.tipoPagamento,
        valorTotal: valorTotal.toFixed(2),
        observacao: saidaInput.observacao || null,
        usuarioRegistroId: saidaInput.usuarioRegistroId,
        dataHoraRegistro: new Date(),
        saidaOriginalId: null,
        numeroParcela: null,
        totalParcelas: null,
        dataVencimento: null,
        valorParcela: null,
        status: 'paga'
      };

      this.saidas.set(id, novaSaida);

      // Criar itens da saída
      saidaInput.itens.forEach(item => {
        const itemId = this.currentItemSaidaId++;
        const novoItem: ItemSaida = {
          ...item,
          id: itemId,
          saidaId: id,
          valorTotal: (parseFloat(item.quantidade) * parseFloat(item.precoUnitario)).toFixed(2)
        };
        this.itensSaida.set(itemId, novoItem);
      });

      // Atualizar saldos dos usuários
      const userIds = JSON.parse(saidaInput.usuariosTitularesIds);
      const valorPorUsuario = valorTotal / userIds.length;
      
      userIds.forEach((userId: number) => {
        const user = this.users.get(userId);
        if (user) {
          const novoSaldo = parseFloat(user.saldo) - valorPorUsuario;
          user.saldo = novoSaldo.toFixed(2);
          this.users.set(user.id, user);
        }
      });

      return novaSaida;
    } else {
      // Criar saída parcelada
      const saidaParcelada = saidaInput as SaidaParceladaInput;
      
      // Criar saída "pai"
      const saidaPai: Saida = {
        id,
        usuariosTitularesIds: saidaParcelada.usuariosTitularesIds,
        empresaId: saidaParcelada.empresaId,
        dataSaida: saidaParcelada.dataSaida,
        tipoPagamento: saidaParcelada.tipoPagamento,
        valorTotal: valorTotal.toFixed(2),
        observacao: saidaParcelada.observacao || null,
        usuarioRegistroId: saidaParcelada.usuarioRegistroId,
        dataHoraRegistro: new Date(),
        saidaOriginalId: null,
        numeroParcela: null,
        totalParcelas: saidaParcelada.numeroParcelas,
        dataVencimento: null,
        valorParcela: null,
        status: 'pendente'
      };

      this.saidas.set(id, saidaPai);
      this.currentSaidaId++;

      // Criar itens da saída
      saidaParcelada.itens.forEach(item => {
        const itemId = this.currentItemSaidaId++;
        const novoItem: ItemSaida = {
          ...item,
          id: itemId,
          saidaId: id,
          valorTotal: (parseFloat(item.quantidade) * parseFloat(item.precoUnitario)).toFixed(2)
        };
        this.itensSaida.set(itemId, novoItem);
      });

      // Criar parcelas "filhas"
      saidaParcelada.parcelas.forEach((parcela, index) => {
        const parcelaId = this.currentSaidaId++;
        const novaParcela: Saida = {
          id: parcelaId,
          usuariosTitularesIds: saidaParcelada.usuariosTitularesIds,
          empresaId: saidaParcelada.empresaId,
          dataSaida: saidaParcelada.dataSaida,
          tipoPagamento: saidaParcelada.tipoPagamento,
          valorTotal: valorTotal.toFixed(2),
          observacao: `${saidaParcelada.observacao || 'Compra parcelada'} - Parcela ${index + 1}/${saidaParcelada.numeroParcelas}`,
          usuarioRegistroId: saidaParcelada.usuarioRegistroId,
          dataHoraRegistro: new Date(),
          saidaOriginalId: id,
          numeroParcela: index + 1,
          totalParcelas: saidaParcelada.numeroParcelas,
          dataVencimento: parcela.dataVencimento,
          valorParcela: parcela.valor.toFixed(2),
          status: new Date(parcela.dataVencimento) < new Date() ? 'vencida' : 'a_vencer'
        };

        this.saidas.set(parcelaId, novaParcela);
      });

      return saidaPai;
    }
  }

  async updateSaida(id: number, saida: Partial<Saida>): Promise<Saida> {
    const existing = this.saidas.get(id);
    if (!existing) throw new Error('Saída não encontrada');
    
    const updated = { ...existing, ...saida };
    this.saidas.set(id, updated);
    return updated;
  }

  async listSaidas(): Promise<Saida[]> {
    return Array.from(this.saidas.values());
  }

  async getSaidasCompletas(): Promise<SaidaCompleta[]> {
    const saidas = Array.from(this.saidas.values());
    const empresas = Array.from(this.empresas.values());
    const usuarios = Array.from(this.users.values());
    
    return saidas.map(saida => {
      const itens = Array.from(this.itensSaida.values()).filter(item => item.saidaId === saida.id);
      const empresa = empresas.find(e => e.id === saida.empresaId)!;
      const userIds = JSON.parse(saida.usuariosTitularesIds);
      const saidaUsuarios = usuarios.filter(u => userIds.includes(u.id));
      
      return {
        ...saida,
        itens,
        empresa,
        usuarios: saidaUsuarios
      };
    });
  }

  async getSaidasComParcelas(): Promise<Saida[]> {
    return Array.from(this.saidas.values()).filter(saida => 
      saida.saidaOriginalId !== null || (saida.tipoPagamento === 'parcelado' && saida.saidaOriginalId === null)
    );
  }

  async marcarParcelaPaga(id: number, dataPagamento: string): Promise<void> {
    const parcela = this.saidas.get(id);
    if (!parcela) throw new Error('Parcela não encontrada');
    
    parcela.status = 'paga';
    this.saidas.set(id, parcela);

    // Atualizar saldos dos usuários
    const userIds = JSON.parse(parcela.usuariosTitularesIds);
    const valorPorUsuario = parseFloat(parcela.valorParcela || '0') / userIds.length;
    
    userIds.forEach((userId: number) => {
      const user = this.users.get(userId);
      if (user) {
        const novoSaldo = parseFloat(user.saldo) - valorPorUsuario;
        user.saldo = novoSaldo.toFixed(2);
        this.users.set(user.id, user);
      }
    });
  }

  // Itens de Saída
  async getItensSaida(saidaId: number): Promise<ItemSaida[]> {
    return Array.from(this.itensSaida.values()).filter(item => item.saidaId === saidaId);
  }

  // Relatórios
  async getResumoFinanceiro(): Promise<ResumoFinanceiro> {
    const users = Array.from(this.users.values());
    const saldoFamiliar = users.reduce((total, user) => total + parseFloat(user.saldo), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const entradas = Array.from(this.entradas.values());
    const entradasMes = entradas
      .filter(entrada => {
        const data = new Date(entrada.dataReferencia);
        return data.getMonth() === currentMonth && data.getFullYear() === currentYear;
      })
      .reduce((total, entrada) => total + parseFloat(entrada.valor), 0);

    const saidas = Array.from(this.saidas.values());
    const saidasMes = saidas
      .filter(saida => {
        const data = new Date(saida.dataSaida);
        return data.getMonth() === currentMonth && 
               data.getFullYear() === currentYear && 
               saida.status === 'paga';
      })
      .reduce((total, saida) => total + parseFloat(saida.valorParcela || saida.valorTotal), 0);

    const parcelasPendentes = saidas.filter(saida => 
      saida.saidaOriginalId !== null && 
      (saida.status === 'a_vencer' || saida.status === 'vencida')
    ).length;

    return {
      saldoFamiliar,
      entradasMes,
      saidasMes,
      parcelasPendentes
    };
  }

  async getUltimasTransacoes(limit = 10): Promise<any[]> {
    const entradas = Array.from(this.entradas.values());
    const saidas = Array.from(this.saidas.values()).filter(s => s.saidaOriginalId === null);
    const empresas = Array.from(this.empresas.values());
    const usuarios = Array.from(this.users.values());

    const transacoes = [
      ...entradas.map(entrada => ({
        id: `entrada-${entrada.id}`,
        tipo: 'entrada',
        data: entrada.dataReferencia,
        dataHora: entrada.dataHoraRegistro,
        valor: parseFloat(entrada.valor),
        descricao: 'Entrada financeira',
        usuario: usuarios.find(u => u.id === entrada.usuarioTitularId)?.nome || '',
        empresa: empresas.find(e => e.id === entrada.empresaPagadoraId)?.nome || ''
      })),
      ...saidas.map(saida => ({
        id: `saida-${saida.id}`,
        tipo: 'saida',
        data: saida.dataSaida,
        dataHora: saida.dataHoraRegistro,
        valor: parseFloat(saida.valorTotal),
        descricao: saida.observacao || 'Saída financeira',
        usuario: usuarios.find(u => JSON.parse(saida.usuariosTitularesIds).includes(u.id))?.nome || '',
        empresa: empresas.find(e => e.id === saida.empresaId)?.nome || ''
      }))
    ];

    return transacoes
      .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
