` tags. I will pay close attention to indentation, structure, and completeness.

```
<replit_final_file>
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/service/apiService";
import { Usuario, UsuarioInput } from "../../../types";

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  user?: Usuario;
  onSuccess: () => void;
}

export default function UserModal({ open, onClose, user, onSuccess }: UserModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.nome || "",
    username: user?.username || "",
    senha: "",
    tipo: user?.tipo || "filho",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.username.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e username são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!user && !formData.senha.trim()) {
      toast({
        title: "Senha obrigatória",
        description: "A senha é obrigatória para novos usuários",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const userData: UsuarioInput = {
        nome: formData.nome,
        username: formData.username,
        tipo: formData.tipo as "pai" | "mae" | "filho" | "filha" | "admin",
        ...(formData.senha && { senha: formData.senha }),
      };

      if (user) {
        await userService.update(user.id, userData);
        toast({
          title: "Usuário atualizado",
          description: "Usuário atualizado com sucesso",
        });
      } else {
        await userService.create(userData);
        toast({
          title: "Usuário criado",
          description: "Usuário criado com sucesso",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: user ? "Erro ao atualizar usuário" : "Erro ao criar usuário",
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
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {user ? "Edite as informações do usuário" : "Preencha os dados do novo usuário"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="Digite o username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha {!user && "*"}</Label>
            <Input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => handleInputChange("senha", e.target.value)}
              placeholder={user ? "Deixe em branco para manter atual" : "Digite a senha"}
              required={!user}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Usuário *</Label>
            <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pai">Pai</SelectItem>
                <SelectItem value="mae">Mãe</SelectItem>
                <SelectItem value="filho">Filho</SelectItem>
                <SelectItem value="filha">Filha</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : (user ? "Atualizar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}