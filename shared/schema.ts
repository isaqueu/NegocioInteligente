import { pgTable, text, serial, integer, boolean, decimal, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  username: text("username").notNull().unique(),
  senha: text("senha").notNull(),
  papel: text("papel").notNull(), // pai, mae, filho, filha
  saldo: decimal("saldo", { precision: 10, scale: 2 }).default("0"),
});

export const empresas = pgTable("empresas", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  tipo: text("tipo").notNull(), // pagadora, recebedora
});

export const produtos = pgTable("produtos", {
  id: serial("id").primaryKey(),
  codigoBarras: text("codigo_barras"),
  nome: text("nome").notNull(),
  unidade: text("unidade").notNull(),
  classificacao: text("classificacao").notNull(),
  precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }).notNull(),
});

export const entradas = pgTable("entradas", {
  id: serial("id").primaryKey(),
  usuarioTitularId: integer("usuario_titular_id").notNull(),
  dataReferencia: date("data_referencia").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  empresaPagadoraId: integer("empresa_pagadora_id").notNull(),
  dataHoraRegistro: timestamp("data_hora_registro").defaultNow(),
  usuarioRegistroId: integer("usuario_registro_id").notNull(),
});

export const saidas = pgTable("saidas", {
  id: serial("id").primaryKey(),
  usuariosTitularesIds: text("usuarios_titulares_ids").notNull(), // JSON array
  empresaId: integer("empresa_id").notNull(),
  dataSaida: date("data_saida").notNull(),
  tipoPagamento: text("tipo_pagamento").notNull(), // avista, parcelado
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  observacao: text("observacao"),
  usuarioRegistroId: integer("usuario_registro_id").notNull(),
  dataHoraRegistro: timestamp("data_hora_registro").defaultNow(),
  saidaOriginalId: integer("saida_original_id"), // para parcelas
  numeroParcela: integer("numero_parcela"), // para parcelas
  totalParcelas: integer("total_parcelas"), // para parcelas
  dataVencimento: date("data_vencimento"), // para parcelas
  valorParcela: decimal("valor_parcela", { precision: 10, scale: 2 }), // para parcelas
  status: text("status").default("pendente"), // paga, vencida, a_vencer, pendente
});

export const itensSaida = pgTable("itens_saida", {
  id: serial("id").primaryKey(),
  saidaId: integer("saida_id").notNull(),
  produtoId: integer("produto_id").notNull(),
  quantidade: decimal("quantidade", { precision: 10, scale: 3 }).notNull(),
  precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }).notNull(),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  saldo: true,
});

export const insertEmpresaSchema = createInsertSchema(empresas).omit({
  id: true,
});

export const insertProdutoSchema = createInsertSchema(produtos).omit({
  id: true,
});

export const insertEntradaSchema = createInsertSchema(entradas).omit({
  id: true,
  dataHoraRegistro: true,
});

export const insertSaidaSchema = createInsertSchema(saidas).omit({
  id: true,
  dataHoraRegistro: true,
  saidaOriginalId: true,
  numeroParcela: true,
  totalParcelas: true,
  dataVencimento: true,
  valorParcela: true,
  status: true,
});

export const insertItemSaidaSchema = createInsertSchema(itensSaida).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Empresa = typeof empresas.$inferSelect;
export type InsertEmpresa = z.infer<typeof insertEmpresaSchema>;

export type Produto = typeof produtos.$inferSelect;
export type InsertProduto = z.infer<typeof insertProdutoSchema>;

export type Entrada = typeof entradas.$inferSelect;
export type InsertEntrada = z.infer<typeof insertEntradaSchema>;

export type Saida = typeof saidas.$inferSelect;
export type InsertSaida = z.infer<typeof insertSaidaSchema>;

export type ItemSaida = typeof itensSaida.$inferSelect;
export type InsertItemSaida = z.infer<typeof insertItemSaidaSchema>;

// Additional types for frontend
export interface SaidaCompleta extends Saida {
  itens: ItemSaida[];
  empresa: Empresa;
  usuarios: User[];
}

export interface SaidaComParcelas extends Saida {
  parcelas?: Saida[];
}

export interface ResumoFinanceiro {
  saldoFamiliar: number;
  entradasMes: number;
  saidasMes: number;
  parcelasPendentes: number;
}

export interface ParcelaInput {
  valor: number;
  dataVencimento: string;
}

export interface SaidaParceladaInput extends Omit<InsertSaida, 'tipoPagamento'> {
  tipoPagamento: 'parcelado';
  numeroParcelas: number;
  dataPrimeiraParcela: string;
  parcelas: ParcelaInput[];
  itens: Omit<InsertItemSaida, 'saidaId'>[];
}

export interface SaidaAVistaInput extends Omit<InsertSaida, 'tipoPagamento'> {
  tipoPagamento: 'avista';
  itens: Omit<InsertItemSaida, 'saidaId'>[];
}

export type SaidaInput = SaidaParceladaInput | SaidaAVistaInput;
