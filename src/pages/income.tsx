import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import type { User, Empresa, InsertEntrada } from "@shared/schema";

export default function Income() {
  const [formData, setFormData] = useState({
    usuarioTitularId: "",
    dataReferencia: new Date().toISOString().split('T')[0],
    valor: "",
    empresaPagadoraId: "",
  });

  const { toast } = useToast();

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: empresas } = useQuery<Empresa[]>({
    queryKey: ["/api/empresas"],
  });

  const empresasPagadoras = empresas?.filter(e => e.tipo === 'pagadora') || [];

  const createMutation = useMutation({
    mutationFn: (data: InsertEntrada) => apiRequest("POST", "/api/entradas", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entradas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/relatorios/resumo"] });
      queryClient.invalidateQueries({ queryKey: ["/api/relatorios/transacoes"] });
      
      toast({
        title: "Entrada registrada",
        description: "Entrada financeira registrada com sucesso",
      });

      // Reset form
      setFormData({
        usuarioTitularId: "",
        dataReferencia: new Date().toISOString().split('T')[0],
        valor: "",
        empresaPagadoraId: "",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao registrar entrada",
        description: "Não foi possível registrar a entrada",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não encontrado",
        variant: "destructive",
      });
      return;
    }

    if (!formData.usuarioTitularId || !formData.valor || !formData.empresaPagadoraId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const entradaData: InsertEntrada = {
      usuarioTitularId: parseInt(formData.usuarioTitularId),
      dataReferencia: formData.dataReferencia,
      valor: parseFloat(formData.valor).toFixed(2),
      empresaPagadoraId: parseInt(formData.empresaPagadoraId),
      usuarioRegistroId: currentUser.id,
    };

    createMutation.mutate(entradaData);
  };

  const handleClear = () => {
    setFormData({
      usuarioTitularId: "",
      dataReferencia: new Date().toISOString().split('T')[0],
      valor: "",
      empresaPagadoraId: "",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Registro de Entrada</h2>
        <p className="text-gray-600">Registrar uma nova entrada financeira</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="usuarioTitularId" className="text-sm font-medium text-gray-700">
                  Membro da Família
                </Label>
                <Select
                  value={formData.usuarioTitularId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, usuarioTitularId: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione o membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dataReferencia" className="text-sm font-medium text-gray-700">
                  Data de Referência
                </Label>
                <Input
                  id="dataReferencia"
                  type="date"
                  value={formData.dataReferencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataReferencia: e.target.value }))}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="valor" className="text-sm font-medium text-gray-700">
                  Valor (R$)
                </Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder="0,00"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="empresaPagadoraId" className="text-sm font-medium text-gray-700">
                  Empresa Pagadora
                </Label>
                <Select
                  value={formData.empresaPagadoraId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, empresaPagadoraId: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresasPagadoras.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id.toString()}>
                        {empresa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-blue-700"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar Entrada"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="px-6"
                >
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
