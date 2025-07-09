import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Zap, FileText, DollarSign, TrendingUp, Battery } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { clientes, patinetes, contratos, fluxoCaixa } = useApp();

  // Calcular estatísticas
  const stats = React.useMemo(() => {
    const hoje = format(new Date(), 'yyyy-MM-dd');
    const mesAtual = format(new Date(), 'yyyy-MM');

    const totalClientes = clientes.length;
    const patineteDisponiveis = patinetes.filter(p => p.status === 'disponivel').length;
    const contratoAtivos = contratos.filter(c => c.status === 'ativo').length;
    
    const receitaHoje = fluxoCaixa
      .filter(f => f.tipo === 'entrada' && f.data.startsWith(hoje))
      .reduce((sum, f) => sum + f.valor, 0);
    
    const receitaMes = fluxoCaixa
      .filter(f => f.tipo === 'entrada' && f.data.startsWith(mesAtual))
      .reduce((sum, f) => sum + f.valor, 0);

    return {
      totalClientes,
      patineteDisponiveis,
      contratoAtivos,
      receitaHoje,
      receitaMes,
    };
  }, [clientes, patinetes, contratos, fluxoCaixa]);

  const contratoRecentes = contratos
    .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-6 text-black">
        <h1 className="text-3xl font-bold mb-2">Dashboard VeeloWay</h1>
        <p className="text-black/80">
          Bem-vindo ao seu sistema de gestão de patinetes elétricos
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patinetes Disponíveis</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.patineteDisponiveis}</div>
            <p className="text-xs text-muted-foreground">
              De {patinetes.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locações Ativas</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.contratoAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.receitaHoje.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Mês: R$ {stats.receitaMes.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Locações Recentes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
              <span>Locações Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contratoRecentes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma locação encontrada
                </p>
              ) : (
                contratoRecentes.map((contrato) => {
                  const cliente = clientes.find(c => c.id === contrato.clienteId);
                  const patinete = patinetes.find(p => p.id === contrato.patineteId);
                  
                  return (
                    <div key={contrato.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium">{cliente?.nome || 'Cliente não encontrado'}</p>
                        <p className="text-sm text-muted-foreground">
                          {patinete?.modelo || 'Patinete não encontrado'} • {contrato.minutosUsados} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">R$ {contrato.valorTotal.toFixed(2)}</p>
                        <p className={`text-xs px-2 py-1 rounded-full ${
                          contrato.status === 'ativo' ? 'bg-yellow-100 text-yellow-800' : 
                          contrato.status === 'finalizado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {contrato.status}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Battery className="h-5 w-5 text-yellow-600" />
              <span>Status dos Patinetes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patinetes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum patinete cadastrado
                </p>
              ) : (
                patinetes.slice(0, 5).map((patinete) => (
                  <div key={patinete.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <div>
                        <p className="font-medium">{patinete.modelo}</p>
                        <p className="text-sm text-muted-foreground">
                          {patinete.localizacao}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{patinete.bateria}%</p>
                      <p className={`text-xs px-2 py-1 rounded-full ${
                        patinete.status === 'disponivel' ? 'bg-green-100 text-green-800' : 
                        patinete.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {patinete.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Rápido */}
      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
        <CardHeader>
          <CardTitle className="text-yellow-800">Resumo Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{clientes.filter(c => c.status === 'ativo').length}</p>
              <p className="text-sm text-yellow-700">Clientes Ativos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{patinetes.filter(p => p.status === 'disponivel').length}</p>
              <p className="text-sm text-yellow-700">Patinetes Livres</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                R$ {stats.receitaMes.toFixed(2)}
              </p>
              <p className="text-sm text-yellow-700">Receita do Mês</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;