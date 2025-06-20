import { 
  Usuario, UsuarioInput, Empresa, EmpresaInput, Produto, ProdutoInput, 
  Entrada, EntradaInput, Saida, SaidaInput, ItemSaida, ItemSaidaInput,
  ResumoFinanceiro, Parcela, ParcelaInput, Transacao
} from "../types";

export interface IStorage {
  // Users
  getUser(id: number): Promise<Usuario | undefined>;
  getUserByUsername(username: string): Promise<Usuario | undefined>;
  createUser(user: UsuarioInput): Promise<Usuario>;
  updateUser(id: number, user: Partial<UsuarioInput>): Promise<Usuario>;
  deleteUser(id: number): Promise<void>;
  listUsers(): Promise<Usuario[]>;

  // Empresas
  getEmpresa(id: number): Promise<Empresa | undefined>;
  createEmpresa(empresa: EmpresaInput): Promise<Empresa>;
  updateEmpresa(id: number, empresa: Partial<EmpresaInput>): Promise<Empresa>;
  deleteEmpresa(id: number): Promise<void>;
  listEmpresas(): Promise<Empresa[]>;

  // Produtos
  getProduto(id: number): Promise<Produto | undefined>;
  getProdutoByBarcode(barcode: string): Promise<Produto | undefined>;
  createProduto(produto: ProdutoInput): Promise<Produto>;
  updateProduto(id: number, produto: Partial<ProdutoInput>): Promise<Produto>;
  deleteProduto(id: number): Promise<void>;
  listProdutos(): Promise<Produto[]>;

  // Entradas
  getEntrada(id: number): Promise<Entrada | undefined>;
  createEntrada(entrada: EntradaInput): Promise<Entrada>;
  listEntradas(): Promise<Entrada[]>;

  // Saídas
  getSaida(id: number): Promise<Saida | undefined>;
  createSaida(saida: SaidaInput): Promise<Saida>;
  updateSaida(id: number, saida: Partial<Saida>): Promise<Saida>;
  listSaidas(): Promise<Saida[]>;
  getSaidasComParcelas(): Promise<Saida[]>;
  marcarParcelaPaga(id: number, dataPagamento: string): Promise<void>;

  // Itens de Saída
  getItensSaida(saidaId: number): Promise<ItemSaida[]>;

  // Parcelas
  getParcela(id: number): Promise<Parcela | undefined>;
  listParcelas(): Promise<Parcela[]>;

