import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Play, Square, Clock } from 'lucide-react';
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
    minutosUsados: 0,
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
  // Patinetes disponíveis para nova locação (disponível ou devolvido)
  const patinetesDisponiveis = patinetes.filter(p => 
    p.status === 'disponivel' || p.status === 'devolvido'
  );

  const resetForm = () => {
    setFormData({
      clienteId: '',
      patineteId: '',
      minutosUsados: 0,
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
      const valorTotal = formData.minutosUsados * patinete.valorPorMinuto;
      
      setContratos(prev => prev.map(contrato => 
        contrato.id === editingContrato.id 
          ? { 
              ...contrato, 
              minutosUsados: formData.minutosUsados,
              valorTotal,
              observacoes: formData.observacoes
            }
          : contrato
      ));
      showSuccess('Contrato atualizado com sucesso!');
    } else {
      // Criar novo contrato (iniciar locação)
      const novoContrato: Contrato = {
        id: Date.now().toString(),
        clienteId: formData.clienteId,
        patineteId: formData.patineteId,
        dataInicio: new Date().toISOString(),
        minutosUsados: 0,
        valorTotal: 0,
        status: 'ativo',
        observacoes: formData.observacoes
      };

      setContratos(prev => [...prev, novoContrato]);
      
      // Atualizar status do patinete para em andamento
      setPatinetes(prev => prev.map(p => 
        p.id === formData.patineteId 
          ? { ...p, status: 'em_andamento' as const }
          : p
      ));
      
      showSuccess('Locação iniciada com sucesso!');
    }

    resetForm();
    setIsDialogOpen(false);
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
    if (!confirm('Tem certeza que deseja cancelar esta locação?')) return;

    // Cancelar contrato
    setContratos(prev => prev.map(c => 
      c.id === contrato.id 
        ? { ...c, status: 'cancelado' as const }
        : c
    ));

    // Liberar patinete (volta para disponível)
    setPatinetes(prev => prev.map(p => 
      p.id === contrato.patineteId 
        ? { ...p, status: 'disponivel' as const }
        : p
    ));

    showSuccess('Locação cancelada com sucesso!');
  };

  const handleEdit = (contrato: Contrato) => {
    setEditingContrato(contrato);
    setFormData({
      clienteId: contrato.clienteId,
      patineteId: contrato.patineteId,
      minutosUsados: contrato.minutosUsados,
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
      case 'ativo': return 'default';
      case 'finalizado': return 'secondary';
      case 'cancelado': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">
            Gerencie as locações de patinetes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Locação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingContrato ? 'Editar Contrato' : 'Nova Locação'}
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
                          <span className="text-xs text-muted-foreground ml-2">
                            ({patinete.status === 'disponivel' ? 'Disponível' : 'Devolvido'})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editingContrato && (
                  <div>
                    <Label htmlFor="minutosUsados">Minutos Utilizados</Label>
                    <Input
                      id="minutosUsados"
                      type="number"
                      min="0"
                      value={formData.minutosUsados}
                      onChange={(e) => setFormData(prev => ({ ...prev, minutosUsados: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre a locação..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingContrato ? 'Atualizar' : 'Iniciar Locação'}
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
                    {contrato.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Início</p>
                    <p>{format(new Date(contrato.dataInicio), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  {contrato.dataFim && (
                    <div>
                      <p className="text-muted-foreground">Fim</p>
                      <p>{format(new Date(contrato.dataFim), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Minutos</p>
                    <p>{contrato.minutosUsados} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor Total</p>
                    <p className="font-medium">R$ {contrato.valorTotal.toFixed(2)}</p>
                  </div>
                </div>

                {contrato.observacoes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="text-sm">{contrato.observacoes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  {contrato.status === 'ativo' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFinalizarContrato(contrato)}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Finalizar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelarContrato(contrato)}
                      >
                        Cancelar
                      </Button>
                    </>
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