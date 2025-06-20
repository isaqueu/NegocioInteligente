import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  UsuarioInput, EmpresaInput, ProdutoInput, 
  EntradaInput, SaidaInput
} from "../client/types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth
  app.post("/api/login", async (req, res) => {
    try {
      const { username, senha } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.senha !== senha) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData: UsuarioInput = req.body;
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao criar usuário", error: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir usuário" });
    }
  });

  // Empresas
  app.get("/api/empresas", async (req, res) => {
    try {
      const empresas = await storage.listEmpresas();
      res.json(empresas);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar empresas" });
    }
  });

  app.post("/api/empresas", async (req, res) => {
    try {
      const empresaData: EmpresaInput = req.body;
      const empresa = await storage.createEmpresa(empresaData);
      res.status(201).json(empresa);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao criar empresa", error: error.message });
    }
  });

  app.put("/api/empresas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const empresaData = insertEmpresaSchema.partial().parse(req.body);
      const empresa = await storage.updateEmpresa(id, empresaData);
      res.json(empresa);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar empresa" });
    }
  });

  app.delete("/api/empresas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmpresa(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir empresa" });
    }
  });

  // Produtos
  app.get("/api/produtos", async (req, res) => {
    try {
      const produtos = await storage.listProdutos();
      res.json(produtos);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produtos" });
    }
  });

  app.get("/api/produtos/barcode/:barcode", async (req, res) => {
    try {
      const produto = await storage.getProdutoByBarcode(req.params.barcode);
      if (!produto) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      res.json(produto);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produto" });
    }
  });

  app.post("/api/produtos", async (req, res) => {
    try {
      const produtoData: ProdutoInput = req.body;
      const produto = await storage.createProduto(produtoData);
      res.status(201).json(produto);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao criar produto", error: error.message });
    }
  });

  app.put("/api/produtos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const produtoData = insertProdutoSchema.partial().parse(req.body);
      const produto = await storage.updateProduto(id, produtoData);
      res.json(produto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar produto" });
    }
  });

  app.delete("/api/produtos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduto(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir produto" });
    }
  });

  // Entradas
  app.get("/api/entradas", async (req, res) => {
    try {
      const entradas = await storage.listEntradas();
      res.json(entradas);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar entradas" });
    }
  });

  app.post("/api/entradas", async (req, res) => {
    try {
      const entradaData: EntradaInput = req.body;
      const entrada = await storage.createEntrada(entradaData);
      res.status(201).json(entrada);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao criar entrada", error: error.message });
    }
  });

  // Saídas
  app.get("/api/saidas", async (req, res) => {
    try {
      const saidas = await storage.listSaidas();
      res.json(saidas);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar saídas" });
    }
  });

  app.get("/api/saidas/completas", async (req, res) => {
    try {
      const saidas = await storage.getSaidasCompletas();
      res.json(saidas);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar saídas completas" });
    }
  });

  app.get("/api/saidas/parcelas", async (req, res) => {
    try {
      const parcelas = await storage.getSaidasComParcelas();
      res.json(parcelas);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar parcelas" });
    }
  });

  app.post("/api/saidas", async (req, res) => {
    try {
      const saidaData = req.body as SaidaInput;
      const saida = await storage.createSaida(saidaData);
      res.status(201).json(saida);
    } catch (error) {
      console.error('Erro ao criar saída:', error);
      res.status(500).json({ message: "Erro ao criar saída" });
    }
  });

  app.patch("/api/saidas/:id/pagar", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { dataPagamento } = req.body;
      await storage.marcarParcelaPaga(id, dataPagamento);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao marcar parcela como paga" });
    }
  });

  // Relatórios
  app.get("/api/relatorios/resumo", async (req, res) => {
    try {
      const resumo = await storage.getResumoFinanceiro();
      res.json(resumo);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar resumo financeiro" });
    }
  });

  app.get("/api/relatorios/transacoes", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const transacoes = await storage.getUltimasTransacoes(limit);
      res.json(transacoes);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar transações" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
