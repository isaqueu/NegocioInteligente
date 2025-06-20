import { Link, useLocation } from "wouter";
import { authService } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Package, 
  Building, 
  Calendar, 
  BarChart3, 
  LogOut,
  ShoppingCart,
  FileText,
  ChevronDown,
  ChevronRight,
  Settings,
  DollarSign,
  List
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Usuários", href: "/users", icon: Users },
  { 
    name: "Cadastros", 
    icon: Package, 
    children: [
      { name: "Produtos", href: "/products" },
      { name: "Empresas", href: "/companies" }
    ]
  },
  { 
    name: "Movimentação", 
    icon: DollarSign,
    children: [
      { name: "Entradas", href: "/income" },
      { name: "Saídas", href: "/expenses" }
    ]
  },
  { name: "Parcelas", href: "/installments", icon: Calendar },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (item: any) => {
    if (item.href) return location === item.href;
    if (item.children) {
      return item.children.some((child: any) => location === child.href);
    }
    return false;
  };

  return (
    <nav className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform -translate-x-full lg:translate-x-0 transition-transform duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">KG</span>
          </div>
          <h1 className="text-lg font-semibold text-white">KIGI</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = isItemActive(item);
            const isExpanded = expandedItems.includes(item.name);

            return (
              <li key={item.name}>
                {item.children ? (
                  // Menu with submenu
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                        isActive 
                          ? "bg-green-600 text-white" 
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <ul className="mt-1 ml-6 space-y-1">
                        {item.children.map((child: any) => (
                          <li key={child.name}>
                            <Link href={child.href}>
                              <span className={cn(
                                "block px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                                location === child.href
                                  ? "bg-green-600 text-white"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                              )}>
                                {child.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  // Simple menu item
                  <Link href={item.href || "#"}>
                    <span className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-lg transition-colors relative cursor-pointer",
                      isActive 
                        ? "bg-green-600 text-white" 
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}>
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.name}
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* User section at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin</p>
            <p className="text-xs text-gray-400 truncate">Administrador</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </button>
      </div>
    </nav>
  );
}