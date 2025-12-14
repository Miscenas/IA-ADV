import React, { useState } from 'react';
import { Scale, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';

export const Login: React.FC = () => {
  const { login, isLoading } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await login(email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-slate-900 rounded-lg flex items-center justify-center">
            <Scale className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Assistente Jurídico
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Micro-SaaS para advogados brasileiros
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-xl">Acesse sua conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="E-mail profissional"
                  type="email"
                  placeholder="seu.nome@advocacia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
              
              <div className="text-center">
                 <p className="text-xs text-slate-500">
                   Acesso exclusivo para advogados cadastrados.
                 </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};