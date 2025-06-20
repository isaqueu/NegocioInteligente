import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Download,
  Filter,
  Loader2
} from "lucide-react";
import { Usuario, ResumoFinanceiro } from "../../types";

// Removido: interface TransacaoRelatorio - usando Transacao do types.ts

export default function Reports() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    userId: "todos",
    type: "todos",
    paymentType: "todos",
  });

  const { data: resumo } = useQuery({
    queryKey: ["financial-summary"],
    queryFn: reportService.getFinancialSummary,
  });

  const { data: transacoes } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: () => reportService.getRecentTransactions(50),
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getAll,
  });

  const { data: empresas } = useQuery({
    queryKey: ["companies"],
    queryFn: companyService.getAll,
  });

  const handleExportCSV = () => {
    if (!transacoes || transacoes.length === 0) {
      alert("Nenhuma transação para exportar");
      return;
    }

    const headers = ["Data", "Tipo", "Descrição", "Usuário", "Empresa", "Valor"];
    const csvContent = [
      headers.join(","),
      ...transacoes.map(t => [
        formatDate(t.data),
        t.tipo === 'entrada' ? 'Entrada' : 'Saída',
        `"${t.descricao}"`,
        `"${t.usuario}"`,
        `"${t.empresa}"`,
        t.valor.toFixed(2).replace('.', ',')
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saldoLiquido = (resumo?.entradasMes || 0) - (resumo?.saidasMes || 0);

  const { isLoading: loading } = useQuery({
    queryKey: ["reports", filters],
    queryFn: () => reportService.getFilteredTransactions(filters),
  });

  const filteredTransactions = transacoes?.filter((transacao) => {
    const matchUser = filters.userId === "todos" || 
      transacao.usuarioId?.toString() === filters.userId;
    const matchType = filters.type === "todos" || transacao.tipo === filters.type;
    return matchUser && matchType;
  }) || [];

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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Relatórios</h2>
        <p className="text-gray-600">Visualizar dados financeiros com filtros e gráficos</p>
      </div>

      {/* Filters Section */}
      <Card className="border-gray-100 shadow-sm mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                Data Inicial
              </Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                Data Final
              </Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="userReportFilter" className="text-sm font-medium text-gray-700">
                Usuário
              </Label>
              <Select
                value={filters.userId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, userId: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="typeFilter" className="text-sm font-medium text-gray-700">
                Tipo
              </Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentFilter" className="text-sm font-medium text-gray-700">
                Pagamento
              </Label>
              <Select
                value={filters.paymentType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, paymentType: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="avista">À Vista</SelectItem>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-primary hover:bg-blue-700">
                <BarChart3 className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Entradas</p>
                <p className="text-3xl font-bold text-secondary">
                  {formatCurrency(resumo?.entradasMes || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Saídas</p>
                <p className="text-3xl font-bold text-accent">
                  {formatCurrency(resumo?.saidasMes || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
                <p className={`text-3xl font-bold ${
                  saldoLiquido >= 0 ? 'text-secondary' : 'text-destructive'
                }`}>
                  {formatCurrency(saldoLiquido)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Transações</h3>
            <Button
              onClick={handleExportCSV}
              className="bg-secondary hover:bg-green-700"
              disabled={!transacoes || transacoes.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
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
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transacoes?.map((transacao) => (
                  <tr key={transacao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transacao.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={
                        transacao.tipo === 'entrada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }>
                        {transacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transacao.descricao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transacao.usuario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transacao.empresa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={
                        transacao.tipo === 'entrada' 
                          ? 'text-secondary' 
                          : 'text-accent'
                      }>
                        {transacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(transacao.valor)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!transacoes || transacoes.length === 0) && (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Nenhuma transação encontrada
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Não há transações no período selecionado.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}