import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  FileText, 
  DollarSign,
  PlayCircle,
  Clock,
  CheckCircle,
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
    { path: '/contratos', icon: FileText, label: 'Contratos' },
    { path: '/fluxo-caixa', icon: DollarSign, label: 'Fluxo de Caixa' },
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
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-card border-r overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Zap className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">ScooterRent</span>
          </div>
          <div className="mt-8 flex-grow flex flex-col px-4">
            <NavItems />
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">ScooterRent</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex items-center mb-8">
                <Zap className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">ScooterRent</span>
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