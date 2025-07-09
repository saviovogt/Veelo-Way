import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  DollarSign,
  PlayCircle,
  Clock,
  CheckCircle,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/locacao', icon: PlayCircle, label: 'Nova Locação' },
    { path: '/em-andamento', icon: Clock, label: 'Em Andamento' },
    { path: '/finalizado', icon: CheckCircle, label: 'Finalizado' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/patinetes', icon: Zap, label: 'Patinetes' },
    { path: '/fluxo-caixa', icon: DollarSign, label: 'Fluxo de Caixa' },
    { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  ];

  const NavItems = () => (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              isActive 
                ? 'bg-yellow-400 text-black font-medium shadow-md' 
                : 'text-yellow-100 hover:text-yellow-400 hover:bg-gray-800'
            }`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-black border-r border-gray-800 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-black" />
              </div>
              <div>
                <span className="text-xl font-bold text-yellow-400">VeeloWay</span>
                <p className="text-xs text-yellow-200">Gestão de Patinetes</p>
              </div>
            </div>
          </div>
          <div className="flex-grow flex flex-col px-4">
            <NavItems />
          </div>
          <div className="p-4 border-t border-gray-800">
            <div className="bg-gray-900 rounded-lg p-3">
              <p className="text-xs text-yellow-200 mb-1">Sistema de Locação</p>
              <p className="text-sm font-medium text-yellow-400">VeeloWay v1.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-black">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-bold text-yellow-400">VeeloWay</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-yellow-400 hover:text-yellow-300">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-black border-gray-800">
              <div className="flex items-center space-x-2 mb-8">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-black" />
                </div>
                <div>
                  <span className="text-lg font-bold text-yellow-400">VeeloWay</span>
                  <p className="text-xs text-yellow-200">Gestão de Patinetes</p>
                </div>
              </div>
              <NavItems />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64">
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;