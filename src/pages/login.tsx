import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Loader2 } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("admin");
  const [senha, setSenha] = useState("123456");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Tentando fazer login com:', { username, senha });
      const user = await authService.login(username, senha);
      console.log('Login bem-sucedido:', user);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao KIGI Sistema Financeiro Familiar",
      });
      
      // Força atualização do estado de autenticação
      setTimeout(() => {
        onLogin();
      }, 100);
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Usuário ou senha inválidos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-blue-800 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">KIGI</h1>
            <p className="text-gray-600">Sistema Financeiro Familiar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="senha" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="mt-2"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Credenciais de teste:</p>
            <p className="text-sm text-blue-700">Usuário: admin | Senha: 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
