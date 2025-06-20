
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { installmentService } from "@/service/apiService";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Parcela } from "../../types";

export default function Installments() {
  const { toast } = useToast();
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingInstallment, setPayingInstallment] = useState<number | null>(null);

  useEffect(() => {
    loadInstallments();
  }, []);

  const loadInstallments = async () => {
    try {
      setLoading(true);
      const data = await installmentService.getAll();
      setParcelas(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar parcelas",
        description: "Não foi possível carregar as parcelas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      setPayingInstallment(id);
      const today = new Date().toISOString().split('T')[0];
      await installmentService.markAsPaid(id, today);
      
      toast({
        title: "Parcela paga",
        description: "Parcela marcada como paga com sucesso",
      });
      
      await loadInstallments();
    } catch (error) {
      toast({
        title: "Erro ao marcar como paga",
        description: "Não foi possível marcar a parcela como paga",
        variant: "destructive",
      });
    } finally {
      setPayingInstallment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'paga': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'a_vencer': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'vencida': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.a_vencer;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status === 'paga' ? 'Paga' : status === 'a_vencer' ? 'A Vencer' : 'Vencida'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <div className="text-lg">Carregando parcelas...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Gestão de Parcelas</h2>
          <p className="text-gray-600">Controle de parcelas a pagar e receber</p>
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parcela
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parcelas.map((parcela) => (
                  <tr key={parcela.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Parcela {parcela.numeroParcela}
                          </div>
                          <div className="text-sm text-gray-500">
                            de {parcela.totalParcelas}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(parseFloat(parcela.valor))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(parcela.dataVencimento)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(parcela.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {parcela.status !== 'paga' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(parcela.id)}
                          disabled={payingInstallment === parcela.id}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          {payingInstallment === parcela.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar como Paga
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parcelas.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma parcela</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Não há parcelas cadastradas no momento.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