  // Relatórios
  getResumoFinanceiro(): Promise<ResumoFinanceiro>;
  getUltimasTransacoes(limit?: number): Promise<Transacao[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, Usuario> = new Map();
  private empresas: Map<number, Empresa> = new Map();
  private produtos: Map<number, Produto> = new Map();
  private entradas: Map<number, Entrada> = new Map();
  private saidas: Map<number, Saida> = new Map();
  private itensSaida: Map<number, ItemSaida> = new Map();
  private parcelas: Map<number, Parcela> = new Map();
  
  private currentUserId = 1;
  private currentEmpresaId = 1;
  private currentProdutoId = 1;
  private currentEntradaId = 1;
  private currentSaidaId = 1;
  private currentItemSaidaId = 1;
  private currentParcelaId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Usuários iniciais
    this.users.set(1, { 
      id: 1, 
      nome: "admin", 
      senha: "123456", 
      papel: "pai"
    });
    this.users.set(2, { 
      id: 2, 
      nome: "Maria Silva", 
      senha: "123456", 
      papel: "mae"
    });
    this.users.set(3, { 
      id: 3, 
      nome: "Pedro Silva", 
      senha: "123456", 
      papel: "filho"
    });
    this.currentUserId = 4;

    // Empresas iniciais
    this.empresas.set(1, { id: 1, nome: "Empresa ABC Ltda" });
    this.empresas.set(2, { id: 2, nome: "Supermercado XYZ" });
    this.empresas.set(3, { id: 3, nome: "Farmácia Central" });
    this.currentEmpresaId = 4;

    // Produtos iniciais
    this.produtos.set(1, { 
      id: 1, 
      nome: "Arroz Branco 5kg", 
      codigoBarras: "7891234567890",
      unidade: "kg", 
      classificacao: "Alimentos",
      precoUnitario: 15.90
    });
    this.produtos.set(2, { 
      id: 2, 
      nome: "Feijão Preto 1kg", 
      codigoBarras: "7891234567891",
      unidade: "kg", 
      classificacao: "Alimentos",
      precoUnitario: 8.50
    });
    this.produtos.set(3, { 
      id: 3, 
      nome: "Leite Integral 1L", 
      codigoBarras: "7891234567892",
      unidade: "L", 
      classificacao: "Laticínios",
      precoUnitario: 4.20
    });
    this.currentProdutoId = 4;

    // Entradas iniciais
    this.entradas.set(1, {
      id: 1,
      usuarioRegistroId: 1,
      dataHoraRegistro: "2024-01-15T08:00:00Z",
      usuarioTitularId: 1,
      dataReferencia: "2024-01-15",
      valor: 5000.00,
      empresaPagadoraId: 1
    });
    this.entradas.set(2, {
      id: 2,
      usuarioRegistroId: 1,
      dataHoraRegistro: "2024-01-20T09:30:00Z",
      usuarioTitularId: 2,
      dataReferencia: "2024-01-20",
      valor: 3200.50,
      empresaPagadoraId: 2
    });
    this.currentEntradaId = 3;

    // Saídas iniciais
    const saida1: Saida = {
      id: 1,
      usuarioRegistroId: 1,
      dataHoraRegistro: "2024-01-16T14:30:00Z",
      dataSaida: "2024-01-16",
      empresaId: 2,
      tipoPagamento: "avista",
      usuariosTitularesIds: [1],
      itens: [
        { produtoId: 1, nomeProduto: "Arroz Branco 5kg", quantidade: 2, precoUnitario: 15.90, total: 31.80 },
        { produtoId: 2, nomeProduto: "Feijão Preto 1kg", quantidade: 1, precoUnitario: 8.50, total: 8.50 }
      ],
      valorTotal: 40.30,
      observacao: "Compras do mês"
    };
    this.saidas.set(1, saida1);

    const saida2: Saida = {
      id: 2,
      usuarioRegistroId: 2,
      dataHoraRegistro: "2024-01-18T16:45:00Z",
      dataSaida: "2024-01-18",
      empresaId: 3,
      tipoPagamento: "parcelado",
      usuariosTitularesIds: [2],
      itens: [
        { produtoId: 3, nomeProduto: "Leite Integral 1L", quantidade: 10, precoUnitario: 4.20, total: 42.00 }
      ],
      valorTotal: 42.00,
      observacao: "Compra parcelada"
    };
    this.saidas.set(2, saida2);
    
    const saida3: Saida = {
      id: 3,
      usuarioRegistroId: 1,
      dataHoraRegistro: "2024-01-20T10:15:00Z",
      dataSaida: "2024-01-20",
      empresaId: 2,
      tipoPagamento: "avista",
      usuariosTitularesIds: [1, 3],
      itens: [
        { produtoId: 1, nomeProduto: "Arroz Branco 5kg", quantidade: 1, precoUnitario: 15.90, total: 15.90 },
        { produtoId: 3, nomeProduto: "Leite Integral 1L", quantidade: 3, precoUnitario: 4.20, total: 12.60 }
      ],
      valorTotal: 28.50,
      observacao: "Compra familiar"
    };
    this.saidas.set(3, saida3);
    this.currentSaidaId = 4;

    // Parcelas
    this.parcelas.set(1, {
      id: 1,
      saidaOriginalId: 2,
      numeroParcela: 1,
      dataVencimento: "2024-02-18",
      valorParcela: 21.00,
      status: "paga",
      dataPagamento: "2024-02-18"
    });
    this.parcelas.set(2, {
      id: 2,
      saidaOriginalId: 2,
      numeroParcela: 2,
      dataVencimento: "2024-03-18",
      valorParcela: 21.00,
      status: "a vencer"
    });
    this.currentParcelaId = 3;
  }

  // Métodos para Users
  async getUser(id: number): Promise<Usuario | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<Usuario | undefined> {
    for (const user of this.users.values()) {
      if (user.nome === username) return user;
    }
    return undefined;
  }

