import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userService } from "@/service/apiService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Usuario, UsuarioInput } from "../../../types";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: Usuario | null;
}

export default function UserModal({ isOpen, onClose, onSuccess, user }: UserModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<UsuarioInput>({
    nome: "",
    email: "",
    username: "",
    senha: "",
    perfil: "usuario",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        username: user.username,
        senha: "",
        perfil: user.perfil,
      });
    } else {
      setFormData({
        nome: "",
        email: "",
        username: "",
        senha: "",
        perfil: "usuario",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      if (user?.id) {
        const updateData = { ...formData };
        if (!updateData.senha) {
          delete updateData.senha;
        }
        await userService.update(user.id, updateData);
        toast({
          title: "Usuário atualizado",
          description: "Usuário atualizado com sucesso",
        });
      } else {
        await userService.create(formData);
        toast({
          title: "Usuário criado",
          description: "Usuário criado com sucesso",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: user?.id ? "Erro ao atualizar usuário" : "Erro ao criar usuário",
        description: error.response?.data?.message || "Não foi possível salvar o usuário",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user?.id ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
              Nome Completo
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
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
              Senha {user?.id && "(deixe em branco para não alterar)"}
            </Label>
            <Input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              className="mt-2"
              required={!user?.id}
            />
          </div>

          <div>
            <Label htmlFor="perfil" className="text-sm font-medium text-gray-700">
              Perfil
            </Label>
            <Select value={formData.perfil} onValueChange={(value) => setFormData(prev => ({ ...prev, perfil: value as any }))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="gerente">Gerente</SelectItem>
                <SelectItem value="usuario">Usuário</SelectItem>
              </SelectContent>
            </Select>
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
                user?.id ? "Atualizar" : "Criar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}