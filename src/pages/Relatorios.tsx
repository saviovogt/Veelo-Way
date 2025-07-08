import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Calendar, Clock, DollarSign, Zap, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { format, isValid } from 'date-fns';

const Relatorios = () => {
  const { contratos, clientes, patinetes } = useApp();
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split('T')[0]
  );

  const relatorioData = useMemo(() => {
    // Filtrar contratos finalizados da data selecionada
    const contratosFinalizadosData = contratos.filter(contrato => {
      if (contrato.status !== 'finalizado' || !contrato.dataFim) return false;
      
      const dataFim = new Date(contrato.dataFim);
      const dataFimFormatada = format(dataFim, 'yyyy-MM-dd');
      
      return dataFimFormatada === dataSelecionada;
    });

    // Calcular métricas gerais
    const totalViagens = contratosFinalizadosData.length;
    const minutosTotal = contratosFinalizadosData.reduce((sum, c) => sum + c.minutosUsados, 0);
    const faturamentoTotal = contratosFinalizadosData.reduce((sum, c) => sum + c.valorTotal, 0);
    
    // Patinetes únicos que andaram
    const patinetesUtilizados = new Set(contratosFinalizadosData.map(c => c.patineteId));
    const quantidadePatinetes = patinetesUtilizados.size;

    // Relatório detalhado por patinete
    const relatorioPorPatinete = Array.from(patinetesUtilizados).map(patineteId => {
      const patinete = patinetes.find(p => p.id === patineteId);
      const viagensPatinete = contratosFinalizadosData.filter(c => c.patineteId === patineteId);
      
      const viagensCount = viagensPatinete.length;
      const minutosPatinete = viagensPatinete.reduce((sum, c) => sum + c.minutosUsados, 0);
      const faturamentoPatinete = viagensPatinete.reduce((sum, c) => sum + c.valorTotal, 0);
      const clientesUnicos = new Set(viagensPatinete.map(c => c.clienteId)).size;

      return {
        patinete: patinete || { id: patineteId, marca: 'N/A', modelo: 'N/A' },
        viagens: viagensCount,
        minutos: minutosPatinete,
        faturamento: faturamentoPatinete,
        clientesUnicos,
        tempoMedio: viagensCount > 0 ? Math.round(minutosPatinete / viagensCount) : 0
      };
    }).sort((a, b) => b.faturamento - a.faturamento);

    return {
      totalViagens,
      minutosTotal,
      faturamentoTotal,
      quantidadePatinetes,
      relatorioPorPatinete,
      tempoMedioViagem: totalViagens > 0 ? Math.round(minutosTotal / totalViagens) : 0,
      faturamentoMedio: totalViagens > 0 ? faturamentoTotal / totalViagens : 0
    };
  }, [contratos, patinetes, dataSelecionada]);

  const formatarTempo = (minutos: number) => {
    if (minutos < 60) {
      return `${minutos} min`;
    } else {
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      return `${horas}h ${mins}min`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise detalhada de performance dos patinetes por dia
          </p>
        </div>
      </div>

      {/* Seletor de Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <Label htmlFor="data">Data do Relatório</Label>
              <Input
                id="data"
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Relatório para: {format(new Date(dataSelecionada), 'dd/MM/yyyy')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Viagens</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {relatorioData.totalViagens}
            </div>
            <p className="text-xs text-muted-foreground">
              Locações finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatarTempo(relatorioData.minutosTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média: {relatorioData.tempoMedioViagem} min/viagem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {relatorioData.faturamentoTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média: R$ {relatorioData.faturamentoMedio.toFixed(2)}/viagem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patinetes Ativos</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {relatorioData.quantidadePatinetes}
            </div>
            <p className="text-xs text-muted-foreground">
              De {patinetes.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Relatório Detalhado por Patinete */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Performance por Patinete</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relatorioData.relatorioPorPatinete.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patinete</TableHead>
                  <TableHead className="text-center">Viagens</TableHead>
                  <TableHead className="text-center">Tempo Total</TableHead>
                  <TableHead className="text-center">Tempo Médio</TableHead>
                  <TableHead className="text-center">Clientes Únicos</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorioData.relatorioPorPatinete.map((item, index) => (
                  <TableRow key={item.patinete.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">
                            {item.patinete.marca} {item.patinete.modelo}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {item.patinete.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{item.viagens}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {formatarTempo(item.minutos)}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.tempoMedio} min
                    </TableCell>
                    <TableCell className="text-center">
                      {item.clientesUnicos}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      R$ {item.faturamento.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma viagem encontrada</h3>
              <p className="text-muted-foreground">
                Não há locações finalizadas para {format(new Date(dataSelecionada), 'dd/MM/yyyy')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Adicional */}
      {relatorioData.totalViagens > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Utilização da Frota</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {((relatorioData.quantidadePatinetes / patinetes.length) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-blue-700">
                  {relatorioData.quantidadePatinetes} de {patinetes.length} patinetes utilizados
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Eficiência</h4>
                <p className="text-2xl font-bold text-green-600">
                  R$ {relatorioData.quantidadePatinetes > 0 
                    ? (relatorioData.faturamentoTotal / relatorioData.quantidadePatinetes).toFixed(2) 
                    : '0.00'}
                </p>
                <p className="text-sm text-green-700">
                  Faturamento médio por patinete
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Produtividade</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {relatorioData.quantidadePatinetes > 0 
                    ? (relatorioData.totalViagens / relatorioData.quantidadePatinetes).toFixed(1) 
                    : '0.0'}
                </p>
                <p className="text-sm text-purple-700">
                  Viagens médias por patinete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Relatorios;