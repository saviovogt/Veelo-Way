import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import ProtectedRoutes from "@/components/ProtectedRoutes";

// Pages
import Dashboard from "./pages/Dashboard";
import Locacao from "./pages/Locacao";
import EmAndamento from "./pages/EmAndamento";
import Finalizado from "./pages/Finalizado";
import Clientes from "./pages/Clientes";
import Patinetes from "./pages/Patinetes";
import FluxoCaixaPage from "./pages/FluxoCaixa";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

const queryClient = new QueryClient();

const ProtectedLayout = () => (
  <ProtectedRoutes>
    <Layout>
      <Outlet />
    </Layout>
  </ProtectedRoutes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/locacao" element={<Locacao />} />
              <Route path="/em-andamento" element={<EmAndamento />} />
              <Route path="/finalizado" element={<Finalizado />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/patinetes" element={<Patinetes />} />
              <Route path="/fluxo-caixa" element={<FluxoCaixaPage />} />
              <Route path="/relatorios" element={<Relatorios />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;