  async createUser(user: UsuarioInput): Promise<Usuario> {
    const id = this.currentUserId++;
    const newUser: Usuario = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<UsuarioInput>): Promise<Usuario> {
    const existingUser = this.users.get(id);
    if (!existingUser) throw new Error('User not found');
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async listUsers(): Promise<Usuario[]> {
    return Array.from(this.users.values());
  }

  // Métodos para Empresas
  async getEmpresa(id: number): Promise<Empresa | undefined> {
    return this.empresas.get(id);
  }

  async createEmpresa(empresa: EmpresaInput): Promise<Empresa> {
    const id = this.currentEmpresaId++;
    const newEmpresa: Empresa = { ...empresa, id };
    this.empresas.set(id, newEmpresa);
    return newEmpresa;
  }

  async updateEmpresa(id: number, empresa: Partial<EmpresaInput>): Promise<Empresa> {
    const existingEmpresa = this.empresas.get(id);
    if (!existingEmpresa) throw new Error('Empresa not found');
    const updatedEmpresa = { ...existingEmpresa, ...empresa };
    this.empresas.set(id, updatedEmpresa);
    return updatedEmpresa;
  }

  async deleteEmpresa(id: number): Promise<void> {
    this.empresas.delete(id);
  }

  async listEmpresas(): Promise<Empresa[]> {
    return Array.from(this.empresas.values());
  }

  // Métodos para Produtos
  async getProduto(id: number): Promise<Produto | undefined> {
    return this.produtos.get(id);
  }

  async getProdutoByBarcode(barcode: string): Promise<Produto | undefined> {
    for (const produto of this.produtos.values()) {
      if (produto.codigoBarras === barcode) return produto;
    }
    return undefined;
  }

  async createProduto(produto: ProdutoInput): Promise<Produto> {
    const id = this.currentProdutoId++;
    const newProduto: Produto = { 
      ...produto, 
      id, 
      precoUnitario: typeof produto.precoUnitario === 'string' 
        ? parseFloat(produto.precoUnitario) 
        : produto.precoUnitario 
    };
    this.produtos.set(id, newProduto);
    return newProduto;
  }

  async updateProduto(id: number, produto: Partial<ProdutoInput>): Promise<Produto> {
    const existingProduto = this.produtos.get(id);
    if (!existingProduto) throw new Error('Produto not found');
    const updatedProduto = { 
      ...existingProduto, 
      ...produto,
      precoUnitario: produto.precoUnitario 
        ? (typeof produto.precoUnitario === 'string' 
          ? parseFloat(produto.precoUnitario) 
          : produto.precoUnitario)
        : existingProduto.precoUnitario
    };
    this.produtos.set(id, updatedProduto);
    return updatedProduto;
  }

  async deleteProduto(id: number): Promise<void> {
    this.produtos.delete(id);
  }

  async listProdutos(): Promise<Produto[]> {
    return Array.from(this.produtos.values());
  }

  // Métodos para Entradas
  async getEntrada(id: number): Promise<Entrada | undefined> {
    return this.entradas.get(id);
  }

  async createEntrada(entrada: EntradaInput): Promise<Entrada> {
    const id = this.currentEntradaId++;
    const newEntrada: Entrada = { 
      ...entrada, 
      id,
      dataHoraRegistro: new Date().toISOString(),
      valor: typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor
    };
    this.entradas.set(id, newEntrada);
    return newEntrada;
  }

  async listEntradas(): Promise<Entrada[]> {
    return Array.from(this.entradas.values());
  }

  // Métodos para Saídas
  async getSaida(id: number): Promise<Saida | undefined> {
    return this.saidas.get(id);
  }

  async createSaida(saidaInput: SaidaInput): Promise<Saida> {
    const id = this.currentSaidaId++;
    
    // Calcular valor total dos itens
    const valorTotal = saidaInput.itens.reduce((total, item) => {
      return total + (item.quantidade * item.precoUnitario);
    }, 0);

    // Buscar informações dos produtos para os itens
    const itensCompletos: ItemSaida[] = saidaInput.itens.map(item => {
      const produto = this.produtos.get(item.produtoId);
      return {
        produtoId: item.produtoId,
        nomeProduto: produto?.nome || "Produto não encontrado",
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        total: item.quantidade * item.precoUnitario
      };
    });

    const novaSaida: Saida = {
      id,
      usuarioRegistroId: saidaInput.usuarioRegistroId,
      dataHoraRegistro: new Date().toISOString(),
      dataSaida: saidaInput.dataSaida,
      empresaId: saidaInput.empresaId,
      tipoPagamento: saidaInput.tipoPagamento,
      usuariosTitularesIds: saidaInput.usuariosTitularesIds,
      itens: itensCompletos,
      valorTotal,
      observacao: saidaInput.observacao
    };

    this.saidas.set(id, novaSaida);

    // Se for parcelado, criar as parcelas
    if (saidaInput.tipoPagamento === "parcelado" && saidaInput.numeroParcelas && saidaInput.dataPrimeiraParcela) {
      const valorParcela = valorTotal / saidaInput.numeroParcelas;
      const dataPrimeira = new Date(saidaInput.dataPrimeiraParcela);

      for (let i = 0; i < saidaInput.numeroParcelas; i++) {
        const dataVencimento = new Date(dataPrimeira);
        dataVencimento.setMonth(dataVencimento.getMonth() + i);

        const parcela: Parcela = {
          id: this.currentParcelaId++,
          saidaOriginalId: id,
          numeroParcela: i + 1,
          dataVencimento: dataVencimento.toISOString().split('T')[0],
          valorParcela,
          status: "a vencer"
        };
        this.parcelas.set(parcela.id, parcela);
      }
    }

    return novaSaida;
  }

  async updateSaida(id: number, saida: Partial<Saida>): Promise<Saida> {
    const existingSaida = this.saidas.get(id);
    if (!existingSaida) throw new Error('Saida not found');
    const updatedSaida = { ...existingSaida, ...saida };
    this.saidas.set(id, updatedSaida);
    return updatedSaida;
  }

  async listSaidas(): Promise<Saida[]> {
    return Array.from(this.saidas.values());
  }

  async getSaidasComParcelas(): Promise<Saida[]> {
    return Array.from(this.saidas.values()).filter(saida => saida.tipoPagamento === "parcelado");
  }

  async marcarParcelaPaga(id: number, dataPagamento: string): Promise<void> {
    const parcela = this.parcelas.get(id);
    if (!parcela) throw new Error('Parcela not found');
    parcela.status = "paga";
    parcela.dataPagamento = dataPagamento;
    this.parcelas.set(id, parcela);
  }

  // Métodos para Itens de Saída
  async getItensSaida(saidaId: number): Promise<ItemSaida[]> {
    const saida = this.saidas.get(saidaId);
    return saida?.itens || [];
  }

  // Métodos para Parcelas
  async getParcela(id: number): Promise<Parcela | undefined> {
    return this.parcelas.get(id);
  }

  async listParcelas(): Promise<Parcela[]> {
    return Array.from(this.parcelas.values());
  }

  // Métodos para Relatórios
  async getResumoFinanceiro(): Promise<ResumoFinanceiro> {
    const entradas = Array.from(this.entradas.values());
    const saidas = Array.from(this.saidas.values());
    const parcelas = Array.from(this.parcelas.values());

    const totalEntradas = entradas.reduce((sum, entrada) => sum + entrada.valor, 0);
    const totalSaidas = saidas.reduce((sum, saida) => sum + saida.valorTotal, 0);
    const totalParcelado = saidas
      .filter(saida => saida.tipoPagamento === "parcelado")
      .reduce((sum, saida) => sum + saida.valorTotal, 0);
    const totalPago = parcelas
      .filter(parcela => parcela.status === "paga")
      .reduce((sum, parcela) => sum + parcela.valorParcela, 0);
    const totalPendentes = parcelas
      .filter(parcela => parcela.status !== "paga")
      .reduce((sum, parcela) => sum + parcela.valorParcela, 0);

    return {
      saldoFamiliar: totalEntradas - totalSaidas,
      totalEntradas,
      totalSaidas,
      totalParcelado,
      totalPago,
      totalPendentes
    };
  }

  async getUltimasTransacoes(limit = 10): Promise<Transacao[]> {
    const transacoes: Transacao[] = [];

    // Adicionar entradas
    for (const entrada of this.entradas.values()) {
      const empresa = this.empresas.get(entrada.empresaPagadoraId);
      transacoes.push({
        id: entrada.id,
        tipo: "entrada",
        data: entrada.dataReferencia,
        valor: entrada.valor,
        descricao: `Entrada - ${empresa?.nome || 'Empresa desconhecida'}`
      });
    }

    // Adicionar saídas
    for (const saida of this.saidas.values()) {
      const empresa = this.empresas.get(saida.empresaId);
      transacoes.push({
        id: saida.id,
        tipo: "saida",
        data: saida.dataSaida,
        valor: saida.valorTotal,
        descricao: `Saída - ${empresa?.nome || 'Empresa desconhecida'}`
      });
    }

    // Ordenar por data (mais recente primeiro) e limitar
    return transacoes
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();