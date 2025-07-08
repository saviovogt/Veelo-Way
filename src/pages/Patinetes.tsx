import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Search, Edit, Trash2, Battery, MapPin } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Patinete } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

const Patinetes = () => {
  const { patinetes, setPatinetes } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatinete, setEditingPatinete] = useState<Patinete | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    modelo: '',
    marca: '',
    numeroSerie: '',
    status: 'disponivel' as 'disponivel' | 'alugado' | 'manutencao',
    bateria: 100,
    localizacao: '',
    valorPorMinuto: 0.50
  });

  const filteredPatinetes = patinetes.filter(patinete =>
    patinete.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patinete.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patinete.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patinete.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      modelo: '',
      marca: '',
      numeroSerie: '',
      status: 'disponivel',
      bateria: 100,
      localizacao: '',
      valorPorMinuto: 0.50
    });
    setEditingPatinete(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.modelo || !formData.marca || !formData.numeroSerie) {
      showError('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingPatinete) {
      // Editar patinete existente
      setPatinetes(prev => prev.map(patinete => 
        patinete.id === editingPatinete.id 
          ? { ...patinete, ...formData }
          : patinete
      ));
      showSuccess('Patinete atualizado com sucesso!');
    } else {
      // Criar novo patinete
      const novoPatinete: Patinete = {
        id: Date.now().toString(),
        ...formData,
        dataCadastro: new Date().toISOString().split('T')[0]
      };
      setPatinetes(prev => [...prev, novoPatinete]);
      showSuccess('Patinete cadastrado com sucesso!');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (patinete: Patinete) => {
    setEditingPatinete(patinete);
    setFormData({
      modelo: patinete.modelo,
      marca: patinete.marca,
      numeroSerie: patinete.numeroSerie,
      status: patinete.status,
      bateria: patinete.bateria,
      localizacao: patinete.localizacao,
      valorPorMinuto: patinete.valorPorMinuto
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este patinete?')) {
      setPatinetes(prev => prev.filter(patinete => patinete.id !== id));
      showSuccess('Patinete excluído com sucesso!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'default';
      case 'alugado': return 'destructive';
      case 'manutencao': return 'secondary';
      default: return 'default';
    }
  };

  const getBatteryColor = (bateria: number) => {
    if (bateria > 50) return 'bg-green-500';
    if (bateria > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Patinetes</h1>
          <p className="text-muted-foreground">
            Gerencie sua frota de patinetes elétricos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Patinete
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingPatinete ? 'Editar Patinete' : 'Novo Patinete'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                    placeholder="Ex: ES2"
                  />
                </div>
                <div>
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                    placeholder="Ex: Xiaomi"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="numeroSerie">Número de Série *</Label>
                  <Input
                    id="numeroSerie"
                    value={formData.numeroSerie}
                    onChange={(e) => setFormData(prev => ({ ...prev, numeroSerie: e.target.value }))}
                    placeholder="Ex: XM001234"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'disponivel' | 'alugado' | 'manutencao') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="alugado">Alugado</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bateria">Bateria (%)</Label>
                  <Input
                    id="bateria"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.bateria}
                    onChange={(e) => setFormData(prev => ({ ...prev, bateria: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                    placeholder="Ex: Praça da Sé, Centro"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="valorPorMinuto">Valor por Minuto (R$)</Label>
                  <Input
                    id="valorPorMinuto"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valorPorMinuto}
                    onChange={(e) => setFormData(prev => ({ ...prev, valorPorMinuto: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPatinete ? 'Atualizar' : 'Cadastrar'}
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
          placeholder="Buscar por modelo, marca, série ou localização..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Lista de Patinetes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatinetes.map((patinete) => (
          <Card key={patinete.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{patinete.modelo}</CardTitle>
                  <p className="text-sm text-muted-foreground">{patinete.marca}</p>
                </div>
                <Badge variant={getStatusColor(patinete.status)}>
                  {patinete.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Série: {patinete.numeroSerie}
              </p>
              
              <div className="flex items-center space-x-2">
                <Battery className="h-4 w-4" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bateria</span>
                    <span>{patinete.bateria}%</span>
                  </div>
                  <Progress 
                    value={patinete.bateria} 
                    className="h-2"
                  />
                </div>
              </div>

              {patinete.localizacao && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <p className="text-sm text-muted-foreground">{patinete.localizacao}</p>
                </div>
              )}

              <p className="text-sm font-medium">
                R$ {patinete.valorPorMinuto.toFixed(2)}/min
              </p>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(patinete)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(patinete.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatinetes.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum patinete encontrado' : 'Nenhum patinete cadastrado ainda'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Patinetes;