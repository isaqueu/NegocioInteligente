import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, getStatusBadgeColor, getStatusLabel } from "@/lib/utils";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Plus, 
  Minus,
  DollarSign
} from "lucide-react";
import type { ResumoFinanceiro } from "@shared/schema";

export default function Dashboard() {
  const { data: resumo, isLoading: resumoLoading } = useQuery<ResumoFinanceiro>({
    queryKey: ["/api/relatorios/resumo"],
  });

  const { data: transacoes, isLoading: transacoesLoading } = useQuery<any[]>({
    queryKey: ["/api/relatorios/transacoes"],
  });

  const { data: parcelas, isLoading: parcelasLoading } = useQuery<any[]>({
    queryKey: ["/api/saidas/parcelas"],
  });

  const parcelasPendentes = parcelas?.filter(p => 
    p.saidaOriginalId !== null && (p.status === 'a_vencer' || p.status === 'vencida')
  ) || [];

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
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral da situação financeira familiar</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Familiar</p>
                <p className="text-3xl font-bold text-secondary">
                  {formatCurrency(resumo?.saldoFamiliar || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entradas do Mês</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(resumo?.entradasMes || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saídas do Mês</p>
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
                <p className="text-sm font-medium text-gray-600">Parcelas Pendentes</p>
                <p className="text-3xl font-bold text-destructive">
                  {resumo?.parcelasPendentes || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-destructive bg-opacity-10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Pending Installments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Transações Recentes</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              {transacoes?.slice(0, 5).map((transacao, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      transacao.tipo === 'entrada' 
                        ? 'bg-secondary bg-opacity-10' 
                        : 'bg-accent bg-opacity-10'
                    }`}>
                      {transacao.tipo === 'entrada' ? (
                        <Plus className="h-5 w-5 text-secondary" />
                      ) : (
                        <Minus className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transacao.descricao}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transacao.data)} - {transacao.usuario}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    transacao.tipo === 'entrada' ? 'text-secondary' : 'text-accent'
                  }`}>
                    {transacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(transacao.valor)}
                  </span>
                </div>
              ))}
              {(!transacoes || transacoes.length === 0) && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma transação encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Installments */}
        <Card className="border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Parcelas Pendentes</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              {parcelasPendentes.slice(0, 5).map((parcela, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{parcela.observacao}</p>
                    <p className="text-sm text-gray-500">
                      Vence em {formatDate(parcela.dataVencimento)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-accent font-semibold">
                      {formatCurrency(parcela.valorParcela)}
                    </span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(parcela.status)}`}>
                        {getStatusLabel(parcela.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {parcelasPendentes.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma parcela pendente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
