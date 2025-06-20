import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { reportService, userService, companyService } from "@/service/apiService";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Download,
  Filter,
  Loader2
} from "lucide-react";
import { Usuario, ResumoFinanceiro, Transacao } from "../../types";

export default function Reports() {
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    userId: "todos",
    type: "todos",
    paymentType: "todos",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resumoData, transacoesData, usersData] = await Promise.all([
        reportService.getFinancialSummary(),
        reportService.getRecentTransactions(50),
        userService.getAll(),
      ]);

      setResumo(resumoData);
      setTransacoes(transacoesData);
      setUsers(usersData);
    } catch (error) {
      console.error("Erro ao carregar dados dos relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      entrada: "Entrada",
      saida: "Saída",
      parcela: "Parcela"
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getTipoBadge = (tipo: string) => {
    const config = {
      entrada: "bg-green-100 text-green-800",
      saida: "bg-red-100 text-red-800",
      parcela: "bg-yellow-100 text-yellow-800"
    };
    return config[tipo as keyof typeof config] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <div className="text-lg">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Relatórios Financeiros</h2>
          <p className="text-gray-600">Análise detalhada do desempenho financeiro</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total de Entradas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(resumo?.totalEntradas || 0)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">Receitas</span>
                </div>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total de Saídas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(resumo?.totalSaidas || 0)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-xs text-red-600">Despesas</span>
                </div>
              </div>
              <div className="text-2xl">📉</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Saldo Líquido</p>
                <p className={`text-2xl font-bold ${(resumo?.saldoLiquido || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(resumo?.saldoLiquido || 0)}
                </p>
                <div className="flex items-center mt-2">
                  <BarChart3 className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-xs text-blue-600">Resultado</span>
                </div>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Parcelas Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(resumo?.parcelasPendentes || 0)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-yellow-600 mr-1" />
                  <span className="text-xs text-yellow-600">A pagar</span>
                </div>
              </div>
              <div className="text-2xl">📅</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="userId">Usuário</Label>
              <Select value={filters.userId} onValueChange={(value) => setFilters(prev => ({ ...prev, userId: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecionar usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os usuários</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saídas</SelectItem>
                  <SelectItem value="parcela">Parcelas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Transações */}
      <Card className="border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Transações Recentes</h3>
          <p className="text-sm text-gray-500">Últimas {transacoes.length} transações registradas</p>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transacoes.map((transacao) => (
                  <tr key={transacao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transacao.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getTipoBadge(transacao.tipo)}>
                        {getTipoLabel(transacao.tipo)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transacao.descricao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                        {transacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(parseFloat(transacao.valor))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transacao.nomeUsuario || "Sistema"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transacoes.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma transação</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Não há transações para exibir no momento.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}