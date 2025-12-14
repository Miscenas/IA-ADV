import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  Scale, 
  History, 
  Settings, 
  Menu, 
  LogOut, 
  UserCircle,
  CalendarDays,
  Calculator,
  Globe,
  Siren,
  Hourglass,
  FolderOpen
} from 'lucide-react';
import { useStore } from '../store';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Painel do Advogado', icon: LayoutDashboard },
    { id: 'create-petition', label: 'Criar Petição', icon: FilePlus2 },
    { id: 'calendar', label: 'Prazos e Calendário', icon: CalendarDays },
    { id: 'process-history', label: 'Meus Processos', icon: FolderOpen },
    { id: 'filing-links', label: 'Portais dos Tribunais', icon: Globe },
    { id: 'labor-calculator', label: 'Calculadora Trabalhista', icon: Calculator },
    { id: 'criminal-calculator', label: 'Calculadora Penal', icon: Siren },
    { id: 'prescription-calculator', label: 'Calc. Prescrição', icon: Hourglass },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="flex items-center h-16 px-6 border-b border-slate-800 bg-slate-950">
          <Scale className="h-6 w-6 text-blue-400 mr-3" />
          <span className="font-bold text-white text-lg tracking-tight">Jurídico.AI</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center mb-3 px-2">
            <UserCircle className="h-8 w-8 text-slate-400 mr-3" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-200 shadow-sm z-10">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 ml-2 lg:ml-0">
              {navItems.find(i => i.id === currentPage)?.label || 'Painel do Advogado'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Assistente Jurídico (Beta)
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};