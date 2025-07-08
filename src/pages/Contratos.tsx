import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Play, Square, Clock, CheckCircle, X, FileText } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Contrato, FluxoCaixa } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';

const Contratos = () => {
  const { contratos, setContratos, clientes, patinetes, setPatinetes, setFluxoCaixa } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    clienteId: '',
    patineteId: '',
    tempoEstimado: 30,
    observacoes: ''
  });

  const filteredContratos = contratos.filter(contrato => {
    const cliente = clientes.find(c => c.id === contrato.clienteId);
    const patinete = patinetes.find(p => p.id === contrato.patineteId);
    
    return (
      cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patinete?.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.id.includes(searchTerm)
    );
  });

  const clientesAtivos = clientes.filter(c => c.status === 'ativo');
  const patinetesDisponiveis = patinetes.filter(p => 
    p.status === 'disponivel' || p.status === 'devolvido'
  );

  const resetForm = () => {
    setFormData({
      clienteId: '',
      patineteId: '',
      tempoEstimado: 30,
      observacoes: ''
    });
    setEditingContrato(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId || !formData.patineteId) {
      showError('Selecione cliente e patinete');
      return;
    }

    const patinete = patinetes.find(p => p.id === formData.patineteId);
    if (!patinete) {
      showError('Patinete não encontrado');
      return;
    }

    if (editingContrato) {
      // Editar contrato existente
      setContratos(prev => prev.map(contrato => 
        contrato.id === editingContrato.id 
          ? { 
              ...contrato, 
              clienteId: formData.clienteId,
              patineteId: formData.patineteId,
              tempoEstimado: formData.tempoEstimado,
              valorEstimado: formData.tempoEstimado * patinete.valorPorMinuto,
              observacoes: formData.observacoes
            }
          : contrato
      ));
      showSuccess('Contrato atualizado com sucesso!');
    } else {
      // Criar novo contrato (status pendente)
      const novoContrato: Contrato = {
        id: Date.now().toString(),
        clienteId: formData.clienteId,
        patineteId: formData.patineteId,
        dataInicio: new Date().toISOString(),
        minutosUsados: 0,
        valorTotal: 0,
        status: 'pendente',
        observacoes: formData.observacoes,
        tempoEstimado: formData.tempoEstimado,
        valorEstimado: formData.tempoEstimado * patinete.valorPorMinuto
      };

      setContratos(prev => [...prev, novoContrato]);
      showSuccess('Contrato criado! Aguardando aceitação do cliente.');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleAceitarContrato = (contrato: Contrato) => {
    if (!confirm('Confirmar aceitação do contrato pelo cliente?')) return;

    // Aceitar contrato
    setContratos(prev => prev.map(c => 
      c.id === contrato.id 
        ? { 
            ...c, 
            status: 'aceito' as const,
            dataAceitacao: new Date().toISOString()
          }
        : c
    ));

    showSuccess('Contrato aceito pelo cliente!');
  };

  const handleRejeitarContrato = (contrato: Contrato) => {
    if (!confirm('Confirmar rejeição do contrato pelo cliente?')) return;

    // Rejeitar contrato
    setContratos(prev => prev.map(c => 
      c.id === contrato.id 
        ? { ...c, status: 'rejeitado' as const }
        : c
    ));

    showSuccess('Contrato rejeitado pelo cliente.');
  };

  const handleIniciarLocacao = (contrato: Contrato) => {
    if (!confirm('Iniciar locação agora?')) return;

    // Iniciar locação
    setContratos(prev => prev.map(c => 
      c.id === contrato.id 
        ? { 
            ...c, 
            status: 'ativo' as const,
            dataInicio: new Date().toISOString()
          }
        : c
    ));

    // Atualizar status do patinete para em andamento
    setPatinetes(prev => prev.map(p => 
      p.id === contrato.patineteId 
        ? { ...p, status: 'em_andamento' as const }
        : p
    ));

    showSuccess('Locação iniciada com sucesso!');
  };

  const handleFinalizarContrato = (contrato: Contrato) => {
    const patinete = patinetes.find(p => p.id === contrato.patineteId);
    if (!patinete) return;

    const minutosUsados = prompt('Quantos minutos foram utilizados?');
    if (!minutosUsados || isNaN(Number(minutosUsados))) return;

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

    // Marcar patinete como devolvido
    setPatinetes(prev => prev.map(p => 
      p.id === contrato.patineteId 
        ? { ...p, status: 'devolvido' as const }
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
    showSuccess(`Locação finalizada! Valor: R$ ${valorTotal.toFixed(2)}`);
  };

  const handleCancelarContrato = (contrato: Contrato) => {
    if (!confirm('Tem certeza que deseja cancelar este contrato?')) return;

    // Cancelar contrato
    setContratos(prev => prev.map(c => 
      c.id === contrato.id 
        ? { ...c, status: 'cancelado' as const }
        : c
    ));

    // Liberar patinete se estava em uso
    if (contrato.status === 'ativo') {
      setPatinetes(prev => prev.map(p => 
        p.id === contrato.patineteId 
          ? { ...p, status: 'disponivel' as const }
          : p
      ));
    }

    showSuccess('Contrato cancelado com sucesso!');
  };

  const handleEdit = (contrato: Contrato) => {
    setEditingContrato(contrato);
    setFormData({
      clienteId: contrato.clienteId,
      patineteId: contrato.patineteId,
      tempoEstimado: contrato.tempoEstimado || 30,
      observacoes: contrato.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este contrato?')) {
      setContratos(prev => prev.filter(contrato => contrato.id !== id));
      showSuccess('Contrato excluído com sucesso!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'secondary';
      case 'aceito': return 'default';
      case 'ativo': return 'default';
      case 'finalizado': return 'secondary';
      case 'cancelado': return 'destructive';
      case 'rejeitado': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'aceito': return 'Aceito';
      case 'ativo': return 'Ativo';
      case 'finalizado': return 'Finalizado';
      case 'cancelado': return 'Cancelado';
      case 'rejeitado': return 'Rejeitado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">
            Gerencie contratos de locação com sistema de aceitação
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingContrato ? 'Editar Contrato' : 'Novo Contrato'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
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
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                          {patinete.marca} {patinete.modelo} - R$ {patinete.valorPorMinuto.toFixed(2)}/min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tempoEstimado">Tempo Estimado (minutos)</Label>
                  <Input
                    id="tempoEstimado"
                    type="number"
                    min="1"
                    value={formData.tempoEstimado}
                    onChange={(e) => setFormData(prev => ({ ...prev, tempoEstimado: parseInt(e.target.value) || 30 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Termos e condições do contrato..."
                  />
                </div>

                {formData.patineteId && formData.tempoEstimado > 0 && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium">Valor Estimado:</p>
                    <p className="text-lg font-bold text-green-600">
                      R$ {(formData.tempoEstimado * (patinetes.find(p => p.id === formData.patineteId)?.valorPorMinuto || 0)).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingContrato ? 'Atualizar' : 'Criar Contrato'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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

      {/* Lista de Contratos */}
      <div className="grid gap-4">
        {filteredContratos.map((contrato) => {
          const cliente = clientes.find(c => c.id === contrato.clienteId);
          const patinete = patinetes.find(p => p.id === contrato.patineteId);
          
          return (
            <Card key={contrato.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {cliente?.nome || 'Cliente não encontrado'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {patinete?.marca} {patinete?.modelo} • ID: {contrato.id}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(contrato.status)}>
                    {getStatusLabel(contrato.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Criado em</p>
                    <p>{format(new Date(contrato.dataInicio), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  {contrato.dataAceitacao && (
                    <div>
                      <p className="text-muted-foreground">Aceito em</p>
                      <p>{format(new Date(contrato.dataAceitacao), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Tempo Estimado</p>
                    <p>{contrato.tempoEstimado || 0} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor Estimado</p>
                    <p className="font-medium">R$ {(contrato.valorEstimado || 0).toFixed(2)}</p>
                  </div>
                </div>

                {contrato.observacoes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="text-sm">{contrato.observacoes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  {contrato.status === 'pendente' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAceitarContrato(contrato)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aceitar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejeitarContrato(contrato)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                  
                  {contrato.status === 'aceito' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIniciarLocacao(contrato)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Iniciar Locação
                    </Button>
                  )}

                  {contrato.status === 'ativo' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFinalizarContrato(contrato)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Finalizar
                    </Button>
                  )}

                  {(contrato.status === 'pendente' || contrato.status === 'aceito' || contrato.status === 'ativo') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelarContrato(contrato)}
                    >
                      Cancelar
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(contrato)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(contrato.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredContratos.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum contrato encontrado' : 'Nenhum contrato cadastrado ainda'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Contratos;