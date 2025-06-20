import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { User, InsertUser } from "@shared/schema";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

export default function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    username: "",
    senha: "",
    papel: "",
  });

  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: InsertUser) => apiRequest("POST", "/api/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário criado",
        description: "Usuário criado com sucesso",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Erro ao criar usuário",
        description: "Não foi possível criar o usuário",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertUser> }) =>
      apiRequest("PUT", `/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário atualizado",
        description: "Usuário atualizado com sucesso",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar usuário",
        description: "Não foi possível atualizar o usuário",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        username: user.username,
        senha: "", // Don't populate password for security
        papel: user.papel,
      });
    } else {
      setFormData({
        nome: "",
        username: "",
        senha: "",
        papel: "",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.username || !formData.papel) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!user && !formData.senha) {
      toast({
        title: "Senha obrigatória",
        description: "A senha é obrigatória para novos usuários",
        variant: "destructive",
      });
      return;
    }

    const userData: InsertUser = {
      nome: formData.nome,
      username: formData.username,
      senha: formData.senha || (user?.senha || ""),
      papel: formData.papel,
    };

    if (user) {
      // Update existing user
      const updateData: Partial<InsertUser> = {
        nome: formData.nome,
        username: formData.username,
        papel: formData.papel,
      };
      
      // Only include password if it was changed
      if (formData.senha) {
        updateData.senha = formData.senha;
      }

      updateMutation.mutate({ id: user.id, data: updateData });
    } else {
      // Create new user
      createMutation.mutate(userData);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: "",
      username: "",
      senha: "",
      papel: "",
    });
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Nome de Usuário
            </Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="senha" className="text-sm font-medium text-gray-700">
              Senha {user && "(deixe em branco para manter atual)"}
            </Label>
            <Input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              className="mt-2"
              required={!user}
            />
          </div>

          <div>
            <Label htmlFor="papel" className="text-sm font-medium text-gray-700">
              Papel
            </Label>
            <Select
              value={formData.papel}
              onValueChange={(value) => setFormData(prev => ({ ...prev, papel: value }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pai">Pai</SelectItem>
                <SelectItem value="mae">Mãe</SelectItem>
                <SelectItem value="filho">Filho</SelectItem>
                <SelectItem value="filha">Filha</SelectItem>
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
                  {user ? "Atualizando..." : "Criando..."}
                </>
              ) : (
                user ? "Atualizar" : "Criar"
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
