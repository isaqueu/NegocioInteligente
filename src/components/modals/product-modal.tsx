import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/service/apiService";
import { Produto, ProdutoInput } from "../../../types";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Produto;
  onSuccess: () => void;
}

export default function ProductModal({ open, onClose, product, onSuccess }: ProductModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: product?.nome || "",
    codigoBarras: product?.codigoBarras || "",
    preco: product?.preco ? parseFloat(product.preco).toString() : "",
    descricao: product?.descricao || "",
    estoque: product?.estoque?.toString() || "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.preco.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e preço são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(parseFloat(formData.preco)) || parseFloat(formData.preco) <= 0) {
      toast({
        title: "Preço inválido",
        description: "O preço deve ser um número maior que zero",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const productData: ProdutoInput = {
        nome: formData.nome,
        codigoBarras: formData.codigoBarras,
        preco: parseFloat(formData.preco).toFixed(2),
        descricao: formData.descricao,
        estoque: parseInt(formData.estoque) || 0,
      };

      if (product) {
        await productService.update(product.id, productData);
        toast({
          title: "Produto atualizado",
          description: "Produto atualizado com sucesso",
        });
      } else {
        await productService.create(productData);
        toast({
          title: "Produto criado",
          description: "Produto criado com sucesso",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: product ? "Erro ao atualizar produto" : "Erro ao criar produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>
            {product ? "Edite as informações do produto" : "Preencha os dados do novo produto"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Digite o nome do produto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigoBarras">Código de Barras</Label>
            <Input
              id="codigoBarras"
              value={formData.codigoBarras}
              onChange={(e) => handleInputChange("codigoBarras", e.target.value)}
              placeholder="Digite o código de barras"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco">Preço *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco}
              onChange={(e) => handleInputChange("preco", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estoque">Estoque</Label>
            <Input
              id="estoque"
              type="number"
              min="0"
              value={formData.estoque}
              onChange={(e) => handleInputChange("estoque", e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Digite uma descrição do produto"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : (product ? "Atualizar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}