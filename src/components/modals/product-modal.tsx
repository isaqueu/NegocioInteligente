import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productService } from "@/service/apiService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera } from "lucide-react";
import BarcodeScanner from "@/components/barcode-scanner";
import { Produto, ProdutoInput } from "../../../types";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Produto | null;
}

export default function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProdutoInput>({
    nome: "",
    unidade: "",
    classificacao: "",
    codigoBarras: "",
    observacoes: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        nome: product.nome,
        unidade: product.unidade,
        classificacao: product.classificacao,
        codigoBarras: product.codigoBarras || "",
        observacoes: product.observacoes || "",
      });
    } else {
      setFormData({
        nome: "",
        unidade: "",
        classificacao: "",
        codigoBarras: "",
        observacoes: "",
      });
    }
  }, [product, isOpen]);

  const handleBarcodeScanned = (barcode: string) => {
    setFormData(prev => ({ ...prev, codigoBarras: barcode }));
    setShowScanner(false);
    toast({
      title: "Código escaneado",
      description: `Código ${barcode} adicionado ao produto`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      if (product?.id) {
        await productService.update(product.id, formData);
        toast({
          title: "Produto atualizado",
          description: "Produto atualizado com sucesso",
        });
      } else {
        await productService.create(formData);
        toast({
          title: "Produto criado",
          description: "Produto criado com sucesso",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: product?.id ? "Erro ao atualizar produto" : "Erro ao criar produto",
        description: error.response?.data?.message || "Não foi possível salvar o produto",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {product?.id ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="codigoBarras" className="text-sm font-medium text-gray-700">
                Código de Barras
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="codigoBarras"
                  type="text"
                  value={formData.codigoBarras}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigoBarras: e.target.value }))}
                  placeholder="Digite ou escaneie o código"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                  className="px-3"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700">
                Observações
              </Label>
              <Input
                id="observacoes"
                type="text"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais"
                className="mt-2"
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-blue-700" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  product?.id ? "Atualizar" : "Criar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {showScanner && (
        <BarcodeScanner
          onBarcodeScanned={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}