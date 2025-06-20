import { authService as apiAuthService } from "../service/apiService";
import { Usuario } from "../../types";

class AuthService {
  private user: Usuario | null = null;

  async login(username: string, senha: string): Promise<Usuario> {
    try {
      const response = await apiAuthService.login(username, senha);
      
      // Salvar token no localStorage
      localStorage.setItem('authToken', response.token);
      
      this.user = response.user;
      return response.user;
    } catch (error) {
      throw new Error("Credenciais inválidas");
    }
  }

  async logout(): Promise<void> {
    try {
      await apiAuthService.logout();
    } catch (error) {
      // Mesmo se falhar no servidor, limpar dados locais
      console.error('Erro ao fazer logout:', error);
    } finally {
      this.user = null;
      localStorage.removeItem('authToken');
    }
  }

  getCurrentUser(): Usuario | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    const hasToken = localStorage.getItem('authToken') !== null;
    return hasToken;
  }

  async refreshUser(): Promise<void> {
    try {
      if (localStorage.getItem('authToken')) {
        this.user = await apiAuthService.getCurrentUser();
      }
    } catch (error) {
      this.logout();
    }
  }

  initializeFromStorage(): void {
    const token = localStorage.getItem('authToken');
    if (token && !this.user) {
      // Se tem token mas não tem usuário, tentar recuperar
      this.refreshUser();
    }
  }
}

export const authService = new AuthService();
