import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CheckCircle, User, Zap, Clock, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const Finalizado = () => {
  const { contratos, clientes, patinetes } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMes, setFiltroMes] = useState('todos');

  const metodosPagamento = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'cartao_debito', label: 'Cartão de Débito' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'pix', label: 'PIX' },
    { value: 'transferencia', label: 'Transferência' }
  ];

  // Filtrar apenas contratos finalizados
  const contratosFinalizados = contratos.filter(contrato => contrato.status === 'finalizado');

  const filteredContratos = useMemo(() => {
    let filtered = contratosFinalizados.filter(contrato => {
      const cliente = clientes.find(c => c.id === contrato.clienteId);
      const patinete = patinetes.find(p => p.id === contrato.patineteId);
      
      return (
        cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patinete?.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrato.id.includes(searchTerm)
      );
    });

    // Filtro por mês
    if (filtroMes !== 'todos') {
      const mesAtual = new Date();
      const inicioMes = startOfMonth(mesAtual);
      const fimMes = endOfMonth(mesAtual);

      if (filtroMes === 'mes_atual') {
        filtered = filtered.filter(contrato => {
          const dataFim = new Date(contrato.dataFim || contrato.dataInicio);
          return isWithinInterval(dataFim, { start: inicioMes, end: fimMes });
        });
      }
    }

    return filtered.sort((a, b) => {
      const dataA = new Date(a.dataFim || a.dataInicio);
      const dataB = new Date(b.dataFim || b.dataInicio);
      return dataB.getTime() - dataA.getTime();
    });
  }, [contratosFinalizados, searchTerm, filtroMes, clientes, patinetes]);

  const estatisticas = useMemo(() => {
    const totalLocacoes = contratosFinalizados.length;
    const receitaTotal = contratosFinalizados.reduce((sum, c) => sum + c.valorTotal, 0);
    const minutosTotal = contratosFinalizados.reduce((sum, c) => sum + c.minutosUsados, 0);
    const ticketMedio = totalLocacoes > 0 ? receitaTotal / totalLocacoes : 0;

    // Estatísticas por método de pagamento
    const estatisticasPagamento = metodosPagamento.reduce((acc, metodo) => {
      const contratos = contratosFinalizados.filter(c => c.metodoPagamento === metodo.value);
      const valor = contratos.reduce((sum, c) => sum + c.valorTotal, 0);
      const quantidade = contratos.length;
      
      acc[metodo.value] = { valor, quantidade };
      return acc;
    }, {} as Record<string, { valor: number; quantidade: number }>);

    return {
      totalLocacoes,
      receitaTotal,
      minutosTotal,
      ticketMedio,
      estatisticasPagamento
    };
  }, [contratosFinalizados]);

  const getMetodoPagamentoLabel = (metodo?: string) => {
    if (!metodo) return 'Não informado';
    return metodosPagamento.find(m => m.value === metodo)?.label || metodo;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Locações Finalizadas</h1>
          <p className="text-muted-foreground">
            Histórico de todas as locações concluídas
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Locações</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalLocacoes}</div>
            <p className="text-xs text-muted-foreground">
              Locações finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {estatisticas.receitaTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor arrecadado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.floor(estatisticas.minutosTotal / 60)}h {estatisticas.minutosTotal % 60}min
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.minutosTotal} minutos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {estatisticas.ticketMedio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por locação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Método de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Receita por Método de Pagamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {metodosPagamento.map(metodo => {
              const stats = estatisticas.estatisticasPagamento[metodo.value];
              return (
                <div key={metodo.value} className="text-center">
                  <p className="text-lg font-bold text-green-600">
                    R$ {stats?.valor.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-muted-foreground">{metodo.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.quantidade || 0} locações
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, patinete ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filtroMes} onValueChange={setFiltroMes}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os períodos</SelectItem>
            <SelectItem value="mes_atual">Mês atual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Locações Finalizadas */}
      <div className="grid gap-4">
        {filteredContratos.map((contrato) => {
          const cliente = clientes.find(c => c.id === contrato.clienteId);
          const patinete = patinetes.find(p => p.id === contrato.patineteId);
          
          return (
            <Card key={contrato.id} className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-lg">
                        {cliente?.nome || 'Cliente não encontrado'}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Finalizado
                      </Badge>
                      {contrato.metodoPagamento && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {getMetodoPagamentoLabel(contrato.metodoPagamento)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>{patinete?.marca} {patinete?.modelo}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>ID: {contrato.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      R$ {contrato.valorTotal.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {contrato.minutosUsados} minutos
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Início</p>
                    <p className="font-medium">{format(new Date(contrato.dataInicio), 'dd/MM/yyyy')}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(contrato.dataInicio), 'HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Finalização</p>
                    <p className="font-medium">{format(new Date(contrato.dataFim || contrato.dataInicio), 'dd/MM/yyyy')}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(contrato.dataFim || contrato.dataInicio), 'HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duração</p>
                    <p className="font-medium">{contrato.minutosUsados} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor/min</p>
                    <p className="font-medium">R$ {patinete?.valorPorMinuto.toFixed(2)}</p>
                  </div>
                </div>

                {contrato.observacoes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="text-sm">{contrato.observacoes}</p>
                  </div>
                )}

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-green-700">
                      ✅ Locação finalizada em {format(new Date(contrato.dataFim || contrato.dataInicio), 'dd/MM/yyyy HH:mm')}
                    </p>
                    {contrato.metodoPagamento && (
                      <div className="flex items-center space-x-1 text-xs text-green-700">
                        <CreditCard className="h-3 w-3" />
                        <span>{getMetodoPagamentoLabel(contrato.metodoPagamento)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredContratos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma locação finalizada</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhuma locação encontrada com os critérios de busca' : 'Ainda não há locações finalizadas no sistema'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Finalizado;