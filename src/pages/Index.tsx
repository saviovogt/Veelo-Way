import React from 'react';
import { Zap, ArrowRight, Users, DollarSign, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mr-4">
              <Zap className="h-10 w-10 text-black" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-black mb-2">VeeloWay</h1>
              <p className="text-xl text-gray-700">Sistema de Gestão de Patinetes Elétricos</p>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Gerencie sua frota de patinetes elétricos de forma inteligente e eficiente. 
            Controle locações, clientes, pagamentos e relatórios em uma única plataforma.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/locacao">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-8 py-3 text-lg">
                Iniciar Nova Locação
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 px-8 py-3 text-lg">
                Ver Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-yellow-600" />
                <span>Gestão de Clientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Cadastre e gerencie seus clientes de forma organizada. 
                Controle dados pessoais, histórico de locações e status.
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                <span>Controle de Frota</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitore sua frota de patinetes em tempo real. 
                Acompanhe bateria, localização e status de cada veículo.
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-yellow-600" />
                <span>Fluxo de Caixa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Controle completo das finanças com registro de entradas, 
                saídas e métodos de pagamento utilizados.
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
                <span>Relatórios Detalhados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Análises completas de performance, receita por patinete 
                e estatísticas de uso da frota.
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowRight className="h-6 w-6 text-yellow-600" />
                <span>Locações Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Processo simplificado para iniciar, acompanhar e 
                finalizar locações com poucos cliques.
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                <span>Interface Intuitiva</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Design moderno e responsivo que facilita o uso 
                em qualquer dispositivo, desktop ou mobile.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-black rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-yellow-100 mb-6 text-lg">
            Transforme a gestão do seu negócio de patinetes elétricos hoje mesmo.
          </p>
          <Link to="/clientes">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-8 py-3 text-lg">
              Cadastrar Primeiro Cliente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;