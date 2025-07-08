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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio de locação de patinetes
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patinetes Disponíveis</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.patineteDisponiveis}</div>
            <p className="text-xs text-muted-foreground">
              De {patinetes.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contratoAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.receitaHoje.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Mês: R$ {stats.receitaMes.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contratos Recentes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contratos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contratoRecentes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum contrato encontrado
                </p>
              ) : (
                contratoRecentes.map((contrato) => {
                  const cliente = clientes.find(c => c.id === contrato.clienteId);
                  const patinete = patinetes.find(p => p.id === contrato.patineteId);
                  
                  return (
                    <div key={contrato.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{cliente?.nome || 'Cliente não encontrado'}</p>
                        <p className="text-sm text-muted-foreground">
                          {patinete?.modelo || 'Patinete não encontrado'} • {contrato.minutosUsados} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {contrato.valorTotal.toFixed(2)}</p>
                        <p className={`text-xs ${
                          contrato.status === 'ativo' ? 'text-green-600' : 
                          contrato.status === 'finalizado' ? 'text-blue-600' : 'text-red-600'
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

        <Card>
          <CardHeader>
            <CardTitle>Status dos Patinetes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patinetes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum patinete cadastrado
                </p>
              ) : (
                patinetes.slice(0, 5).map((patinete) => (
                  <div key={patinete.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Battery className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{patinete.modelo}</p>
                        <p className="text-sm text-muted-foreground">
                          {patinete.localizacao}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{patinete.bateria}%</p>
                      <p className={`text-xs ${
                        patinete.status === 'disponivel' ? 'text-green-600' : 
                        patinete.status === 'alugado' ? 'text-blue-600' : 'text-red-600'
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
    </div>
  );
};

export default Dashboard;