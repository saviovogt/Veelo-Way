import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Clock, Square, User, Zap, MapPin, Timer, CreditCard } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { FluxoCaixa } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { format, differenceInMinutes } from 'date-fns';

const EmAndamento = () => {
  const { contratos, setContratos, clientes, patinetes, setPatinetes, setFluxoCaixa } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [finalizandoContrato, setFinalizandoContrato] = useState<any>(null);
  const [dadosFinalizacao, setDadosFinalizacao] = useState({
    minutosUsados: '',
    metodoPagamento: '' as 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'pix' | 'transferencia' | ''
  });

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

  const metodosPagamento = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'cartao_debito', label: 'Cartão de Débito' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'pix', label: 'PIX' },
    { value: 'transferencia', label: 'Transferência' }
  ];

  const abrirDialogFinalizacao = (contrato: any) => {
    setFinalizandoContrato(contrato);
    setDadosFinalizacao({
      minutosUsados: '',
      metodoPagamento: ''
    });
  };

  const handleFinalizarLocacao = () => {
    if (!finalizandoContrato) return;

    const patinete = patinetes.find(p => p.id === finalizandoContrato.patineteId);
    if (!patinete) {
      showError('Patinete não encontrado');
      return;
    }

    if (!dadosFinalizacao.minutosUsados || isNaN(Number(dadosFinalizacao.minutosUsados))) {
      showError('Informe um número válido de minutos');
      return;
    }

    if (!dadosFinalizacao.metodoPagamento) {
      showError('Selecione o método de pagamento');
      return;
    }

    const minutos = Number(dadosFinalizacao.minutosUsados);
    const valorTotal = minutos * patinete.valorPorMinuto;

    // Finalizar contrato
    setContratos(prev => prev.map(c => 
      c.id === finalizandoContrato.id 
        ? { 
            ...c, 
            dataFim: new Date().toISOString(),
            minutosUsados: minutos,
            valorTotal,
            status: 'finalizado' as const,
            metodoPagamento: dadosFinalizacao.metodoPagamento
          }
        : c
    ));

    // Marcar patinete como disponível automaticamente
    setPatinetes(prev => prev.map(p => 
      p.id === finalizandoContrato.patineteId 
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
      contratoId: finalizandoContrato.id,
      metodoPagamento: dadosFinalizacao.metodoPagamento
    };

    setFluxoCaixa(prev => [...prev, novaEntrada]);
    
    const metodoPagamentoLabel = metodosPagamento.find(m => m.value === dadosFinalizacao.metodoPagamento)?.label;
    showSuccess(`Locação finalizada! Valor: R$ ${valorTotal.toFixed(2)} - Pagamento: ${metodoPagamentoLabel}`);
    
    setFinalizandoContrato(null);
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

  const calcularValorEstimado = () => {
    if (!finalizandoContrato || !dadosFinalizacao.minutosUsados) return 0;
    
    const patinete = patinetes.find(p => p.id === finalizandoContrato.patineteId);
    if (!patinete) return 0;
    
    const minutos = Number(dadosFinalizacao.minutosUsados) || 0;
    return minutos * patinete.valorPorMinuto;
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
                    onClick={() => abrirDialogFinalizacao(contrato)}
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

      {/* Dialog de Finalização */}
      <Dialog open={!!finalizandoContrato} onOpenChange={() => setFinalizandoContrato(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Finalizar Locação</span>
            </DialogTitle>
          </DialogHeader>
          
          {finalizandoContrato && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  {clientes.find(c => c.id === finalizandoContrato.clienteId)?.nome}
                </p>
                <p className="text-xs text-blue-700">
                  {patinetes.find(p => p.id === finalizandoContrato.patineteId)?.marca} {patinetes.find(p => p.id === finalizandoContrato.patineteId)?.modelo}
                </p>
              </div>

              <div>
                <Label htmlFor="minutosUsados">Minutos Utilizados *</Label>
                <Input
                  id="minutosUsados"
                  type="number"
                  min="1"
                  value={dadosFinalizacao.minutosUsados}
                  onChange={(e) => setDadosFinalizacao(prev => ({ ...prev, minutosUsados: e.target.value }))}
                  placeholder="Ex: 30"
                />
              </div>

              <div>
                <Label htmlFor="metodoPagamento">Método de Pagamento *</Label>
                <Select 
                  value={dadosFinalizacao.metodoPagamento} 
                  onValueChange={(value: 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'pix' | 'transferencia') => 
                    setDadosFinalizacao(prev => ({ ...prev, metodoPagamento: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {metodosPagamento.map(metodo => (
                      <SelectItem key={metodo.value} value={metodo.value}>
                        {metodo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {dadosFinalizacao.minutosUsados && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-900">
                    Valor Total: R$ {calcularValorEstimado().toFixed(2)}
                  </p>
                  <p className="text-xs text-green-700">
                    {dadosFinalizacao.minutosUsados} minutos × R$ {patinetes.find(p => p.id === finalizandoContrato.patineteId)?.valorPorMinuto.toFixed(2)}/min
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFinalizandoContrato(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleFinalizarLocacao}
                  disabled={!dadosFinalizacao.minutosUsados || !dadosFinalizacao.metodoPagamento}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finalizar Locação
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmAndamento;