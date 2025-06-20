import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusBadgeColor, getStatusLabel } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Check, Edit3, Filter } from "lucide-react";
import type { Saida, User } from "@shared/schema";

export default function Installments() {
  const [filters, setFilters] = useState({
    status: "todos",
    month: "",
    userId: "todos",
  });

  const { toast } = useToast();

  const { data: parcelas, isLoading } = useQuery<Saida[]>({
    queryKey: ["/api/saidas/parcelas"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const marcarPagaMutation = useMutation({
    mutationFn: ({ id, dataPagamento }: { id: number; dataPagamento: string }) =>
      apiRequest("PATCH", `/api/saidas/${id}/pagar`, { dataPagamento }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parcelas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/relatorios/resumo"] });
      toast({
        title: "Parcela marcada como paga",
        description: "Parcela atualizada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao marcar parcela",
        description: "Não foi possível marcar a parcela como paga",
        variant: "destructive",
      });
    },
  });

  const parcelasFiltradas = parcelas?.filter(p => p.saidaOriginalId !== null) || [];

  // Group parcelas by month
  const parcelasAgrupadas = parcelasFiltradas.reduce((acc, parcela) => {
    if (!parcela.dataVencimento) return acc;
    
    const date = new Date(parcela.dataVencimento);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        parcelas: []
      };
    }
    
    acc[monthKey].parcelas.push(parcela);
    return acc;
  }, {} as Record<string, { name: string; parcelas: Saida[] }>);

  const handleMarcarPaga = (parcelaId: number) => {
    const today = new Date().toISOString().split('T')[0];
    marcarPagaMutation.mutate({ id: parcelaId, dataPagamento: today });
  };

  const getUserName = (usuarioIds: string) => {
    try {
      const ids = JSON.parse(usuarioIds);
      const userNames = ids.map((id: number) => {
        const user = users?.find(u => u.id === id);
        return user?.nome || 'Usuário não encontrado';
      });
      return userNames.join(', ');
    } catch {
      return 'Usuário não encontrado';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Controle de Parcelas</h2>
        <p className="text-gray-600">Visualizar e controlar pagamento de parcelas</p>
      </div>

      {/* Filters */}
      <Card className="border-gray-100 shadow-sm mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="a_vencer">A Vencer</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                  <SelectItem value="paga">Paga</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="monthFilter" className="text-sm font-medium text-gray-700">
                Mês
              </Label>
              <Input
                id="monthFilter"
                type="month"
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="userFilter" className="text-sm font-medium text-gray-700">
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
            <div className="flex items-end">
              <Button className="w-full bg-primary hover:bg-blue-700">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installments List */}
      <div className="space-y-4">
        {Object.entries(parcelasAgrupadas).length === 0 ? (
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma parcela encontrada
              </h3>
              <p className="text-gray-500">
                Não há parcelas cadastradas ou que correspondam aos filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(parcelasAgrupadas)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([monthKey, { name, parcelas }]) => (
              <Card key={monthKey} className="border-gray-100 shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    {parcelas.map((parcela) => (
                      <div key={parcela.id} className="p-6 hover:bg-gray-50 transition duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-lg font-medium text-gray-900 mr-3">
                                {parcela.observacao || 'Compra parcelada'}
                              </span>
                              <Badge className={getStatusBadgeColor(parcela.status!)}>
                                {getStatusLabel(parcela.status!)}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-2 space-x-4">
                              <span>
                                Parcela {parcela.numeroParcela}/{parcela.totalParcelas}
                              </span>
                              <span>
                                Vencimento: {formatDate(parcela.dataVencimento!)}
                              </span>
                              <span>
                                Titular: {getUserName(parcela.usuariosTitularesIds)}
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-accent">
                              {formatCurrency(parcela.valorParcela!)}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {parcela.status !== 'paga' && (
                              <Button
                                onClick={() => handleMarcarPaga(parcela.id)}
                                className="bg-secondary hover:bg-green-700"
                                disabled={marcarPagaMutation.isPending}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Marcar como Paga
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              className="text-gray-700 hover:bg-gray-100"
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}
