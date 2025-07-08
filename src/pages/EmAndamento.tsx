import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Square, User, Zap, MapPin, Timer } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { FluxoCaixa } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { format, differenceInMinutes } from 'date-fns';

const EmAndamento = () => {
  const { contratos, setContratos, clientes, patinetes, setPatinetes, setFluxoCaixa } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar apenas contratos ativos (locações em andamento)
  const contratosAtivos = contratos.filter(contrato => 
    contrato.status === 'ativo' && contrato.patineteId // Apenas locações reais
  );

  const filteredContratos = contratosAtivos.filter(contrato => {
    const cliente = clientes.find(c => c.id === contrato.clienteId);
    const patinete = patinetes.find(p => p.id === contrato.patineteId);
    
    return (
      cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patinete?.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.id.includes(searchTerm)
    );
  });

  const handleFinalizarLocacao = (contrato: any) => {
    const patinete = patinetes.find(p => p.id === contrato.patineteId);
    if (!patinete) {
      showError('Patinete não encontrado');
      return;
    }

    const minutosUsados = prompt('Quantos minutos foram utilizados?');
    if (!minutosUsados || isNaN(Number(minutosUsados))) {
      showError('Informe um número válido de minutos');
      return;
    }

    const minutos = Number(minutosUsados);
    const valorTotal = minutos * patinete.valorPorMinuto;

    // Finalizar contrato
    setContratos(prev => prev.map(c => 
      c.id === contrato.id 
        ? { 
            ...c, 
            dataFim: new Date().toISOString(),
            minutosUsados: minutos,
            valorTotal,
            status: 'finalizado' as const
          }
        : c
    ));

    // Marcar patinete como disponível automaticamente
    setPatinetes(prev => prev.map(p => 
      p.id === contrato.patineteId 
        ? { ...p, status: 'disponivel' as const }
        : p
    ));

    // Registrar no fluxo de caixa
    const novaEntrada: FluxoCaixa = {
      id: Date.now().toString(),
      tipo: 'entrada',
      valor: valorTotal,
      descricao: `Locação finalizada - ${minutos} minutos`,
      categoria: 'Locação',
      data: new Date().toISOString().split('T')[0],
      contratoId: contrato.id
    };

    setFluxoCaixa(prev => [...prev, novaEntrada]);
    showSuccess(`Locação finalizada! Valor: R$ ${valorTotal.toFixed(2)} - Patinete disponível novamente`);
  };

  const calcularTempoDecorrido = (dataInicio: string) => {
    const inicio = new Date(dataInicio);
    const agora = new Date();
    const minutosDecorridos = differenceInMinutes(agora, inicio);
    
    if (minutosDecorridos < 60) {
      return `${minutosDecorridos} min`;
    } else {
      const horas = Math.floor(minutosDecorridos / 60);
      const minutos = minutosDecorridos % 60;
      return `${horas}h ${minutos}min`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Locações em Andamento</h1>
          <p className="text-muted-foreground">
            Gerencie as locações ativas no momento
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{contratosAtivos.length}</p>
            <p className="text-sm text-muted-foreground">Ativas</p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente, patinete ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Lista de Locações em Andamento */}
      <div className="grid gap-4">
        {filteredContratos.map((contrato) => {
          const cliente = clientes.find(c => c.id === contrato.clienteId);
          const patinete = patinetes.find(p => p.id === contrato.patineteId);
          const tempoDecorrido = calcularTempoDecorrido(contrato.dataInicio);
          
          return (
            <Card key={contrato.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-lg">
                        {cliente?.nome || 'Cliente não encontrado'}
                      </CardTitle>
                      <Badge variant="default" className="bg-blue-600">
                        Em Andamento
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>{patinete?.marca} {patinete?.modelo}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Timer className="h-3 w-3" />
                        <span>ID: {contrato.id}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleFinalizarLocacao(contrato)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Finalizar
                  </Button>
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
                    <p className="text-sm text-muted-foreground">Tempo Decorrido</p>
                    <p className="font-medium text-blue-600">{tempoDecorrido}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor/min</p>
                    <p className="font-medium">R$ {patinete?.valorPorMinuto.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bateria</p>
                    <p className="font-medium">{patinete?.bateria}%</p>
                  </div>
                </div>

                {patinete?.localizacao && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{patinete.localizacao}</p>
                  </div>
                )}

                {contrato.observacoes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="text-sm">{contrato.observacoes}</p>
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 Locação ativa desde {format(new Date(contrato.dataInicio), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredContratos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma locação em andamento</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhuma locação encontrada com os critérios de busca' : 'Todas as locações foram finalizadas'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmAndamento;