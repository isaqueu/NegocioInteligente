import { User } from "@shared/schema";
import { apiRequest } from "./queryClient";

class AuthService {
  private user: User | null = null;

  async login(username: string, senha: string): Promise<User> {
    const response = await apiRequest("POST", "/api/login", { username, senha });
    const user = await response.json();
    this.user = user;
    return user;
  }

  logout(): void {
    this.user = null;
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }
}

export const authService = new AuthService();
