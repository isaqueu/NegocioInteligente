
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { productService } from "@/service/apiService";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import ProductModal from "@/components/modals/product-modal";
import { Produto } from "../../types";

export default function Products() {
  const [products, setProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Produto) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await productService.delete(id);
      await loadProducts();
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir produto",
        description: error.response?.data?.message || "Não foi possível excluir o produto",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleModalSuccess = () => {
    loadProducts();
    setIsModalOpen(false);
    setEditingProduct(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie o catálogo de produtos</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.nome}</h3>
                    <p className="text-sm text-gray-500">{product.unidade}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleting === product.id}
                    className="h-8 w-8 p-0 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {deleting === product.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Código de Barras:</span>
                  <span className="text-sm font-mono">{product.codigoBarras || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Classificação:</span>
                  <Badge variant="secondary" className="text-xs">
                    {product.classificacao}
                  </Badge>
                </div>
                {product.observacoes && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {product.observacoes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {products.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto cadastrado</h3>
            <p className="text-gray-500 mb-6">Comece criando seu primeiro produto</p>
            <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={handleModalSuccess}
        product={editingProduct}
      />
    </div>
  );
}
