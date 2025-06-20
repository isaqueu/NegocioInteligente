import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera } from "lucide-react";
import BarcodeScanner from "@/components/barcode-scanner";
import type { Produto, InsertProduto } from "@shared/schema";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Produto | null;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [formData, setFormData] = useState({
    codigoBarras: "",
    nome: "",
    unidade: "",
    classificacao: "",
    precoUnitario: "",
  });

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: InsertProduto) => apiRequest("POST", "/api/produtos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/produtos"] });
      toast({
        title: "Produto criado",
        description: "Produto criado com sucesso",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Erro ao criar produto",
        description: "Não foi possível criar o produto",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertProduto> }) =>
      apiRequest("PUT", `/api/produtos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/produtos"] });
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar produto",
        description: "Não foi possível atualizar o produto",
        variant: "destructive",
      });
    },
  });

  // Query to check if barcode exists when scanning
  const { data: existingProduct } = useQuery({
    queryKey: ["/api/produtos/barcode", formData.codigoBarras],
    enabled: !!formData.codigoBarras && formData.codigoBarras.length > 6,
    retry: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        codigoBarras: product.codigoBarras || "",
        nome: product.nome,
        unidade: product.unidade,
        classificacao: product.classificacao,
        precoUnitario: product.precoUnitario,
      });
    } else {
      setFormData({
        codigoBarras: "",
        nome: "",
        unidade: "",
        classificacao: "",
        precoUnitario: "",
      });
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (existingProduct && !product) {
      // Auto-fill form with existing product data when barcode is scanned
      setFormData(prev => ({
        ...prev,
        nome: existingProduct.nome,
        unidade: existingProduct.unidade,
        classificacao: existingProduct.classificacao,
        precoUnitario: existingProduct.precoUnitario,
      }));
      
      toast({
        title: "Produto encontrado",
        description: "Dados preenchidos automaticamente com produto existente",
      });
    }
  }, [existingProduct, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.unidade || !formData.classificacao || !formData.precoUnitario) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const productData: InsertProduto = {
      codigoBarras: formData.codigoBarras || null,
      nome: formData.nome,
      unidade: formData.unidade,
      classificacao: formData.classificacao,
      precoUnitario: parseFloat(formData.precoUnitario).toFixed(2),
    };

    if (product) {
      updateMutation.mutate({ id: product.id, data: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleClose = () => {
    setFormData({
      codigoBarras: "",
      nome: "",
      unidade: "",
      classificacao: "",
      precoUnitario: "",
    });
    onClose();
  };

  const handleBarcodeScanned = (barcode: string) => {
    setFormData(prev => ({ ...prev, codigoBarras: barcode }));
    setIsScannerOpen(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {product ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="codigoBarras" className="text-sm font-medium text-gray-700">
                Código de Barras
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="codigoBarras"
                  type="text"
                  value={formData.codigoBarras}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigoBarras: e.target.value }))}
                  placeholder="Código de barras (opcional)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="bg-secondary hover:bg-green-700 px-3"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                Nome
              </Label>
              <Input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="unidade" className="text-sm font-medium text-gray-700">
                Unidade
              </Label>
              <Input
                id="unidade"
                type="text"
                value={formData.unidade}
                onChange={(e) => setFormData(prev => ({ ...prev, unidade: e.target.value }))}
                placeholder="Ex: kg, l, unidade"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="classificacao" className="text-sm font-medium text-gray-700">
                Classificação
              </Label>
              <Input
                id="classificacao"
                type="text"
                value={formData.classificacao}
                onChange={(e) => setFormData(prev => ({ ...prev, classificacao: e.target.value }))}
                placeholder="Ex: Alimento, Limpeza, Saúde"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="precoUnitario" className="text-sm font-medium text-gray-700">
                Preço Unitário (R$)
              </Label>
              <Input
                id="precoUnitario"
                type="number"
                step="0.01"
                min="0"
                value={formData.precoUnitario}
                onChange={(e) => setFormData(prev => ({ ...prev, precoUnitario: e.target.value }))}
                className="mt-2"
                required
              />
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {product ? "Atualizando..." : "Criando..."}
                  </>
                ) : (
                  product ? "Atualizar" : "Criar"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="px-6"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
      />
    </>
  );
}
