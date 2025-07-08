import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, CheckCircle, X, FileText } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Contrato } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';

const Contratos = () => {
  const { contratos, setContratos, clientes } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    clienteId: '',
    observacoes: ''
  });

  const filteredContratos = contratos.filter(contrato => {
    const cliente = clientes.find(c => c.id === contrato.clienteId);
    
    return (
      cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.id.includes(searchTerm)
    );
  });

  const clientesAtivos = clientes.filter(c => c.status === 'ativo');

  const resetForm = () => {
    setFormData({
      clienteId: '',
      observacoes: ''
    });
    setEditingContrato(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId) {
      showError('Selecione um cliente');
      return;
    }

    if (editingContrato) {
      // Editar contrato existente
      setContratos(prev => prev.map(contrato => 
        contrato.id === editingContrato.id 
          ? { 
              ...contrato, 
              clienteId: formData.clienteId,
              observacoes: formData.observacoes
            }
          : contrato
      ));
      showSuccess('Contrato atualizado com sucesso!');
    } else {
      // Criar novo contrato (apenas termos)
      const novoContrato: Contrato = {
        id: Date.now().toString(),
        clienteId: formData.clienteId,
        patineteId: '', // Não vinculado a patinete específico
        dataInicio: new Date().toISOString(),
        minutosUsados: 0,
        valorTotal: 0,
        status: 'pendente',
        observacoes: formData.observacoes
      };

      setContratos(prev => [...prev, novoContrato]);
      showSuccess('Contrato criado! Aguardando assinatura do cliente.');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleAceitarContrato = (contrato: Contrato) => {
    if (!confirm('Confirmar assinatura do contrato pelo cliente?')) return;

    // Aceitar contrato (assinar)
    setContratos(prev => prev.map(c => 
      c.id === contrato.id 
        ? { 
            ...c, 
            status: 'aceito' as const,
            dataAceitacao: new Date().toISOString()
          }
        : c
    ));

    showSuccess('Contrato assinado pelo cliente!');
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

  const handleCancelarContrato = (contrato: Contrato) => {
    if (!confirm('Tem certeza que deseja cancelar este contrato?')) return;

    // Cancelar contrato
    setContratos(prev => prev.map(c => 
      c.id === contrato.id 
        ? { ...c, status: 'cancelado' as const }
        : c
    ));

    showSuccess('Contrato cancelado com sucesso!');
  };

  const handleEdit = (contrato: Contrato) => {
    setEditingContrato(contrato);
    setFormData({
      clienteId: contrato.clienteId,
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
      case 'cancelado': return 'destructive';
      case 'rejeitado': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Aguardando Assinatura';
      case 'aceito': return 'Assinado';
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
            Gerencie termos e condições para assinatura dos clientes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
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
                          <div className="flex flex-col">
                            <span>{cliente.nome}</span>
                            <span className="text-xs text-muted-foreground">{cliente.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="observacoes">Termos e Condições *</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Digite os termos e condições do contrato..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 Este contrato será enviado para o cliente assinar. As locações são feitas separadamente na aba "Nova Locação".
                  </p>
                </div>
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
          placeholder="Buscar por cliente ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        {['pendente', 'aceito', 'rejeitado', 'cancelado'].map(status => {
          const count = contratos.filter(c => c.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{getStatusLabel(status)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lista de Contratos */}
      <div className="grid gap-4">
        {filteredContratos.map((contrato) => {
          const cliente = clientes.find(c => c.id === contrato.clienteId);
          
          return (
            <Card key={contrato.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {cliente?.nome || 'Cliente não encontrado'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {cliente?.email} • ID: {contrato.id}
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
                      <p className="text-muted-foreground">Assinado em</p>
                      <p>{format(new Date(contrato.dataAceitacao), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  )}
                </div>

                {contrato.observacoes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Termos e Condições</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{contrato.observacoes}</p>
                    </div>
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
                        Assinar
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

                  {contrato.status === 'pendente' && (
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