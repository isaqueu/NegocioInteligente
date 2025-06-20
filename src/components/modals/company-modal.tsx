import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { companyService } from "@/service/apiService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Empresa, EmpresaInput } from "../../../types";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: Empresa | null;
}

export default function CompanyModal({ isOpen, onClose, company }: CompanyModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "",
  });

  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: companyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Empresa criada",
        description: "Empresa criada com sucesso",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar empresa",
        description: error.response?.data?.message || "Não foi possível criar a empresa",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) =>
      companyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Empresa atualizada",
        description: "Empresa atualizada com sucesso",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar empresa",
        description: "Não foi possível atualizar a empresa",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (company) {
      setFormData({
        nome: company.nome,
        tipo: company.tipo,
      });
    } else {
      setFormData({
        nome: "",
        tipo: "",
      });
    }
  }, [company, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.tipo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const companyData: InsertEmpresa = {
      nome: formData.nome,
      tipo: formData.tipo,
    };

    if (company) {
      updateMutation.mutate({ id: company.id, data: companyData });
    } else {
      createMutation.mutate(companyData);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: "",
      tipo: "",
    });
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {company ? "Editar Empresa" : "Nova Empresa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
              Nome da Empresa
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
            <Label htmlFor="tipo" className="text-sm font-medium text-gray-700">
              Tipo
            </Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pagadora">Pagadora (fonte de renda)</SelectItem>
                <SelectItem value="recebedora">Recebedora (destino de gastos)</SelectItem>
              </SelectContent>
            </Select>
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
                  {company ? "Atualizando..." : "Criando..."}
                </>
              ) : (
                company ? "Atualizar" : "Criar"
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
  );
}
