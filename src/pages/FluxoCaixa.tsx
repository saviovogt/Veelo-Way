import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { FluxoCaixa } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';

const FluxoCaixaPage = () => {
  const { fluxoCaixa, setFluxoCaixa } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FluxoCaixa | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [formData, setFormData] = useState({
    tipo: 'entrada' as 'entrada' | 'saida',
    valor: 0,
    descricao: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0],
    metodoPagamento: '' as 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'pix' | 'transferencia' | ''
  });

  const categorias = [
    'Locação',
    'Manutenção',
    'Combustível',
    'Seguro',
    'Marketing',
    'Aluguel',
    'Salários',
    'Outros'
  ];

  const metodosPagamento = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'cartao_debito', label: 'Cartão de Débito' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'pix', label: 'PIX' },
    { value: 'transferencia', label: 'Transferência' }
  ];

  const filteredFluxoCaixa = fluxoCaixa.filter(item => {
    const matchesSearch = 
      item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filtroTipo === 'todos' || item.tipo === filtroTipo;
    
    return matchesSearch && matchesTipo;
  });

  const stats = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const mesAtual = format(new Date(), 'yyyy-MM');

    const entradas = fluxoCaixa.filter(f => f.tipo === 'entrada');
    const saidas = fluxoCaixa.filter(f => f.tipo === 'saida');

    const totalEntradas = entradas.reduce((sum, f) => sum + f.valor, 0);
    const totalSaidas = saidas.reduce((sum, f) => sum + f.valor, 0);
    const saldo = totalEntradas - totalSaidas;

    const entradasHoje = entradas
      .filter(f => f.data === hoje)
      .reduce((sum, f) => sum + f.valor, 0);

    const saidasHoje = saidas
      .filter(f => f.data === hoje)
      .reduce((sum, f) => sum + f.valor, 0);

    const entradasMes = entradas
      .filter(f => f.data.startsWith(mesAtual))
      .reduce((sum, f) => sum + f.valor, 0);

    const saidasMes = saidas
      .filter(f => f.data.startsWith(mesAtual))
      .reduce((sum, f) => sum + f.valor, 0);

    // Estatísticas por método de pagamento
    const estatisticasPagamento = metodosPagamento.reduce((acc, metodo) => {
      const valorTotal = entradas
        .filter(f => f.metodoPagamento === metodo.value)
        .reduce((sum, f) => sum + f.valor, 0);
      
      acc[metodo.value] = valorTotal;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEntradas,
      totalSaidas,
      saldo,
      entradasHoje,
      saidasHoje,
      entradasMes,
      saidasMes,
      estatisticasPagamento
    };
  }, [fluxoCaixa]);

  const resetForm = () => {
    setFormData({
      tipo: 'entrada',
      valor: 0,
      descricao: '',
      categoria: '',
      data: new Date().toISOString().split('T')[0],
      metodoPagamento: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.categoria || formData.valor <= 0) {
      showError('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingItem) {
      // Editar item existente
      setFluxoCaixa(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData }
          : item
      ));
      showSuccess('Registro atualizado com sucesso!');
    } else {
      // Criar novo item
      const novoItem: FluxoCaixa = {
        id: Date.now().toString(),
        ...formData
      };
      setFluxoCaixa(prev => [...prev, novoItem]);
      showSuccess('Registro adicionado com sucesso!');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (item: FluxoCaixa) => {
    setEditingItem(item);
    setFormData({
      tipo: item.tipo,
      valor: item.valor,
      descricao: item.descricao,
      categoria: item.categoria,
      data: item.data,
      metodoPagamento: item.metodoPagamento || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      setFluxoCaixa(prev => prev.filter(item => item.id !== id));
      showSuccess('Registro excluído com sucesso!');
    }
  };

  const getMetodoPagamentoLabel = (metodo?: string) => {
    if (!metodo) return '';
    return metodosPagamento.find(m => m.value === metodo)?.label || metodo;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Controle suas entradas e saídas financeiras
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Registro' : 'Novo Registro'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value: 'entrada' | 'saida') => 
                    setFormData(prev => ({ ...prev, tipo: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, categoria: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(categoria => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.tipo === 'entrada' && (
                  <div>
                    <Label htmlFor="metodoPagamento">Método de Pagamento</Label>
                    <Select value={formData.metodoPagamento} onValueChange={(value: 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'pix' | 'transferencia') => 
                      setFormData(prev => ({ ...prev, metodoPagamento: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
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
                )}

                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva o motivo da entrada/saída..."
                  />
                </div>

                <div>
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.totalEntradas.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Hoje: R$ {stats.entradasHoje.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {stats.totalSaidas.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Hoje: R$ {stats.saidasHoje.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {stats.saldo.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Entradas - Saídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats.entradasMes - stats.saidasMes) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {(stats.entradasMes - stats.saidasMes).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Método de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Entradas por Método de Pagamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {metodosPagamento.map(metodo => (
              <div key={metodo.value} className="text-center">
                <p className="text-lg font-bold text-green-600">
                  R$ {stats.estatisticasPagamento[metodo.value]?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-muted-foreground">{metodo.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filtroTipo} onValueChange={(value: 'todos' | 'entrada' | 'saida') => setFiltroTipo(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="entrada">Entradas</SelectItem>
            <SelectItem value="saida">Saídas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Registros */}
      <div className="grid gap-4">
        {filteredFluxoCaixa
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
          .map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant={item.tipo === 'entrada' ? 'default' : 'destructive'}>
                      {item.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </Badge>
                    <Badge variant="outline">{item.categoria}</Badge>
                    {item.metodoPagamento && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {getMetodoPagamentoLabel(item.metodoPagamento)}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-medium">{item.descricao}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(item.data), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${
                    item.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.tipo === 'entrada' ? '+' : '-'} R$ {item.valor.toFixed(2)}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFluxoCaixa.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm || filtroTipo !== 'todos' ? 'Nenhum registro encontrado' : 'Nenhum registro cadastrado ainda'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FluxoCaixaPage;