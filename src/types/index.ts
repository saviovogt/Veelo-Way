export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  dataCadastro: string;
  status: 'ativo' | 'inativo';
}

export interface Patinete {
  id: string;
  modelo: string;
  marca: string;
  numeroSerie: string;
  status: 'disponivel' | 'alugado' | 'manutencao';
  bateria: number;
  localizacao: string;
  valorPorMinuto: number;
  dataCadastro: string;
}

export interface Contrato {
  id: string;
  clienteId: string;
  patineteId: string;
  dataInicio: string;
  dataFim?: string;
  minutosUsados: number;
  valorTotal: number;
  status: 'ativo' | 'finalizado' | 'cancelado';
  observacoes?: string;
}

export interface FluxoCaixa {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string;
  categoria: string;
  data: string;
  contratoId?: string;
}

export interface DashboardStats {
  totalClientes: number;
  patineteDisponiveis: number;
  contratoAtivos: number;
  receitaHoje: number;
  receitaMes: number;
}