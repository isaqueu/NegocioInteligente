import { Link, useLocation } from "wouter";
import { authService } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Plus, 
  Minus, 
  Package, 
  Building, 
  Calendar, 
  BarChart3, 
  LogOut,
  Wallet
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Usuários", href: "/users", icon: Users },
  { name: "Entradas", href: "/income", icon: Plus },
  { name: "Saídas", href: "/expenses", icon: Minus },
  { name: "Produtos", href: "/products", icon: Package },
  { name: "Empresas", href: "/companies", icon: Building },
  { name: "Parcelas", href: "/installments", icon: Calendar },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <nav className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform -translate-x-full lg:translate-x-0 transition-transform duration-300">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">KIGI</h1>
        </div>
      </div>
      
      <div className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={cn("nav-item", isActive && "active")}>
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={handleLogout}
              className="nav-item w-full text-left hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
