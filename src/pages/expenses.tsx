import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { authService } from "@/lib/auth";
import { userService, productService, expenseService } from "@/service/apiService";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ShoppingCart, Search } from "lucide-react";
import { Usuario, Produto, SaidaInput, ItemSaida } from "../../types";

export default function Expenses() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [products, setProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    descricao: "",
    valorTotal: 0,
    metodoPagamento: "",
    empresaId: "",
    usuarioId: "",
    observacoes: "",
    temParcelas: false,
    quantidadeParcelas: 1,
    dataPrimeiraParcela: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState<ItemSaidaInput[]>([
    {
      produtoId: 0,
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, companiesData, productsData] = await Promise.all([
        userService.getAll(),
        companyService.getAll(),
        productService.getAll(),
      ]);
      setUsers(usersData);
      setCompanies(companiesData);
      setProducts(productsData);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados necessários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, {
      produtoId: 0,
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof ItemSaidaInput, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantidade' || field === 'valorUnitario') {
      newItems[index].valorTotal = newItems[index].quantidade * newItems[index].valorUnitario;
    }

    setItems(newItems);
    updateTotalValue(newItems);
  };

  const updateTotalValue = (currentItems: ItemSaidaInput[]) => {
    const total = currentItems.reduce((sum, item) => sum + item.valorTotal, 0);
    setFormData(prev => ({ ...prev, valorTotal: total }));
  };

  const handleBarcodeScanned = async (barcode: string) => {
    if (scanningIndex === null) return;

    try {
      const product = await productService.getByBarcode(barcode);
      updateItem(scanningIndex, 'produtoId', product.id);
      setShowScanner(false);
      setScanningIndex(null);

      toast({
        title: "Produto encontrado",
        description: `${product.nome} adicionado ao item`,
      });
    } catch (error) {
      toast({
        title: "Produto não encontrado",
        description: "Código de barras não encontrado no sistema",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0 || items.some(item => item.produtoId === 0)) {
      toast({
        title: "Erro de validação",
        description: "Todos os itens devem ter um produto selecionado",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const expenseData: SaidaInput = {
        descricao: formData.descricao,
        valorTotal: formData.valorTotal,
        metodoPagamento: formData.metodoPagamento,
        empresaId: parseInt(formData.empresaId),
        usuarioId: parseInt(formData.usuarioId),
        observacoes: formData.observacoes,
        temParcelas: formData.temParcelas,
        quantidadeParcelas: formData.temParcelas ? formData.quantidadeParcelas : 1,
        dataPrimeiraParcela: formData.temParcelas ? formData.dataPrimeiraParcela : undefined,
        itens: items,
      };

      await expenseService.create(expenseData);

      toast({
        title: "Saída registrada",
        description: "Saída registrada com sucesso",
      });

      handleClear();
    } catch (error: any) {
      toast({
        title: "Erro ao registrar saída",
        description: error.response?.data?.message || "Não foi possível registrar a saída",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      descricao: "",
      valorTotal: 0,
      metodoPagamento: "",
      empresaId: "",
      usuarioId: "",
      observacoes: "",
      temParcelas: false,
      quantidadeParcelas: 1,
      dataPrimeiraParcela: new Date().toISOString().split('T')[0],
    });
    setItems([{
      produtoId: 0,
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
    }]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Saída</h1>
          <p className="text-gray-600">Registre saídas de produtos e despesas</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seção de Itens da Compra - TOPO */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Itens da Compra</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="text-primary border-primary hover:bg-primary hover:text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                <div className="space-y-4 border-2 border-dashed border-gray-200 rounded-lg p-4">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-lg">
                      <div className="col-span-4">
                        <Label className="text-sm font-medium text-gray-700">Produto</Label>
                        <Select 
                          value={item.produtoId.toString()} 
                          onValueChange={(value) => updateItem(index, 'produtoId', parseInt(value))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.nome} - {product.unidade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Quantidade</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.quantidade}
                          onChange={(e) => updateItem(index, 'quantidade', parseFloat(e.target.value) || 0)}
                          className="mt-2"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Valor Unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.valorUnitario}
                          onChange={(e) => updateItem(index, 'valorUnitario', parseFloat(e.target.value) || 0)}
                          className="mt-2"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Total</Label>
                        <Input
                          type="text"
                          value={formatCurrency(item.valorTotal)}
                          readOnly
                          className="mt-2 bg-gray-100"
                        />
                      </div>

                      <div className="col-span-2 flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setScanningIndex(index);
                            setShowScanner(true);
                          }}
                          className="flex-1"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Geral:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(formData.valorTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Dados da Saída */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">
                    Descrição
                  </Label>
                  <Input
                    id="descricao"
                    type="text"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição da saída"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="metodoPagamento" className="text-sm font-medium text-gray-700">
                    Método de Pagamento
                  </Label>
                  <Select value={formData.metodoPagamento} onValueChange={(value) => setFormData(prev => ({ ...prev, metodoPagamento: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="empresaId" className="text-sm font-medium text-gray-700">
                    Empresa
                  </Label>
                  <Select value={formData.empresaId} onValueChange={(value) => setFormData(prev => ({ ...prev, empresaId: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="usuarioId" className="text-sm font-medium text-gray-700">
                    Usuário Responsável
                  </Label>
                  <Select value={formData.usuarioId} onValueChange={(value) => setFormData(prev => ({ ...prev, usuarioId: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione o usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais sobre a saída"
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Parcelamento */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="temParcelas"
                    checked={formData.temParcelas}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, temParcelas: !!checked }))}
                  />
                  <Label htmlFor="temParcelas" className="text-sm font-medium text-gray-700">
                    Dividir em parcelas
                  </Label>
                </div>

                {formData.temParcelas && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="quantidadeParcelas" className="text-sm font-medium text-gray-700">
                        Quantidade de Parcelas
                      </Label>
                      <Input
                        id="quantidadeParcelas"
                        type="number"
                        min="1"
                        max="60"
                        value={formData.quantidadeParcelas}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantidadeParcelas: parseInt(e.target.value) || 1 }))}
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

                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">
                        Valor por parcela: <span className="font-semibold">{formatCurrency(formData.valorTotal / formData.quantidadeParcelas)}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-blue-700"
                  disabled={submitting}
                >
                  {submitting ? (
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

      {showScanner && (
        <BarcodeScanner
          onBarcodeScanned={handleBarcodeScanned}
          onClose={() => {
            setShowScanner(false);
            setScanningIndex(null);
          }}
        />
      )}
    </div>
  );
}