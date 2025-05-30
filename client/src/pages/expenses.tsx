import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { formatCurrency, addMonths } from "@/lib/utils";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { User, Empresa, Produto, SaidaInput, SaidaParceladaInput, ParcelaInput } from "@shared/schema";

interface ItemSaida {
  produtoId: string;
  quantidade: string;
  precoUnitario: string;
}

export default function Expenses() {
  const [formData, setFormData] = useState({
    usuariosTitularesIds: [] as number[],
    empresaId: "",
    dataSaida: new Date().toISOString().split('T')[0],
    tipoPagamento: "avista" as "avista" | "parcelado",
    observacao: "",
    numeroParcelas: "",
    dataPrimeiraParcela: new Date().toISOString().split('T')[0],
  });

  const [itens, setItens] = useState<ItemSaida[]>([
    { produtoId: "", quantidade: "1", precoUnitario: "0" }
  ]);

  const [parcelas, setParcelas] = useState<ParcelaInput[]>([]);
  const [showParcelas, setShowParcelas] = useState(false);

  const { toast } = useToast();

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: empresas } = useQuery<Empresa[]>({
    queryKey: ["/api/empresas"],
  });

  const { data: produtos } = useQuery<Produto[]>({
    queryKey: ["/api/produtos"],
  });

  const empresasRecebedoras = empresas?.filter(e => e.tipo === 'recebedora') || [];

  const createMutation = useMutation({
    mutationFn: (data: SaidaInput) => apiRequest("POST", "/api/saidas", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saidas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/relatorios/resumo"] });
      queryClient.invalidateQueries({ queryKey: ["/api/relatorios/transacoes"] });
      
      toast({
        title: "Saída registrada",
        description: "Saída financeira registrada com sucesso",
      });

      handleClear();
    },
    onError: () => {
      toast({
        title: "Erro ao registrar saída",
        description: "Não foi possível registrar a saída",
        variant: "destructive",
      });
    },
  });

  const calculateTotal = () => {
    return itens.reduce((total, item) => {
      const quantidade = parseFloat(item.quantidade) || 0;
      const preco = parseFloat(item.precoUnitario) || 0;
      return total + (quantidade * preco);
    }, 0);
  };

  const handleUserChange = (userId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      usuariosTitularesIds: checked
        ? [...prev.usuariosTitularesIds, userId]
        : prev.usuariosTitularesIds.filter(id => id !== userId)
    }));
  };

  const handleItemChange = (index: number, field: keyof ItemSaida, value: string) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };

    // Auto-fill price when product is selected
    if (field === 'produtoId' && value) {
      const produto = produtos?.find(p => p.id === parseInt(value));
      if (produto) {
        newItens[index].precoUnitario = produto.precoUnitario;
      }
    }

    setItens(newItens);
  };

  const addItem = () => {
    setItens([...itens, { produtoId: "", quantidade: "1", precoUnitario: "0" }]);
  };

  const removeItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const generateParcelas = () => {
    const numeroParcelas = parseInt(formData.numeroParcelas);
    const total = calculateTotal();
    const valorParcela = total / numeroParcelas;
    const primeiraParcela = new Date(formData.dataPrimeiraParcela);

    const novasParcelas: ParcelaInput[] = [];
    for (let i = 0; i < numeroParcelas; i++) {
      const dataVencimento = addMonths(primeiraParcela, i);
      novasParcelas.push({
        valor: valorParcela,
        dataVencimento: dataVencimento.toISOString().split('T')[0]
      });
    }

    setParcelas(novasParcelas);
    setShowParcelas(true);
  };

  const updateParcela = (index: number, field: keyof ParcelaInput, value: string | number) => {
    const novasParcelas = [...parcelas];
    novasParcelas[index] = { ...novasParcelas[index], [field]: value };
    setParcelas(novasParcelas);
  };

  useEffect(() => {
    if (formData.tipoPagamento === 'parcelado' && formData.numeroParcelas && formData.dataPrimeiraParcela) {
      generateParcelas();
    } else {
      setShowParcelas(false);
    }
  }, [formData.numeroParcelas, formData.dataPrimeiraParcela, formData.tipoPagamento]);

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

    if (formData.usuariosTitularesIds.length === 0 || !formData.empresaId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const itensValidos = itens.filter(item => item.produtoId && item.quantidade && item.precoUnitario);
    if (itensValidos.length === 0) {
      toast({
        title: "Itens obrigatórios",
        description: "Adicione pelo menos um item à saída",
        variant: "destructive",
      });
      return;
    }

    const itensFormatados = itensValidos.map(item => ({
      produtoId: parseInt(item.produtoId),
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario
    }));

    if (formData.tipoPagamento === 'avista') {
      const saidaData: SaidaInput = {
        usuariosTitularesIds: JSON.stringify(formData.usuariosTitularesIds),
        empresaId: parseInt(formData.empresaId),
        dataSaida: formData.dataSaida,
        tipoPagamento: 'avista',
        observacao: formData.observacao || null,
        usuarioRegistroId: currentUser.id,
        itens: itensFormatados,
      };

      createMutation.mutate(saidaData);
    } else {
      if (!formData.numeroParcelas || parcelas.length === 0) {
        toast({
          title: "Parcelas obrigatórias",
          description: "Configure as parcelas para saída parcelada",
          variant: "destructive",
        });
        return;
      }

      const saidaData: SaidaParceladaInput = {
        usuariosTitularesIds: JSON.stringify(formData.usuariosTitularesIds),
        empresaId: parseInt(formData.empresaId),
        dataSaida: formData.dataSaida,
        tipoPagamento: 'parcelado',
        observacao: formData.observacao || null,
        usuarioRegistroId: currentUser.id,
        numeroParcelas: parseInt(formData.numeroParcelas),
        dataPrimeiraParcela: formData.dataPrimeiraParcela,
        parcelas,
        itens: itensFormatados,
      };

      createMutation.mutate(saidaData);
    }
  };

  const handleClear = () => {
    setFormData({
      usuariosTitularesIds: [],
      empresaId: "",
      dataSaida: new Date().toISOString().split('T')[0],
      tipoPagamento: "avista",
      observacao: "",
      numeroParcelas: "",
      dataPrimeiraParcela: new Date().toISOString().split('T')[0],
    });
    setItens([{ produtoId: "", quantidade: "1", precoUnitario: "0" }]);
    setParcelas([]);
    setShowParcelas(false);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Registro de Saída</h2>
        <p className="text-gray-600">Registrar uma nova saída financeira</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Membros Participantes
                  </Label>
                  <div className="space-y-2">
                    {users?.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={formData.usuariosTitularesIds.includes(user.id)}
                          onCheckedChange={(checked) => 
                            handleUserChange(user.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={`user-${user.id}`} className="text-sm">
                          {user.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="empresaId" className="text-sm font-medium text-gray-700">
                    Empresa Recebedora
                  </Label>
                  <Select
                    value={formData.empresaId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, empresaId: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresasRecebedoras.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id.toString()}>
                          {empresa.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dataSaida" className="text-sm font-medium text-gray-700">
                    Data da Saída
                  </Label>
                  <Input
                    id="dataSaida"
                    type="date"
                    value={formData.dataSaida}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataSaida: e.target.value }))}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tipoPagamento" className="text-sm font-medium text-gray-700">
                    Tipo de Pagamento
                  </Label>
                  <Select
                    value={formData.tipoPagamento}
                    onValueChange={(value: "avista" | "parcelado") => 
                      setFormData(prev => ({ ...prev, tipoPagamento: value }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avista">À Vista</SelectItem>
                      <SelectItem value="parcelado">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Installment Options */}
              {formData.tipoPagamento === 'parcelado' && (
                <div className="space-y-6 border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="numeroParcelas" className="text-sm font-medium text-gray-700">
                        Número de Parcelas
                      </Label>
                      <Input
                        id="numeroParcelas"
                        type="number"
                        min="2"
                        max="60"
                        value={formData.numeroParcelas}
                        onChange={(e) => setFormData(prev => ({ ...prev, numeroParcelas: e.target.value }))}
                        placeholder="Ex: 12"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dataPrimeiraParcela" className="text-sm font-medium text-gray-700">
                        Data da Primeira Parcela
                      </Label>
                      <Input
                        id="dataPrimeiraParcela"
                        type="date"
                        value={formData.dataPrimeiraParcela}
                        onChange={(e) => setFormData(prev => ({ ...prev, dataPrimeiraParcela: e.target.value }))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Installments Preview */}
                  {showParcelas && parcelas.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-800 mb-4">
                        Previsão das Parcelas
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                          {parcelas.map((parcela, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                              <div>
                                <span className="font-medium">
                                  Parcela {index + 1}/{parcelas.length}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="date"
                                  value={parcela.dataVencimento}
                                  onChange={(e) => updateParcela(index, 'dataVencimento', e.target.value)}
                                  className="w-40"
                                />
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={parcela.valor}
                                  onChange={(e) => updateParcela(index, 'valor', parseFloat(e.target.value))}
                                  className="w-24 text-right"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Items Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-800">Itens da Compra</h4>
                  <Button
                    type="button"
                    onClick={addItem}
                    className="bg-secondary hover:bg-green-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {itens.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-1">
                            Produto
                          </Label>
                          <Select
                            value={item.produtoId}
                            onValueChange={(value) => handleItemChange(index, 'produtoId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {produtos?.map((produto) => (
                                <SelectItem key={produto.id} value={produto.id.toString()}>
                                  {produto.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantidade
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.quantidade}
                            onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-1">
                            Preço Unitário
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.precoUnitario}
                            onChange={(e) => handleItemChange(index, 'precoUnitario', e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeItem(index)}
                            disabled={itens.length === 1}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              {/* Observação */}
              <div>
                <Label htmlFor="observacao" className="text-sm font-medium text-gray-700">
                  Observação (Opcional)
                </Label>
                <Textarea
                  id="observacao"
                  rows={3}
                  value={formData.observacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                  placeholder="Observações sobre a compra..."
                  className="mt-2"
                />
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
                    "Registrar Saída"
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
