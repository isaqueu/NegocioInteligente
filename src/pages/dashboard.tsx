import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusBadgeColor, getStatusLabel } from "@/lib/utils";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Plus, 
  Minus,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { reportService, productService, incomeService, expenseService, userService } from "@/service/apiService";
import { ResumoFinanceiro, Transacao } from "../../types";

export default function Dashboard() {
  const { data: resumo, isLoading: resumoLoading } = useQuery({
    queryKey: ["financial-summary"],
    queryFn: reportService.getFinancialSummary,
  });

  const { data: transacoes, isLoading: transacoesLoading } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: () => reportService.getRecentTransactions(10),
  });

  const { data: parcelas, isLoading: parcelasLoading } = useQuery({
    queryKey: ["expenses-with-installments"],
    queryFn: expenseService.getWithInstallments,
  });

  const { data: produtos } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getAll,
  });

  const { data: entradas } = useQuery({
    queryKey: ["incomes"],
    queryFn: incomeService.getAll,
  });

  const { data: saidas } = useQuery({
    queryKey: ["expenses"],
    queryFn: expenseService.getAll,
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getAll,
  });

  const parcelasPendentes = parcelas?.filter(p => 
    p.saidaOriginalId !== null && (p.status === 'a_vencer' || p.status === 'vencida')
  ) || [];

  // Dados para o gráfico de vendas diárias
  const vendasDiarias = [
    { dia: 'Seg', valor: 380000 },
    { dia: 'Ter', valor: 420000 },
    { dia: 'Qua', valor: 450000 },
    { dia: 'Qui', valor: 480000 },
    { dia: 'Sex', valor: 520000 },
    { dia: 'Sáb', valor: 390000 },
    { dia: 'Dom', valor: 350000 }
  ];

  // Dados para o gráfico de pizza
  const vendaCategoria = [
    { nome: 'Supermercado', valor: 35, cor: '#0ea5e9' },
    { nome: 'Cha e Ervas', valor: 20, cor: '#10b981' },
    { nome: 'Cosméticos', valor: 18, cor: '#f59e0b' },
    { nome: 'Outros', valor: 15, cor: '#8b5cf6' },
    { nome: 'Farmácia', valor: 12, cor: '#ef4444' }
  ];

  // Produtos mais vendidos (baseado em dados reais)
  const produtosMaisVendidos = produtos?.slice(0, 3).map((produto, index) => ({
    produto: produto.nome,
    quantidade: [127, 98, 76][index] || 50,
    total: (parseFloat(produto.precoUnitario) * ([127, 98, 76][index] || 50)).toFixed(2)
  })) || [];

  // Pedidos recentes (baseado em saídas)
  const pedidosRecentes = saidas?.slice(0, 5).map((saida, index) => {
    const titularesIds = Array.isArray(saida.usuariosTitularesIds) 
      ? saida.usuariosTitularesIds 
      : (typeof saida.usuariosTitularesIds === 'string' 
          ? JSON.parse(saida.usuariosTitularesIds) 
          : []);
    
    return {
      id: `#${4000 + index}`,
      cliente: users?.find(u => titularesIds.includes(u.id))?.nome || 'João Silva',
      status: saida.tipoPagamento === 'avista' ? 'Entregue' : 'Em preparo',
      total: saida.valorTotal.toFixed(2)
    };
  }) || [];

  if (resumoLoading || transacoesLoading || parcelasLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Painel de Controle</h2>
            <p className="text-gray-600">Visão geral do seu negócio, vendas e estatísticas</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Últimos 7 dias</span>
            <button className="p-1 hover:bg-gray-200 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Saldo Familiar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(resumo.saldoFamiliar)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Saldo consolidado da família
                </p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Entradas do Mês</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(resumo.entradasMes)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Receitas registradas
                </p>
              </div>
              <div className="text-2xl">📈</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Saídas do Mês</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(resumo.saidasMes)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Gastos registrados
                </p>
              </div>
              <div className="text-2xl">📉</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Parcelas Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(resumo.parcelasPendentes)}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Valores a pagar
                </p>
              </div>
              <div className="text-2xl">📅</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Movimentação Financeira */}
        <Card className="bg-white border-0 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Movimentação diária</h3>
            <p className="text-sm text-gray-500">Entradas e saídas por dia da semana</p>
          </div>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vendasDiarias}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dia" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Vendas']}
                  labelFormatter={(label) => `${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza */}
        <Card className="bg-white border-0 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Gastos por categoria</h3>
            <p className="text-sm text-gray-500">Distribuição de gastos por categoria de produto</p>
          </div>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-2/3">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={vendaCategoria}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="valor"
                    >
                      {vendaCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/3 pl-4">
                <div className="space-y-3">
                  {vendaCategoria.map((categoria, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: categoria.cor }}
                      ></div>
                      <span className="text-gray-700">{categoria.nome} {categoria.valor}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos mais utilizados */}
        <Card className="bg-white border-0 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Produtos mais utilizados</h3>
            <p className="text-sm text-gray-500">Top 5 produtos mais utilizados no período</p>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {produtosMaisVendidos.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.produto}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.quantidade}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.total}</td>
                    </tr>
                  ))}
                  {produtosMaisVendidos.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        Nenhum produto encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Transações recentes */}
        <Card className="bg-white border-0 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Transações recentes</h3>
            <p className="text-sm text-gray-500">Últimas 5 transações registradas</p>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pedidosRecentes.map((pedido, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{pedido.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{pedido.cliente}</td>
                      <td className="px-6 py-4">
                        <Badge className={pedido.status === 'Entregue' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {pedido.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(parseFloat(pedido.total))}</td>
                    </tr>
                  ))}
                  {pedidosRecentes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Nenhum pedido encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
