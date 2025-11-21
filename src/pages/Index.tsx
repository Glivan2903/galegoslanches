
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="text-center max-w-2xl px-4">
        <div className="bg-delivery-500 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-2xl">DP</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Delivery Max</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Sistema completo para gestão de delivery, vendas e controle de pedidos para seu restaurante.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            Acessar Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/settings')}
          >
            Configurar Restaurante
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Index;
