import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, DollarSign, User, Zap, Calculator, CheckCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Contrato } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

const Locacao = () => {
  const { clientes, patinetes, setPatinetes, setContratos } = useApp();
  const [formData, setFormData] = useState({
    clienteId: '',
    patineteId: '',
    observacoes: ''
  });

  const clientesAtivos = clientes.filter(c => c.status === 'ativo');
  // Incluir patinetes disponíveis e devolvidos para locação
  const patinetesDisponiveis = patinetes.filter(p => 
    p.status === 'disponivel' || p.status === 'devolvido'
  );

  const clienteSelecionado = clientes.find(c => c.id === formData.clienteId);
  const patineteSelecionado = patinetes.find(p => p.id === formData.patineteId);

  const resetForm = () => {
    setFormData({
      clienteId: '',
      patineteId: '',
      observacoes: ''
    });
  };

  const handleSubmit = (e: React.Form Event) => {
    e.preventDefault();
    
    if (!formData.clienteId || !formData.patineteId) {
      showError('Preencha todos os campos obrigatórios');
      return;
    }

    if (!clienteSelecionado || !patineteSelecionado) {
      showError('Cliente ou patinete não encontrado');
      return;
    }

    // Criar registro de locação ativa
    const novaLocacao: Contrato = {
      id: Date.now().toString(),
      clienteId: formData.clienteId,
      patineteId: formData.patineteId,
      dataInicio: new Date().toISOString(),
      minutosUsados: 0,
      valorTotal: 0,
      status: 'ativo', // Locação ativa
      observacoes: formData.observacoes
    };

    setContratos(prev => [...prev, novaLocacao]);
    
    // Marcar patinete como em andamento
    setPatinetes(prev => prev.map(p => 
      p.id === formData.patineteId 
        ? { ...p, status: 'em_andamento' as const }
        : p
    ));
    
    showSuccess(`Locação iniciada! Cliente: ${clienteSelecionado.nome}`);
    resetForm();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'devolvido': return 'Devolvido';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nova Locação</h1>
        <p className="text-muted-foreground">
          Inicie uma nova locação de patinete
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulário de Locação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Dados da Locação</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="clienteId">Cliente *</Label>
                <Select value={formData.clienteId} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, clienteId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientesAtivos.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        <div className="flex flex-col">
                          <span>{cliente.nome}</span>
                          <span className="text-xs text-muted-foreground">{cliente.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clientesAtivos.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Nenhum cliente ativo encontrado
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="patineteId">Patinete *</Label>
                <Select value={formData.patineteId} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, patineteId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um patinete" />
                  </SelectTrigger>
                  <SelectContent>
                    {patinetesDisponiveis.map(patinete => (
                      <SelectItem key={patinete.id} value={patinete.id}>
                        <div className="flex flex-col">
                          <span>{patinete.marca} {patinete.modelo}</span>
                          <span className="text-xs text-muted-foreground">
                            R$ {patinete.valorPorMinuto.toFixed(2)}/min • {patinete.bateria}% bateria • {getStatusLabel(patinete.status)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {patinetesDisponiveis.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Nenhum patinete disponível
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações sobre a locação..."
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!formData.clienteId || !formData.patineteId}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Iniciar Locação
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resumo da Locação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Resumo da Locação</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cliente Selecionado */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cliente</span>
              </div>
              {clienteSelecionado ? (
                <div className="ml-6">
                  <p className="font-medium">{clienteSelecionado.nome}</p>
                  <p className="text-sm text-muted-foreground">{clienteSelecionado.email}</p>
                  <Badge variant="outline">{clienteSelecionado.status}</Badge>
                </div>
              ) : (
                <p className="ml-6 text-sm text-muted-foreground">Nenhum cliente selecionado</p>
              )}
            </div>

            <Separator />

            {/* Patinete Selecionado */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Patinete</span>
              </div>
              {patineteSelecionado ? (
                <div className="ml-6">
                  <p className="font-medium">{patineteSelecionado.marca} {patineteSelecionado.modelo}</p>
                  <p className="text-sm text-muted-foreground">
                    Série: {patineteSelecionado.numeroSerie}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">
                      R$ {patineteSelecionado.valorPorMinuto.toFixed(2)}/min
                    </Badge>
                    <Badge variant="outline">
                      {patineteSelecionado.bateria}% bateria
                    </Badge>
                    <Badge variant="outline">
                      {getStatusLabel(patineteSelecionado.status)}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="ml-6 text-sm text-muted-foreground">Nenhum patinete selecionado</p>
              )}
            </div>

            <Separator />

            {/* Informações da Locação */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Locação</span>
              </div>
              <div className="ml-6 space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Tipo:</span> Locação por tempo
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Cobrança:</span> Por minuto de uso
                </p>
                <div className="bg-blue-50 p-3 rounded-lg mt-2">
                  <p className="text-xs text-blue-700">
                    💡 O valor será calculado no final da locação baseado no tempo de uso
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{clientesAtivos.length}</p>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{patinetesDisponiveis.length}</p>
              <p className="text-sm text-muted-foreground">Patinetes Disponíveis</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                R$ {patinetesDisponiveis.length > 0 
                  ? (patinetesDisponiveis.reduce((sum, p) => sum + p.valorPorMinuto, 0) / patinetesDisponiveis.length).toFixed(2)
                  : '0.00'
                }
              </p>
              <p className="text-sm text-muted-foreground">Valor Médio/min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Locacao;