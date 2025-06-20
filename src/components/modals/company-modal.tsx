import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/service/apiService";
import { Empresa, EmpresaInput } from "../../../types";

interface CompanyModalProps {
  open: boolean;
  onClose: () => void;
  company?: Empresa;
  onSuccess: () => void;
}

export default function CompanyModal({ open, onClose, company, onSuccess }: CompanyModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomeFantasia: company?.nomeFantasia || "",
    cnpj: company?.cnpj || "",
    endereco: company?.endereco || "",
    telefone: company?.telefone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomeFantasia.trim() || !formData.cnpj.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome fantasia e CNPJ são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const empresaData: EmpresaInput = {
        nomeFantasia: formData.nomeFantasia,
        cnpj: formData.cnpj,
        endereco: formData.endereco,
        telefone: formData.telefone,
      };

      if (company) {
        await companyService.update(company.id, empresaData);
        toast({
          title: "Empresa atualizada",
          description: "Empresa atualizada com sucesso",
        });
      } else {
        await companyService.create(empresaData);
        toast({
          title: "Empresa criada",
          description: "Empresa criada com sucesso",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: company ? "Erro ao atualizar empresa" : "Erro ao criar empresa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{company ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
          <DialogDescription>
            {company ? "Edite as informações da empresa" : "Preencha os dados da nova empresa"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeFantasia">Nome Fantasia *</Label>
            <Input
              id="nomeFantasia"
              value={formData.nomeFantasia}
              onChange={(e) => handleInputChange("nomeFantasia", e.target.value)}
              placeholder="Digite o nome fantasia"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => handleInputChange("cnpj", e.target.value)}
              placeholder="00.000.000/0000-00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
              placeholder="Digite o endereço"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange("telefone", e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : (company ? "Atualizar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}