import React from 'react';
import { Plus, FileText, Clock, CheckCircle } from 'lucide-react';
import { useStore } from '../store';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../components/ui';
import { PetitionStatus } from '../types';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { petitions, user } = useStore();

  const getStatusVariant = (status: PetitionStatus) => {
    switch (status) {
      case PetitionStatus.COMPLETED: return 'success';
      case PetitionStatus.REVIEW: return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Olá, {user?.name}</h2>
          <p className="text-slate-500 mt-1">Aqui está o resumo das suas atividades recentes.</p>
        </div>
        <Button onClick={() => onNavigate('create-petition')} icon={Plus} size="lg">
          Criar Nova Petição
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Petições</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{petitions.length}</div>
            <p className="text-xs text-slate-500 mt-1">Documentos criados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Em Rascunho</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {petitions.filter(p => p.status === PetitionStatus.DRAFT).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Pendentes de finalização</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Finalizadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {petitions.filter(p => p.status === PetitionStatus.COMPLETED).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Prontas para protocolo</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Últimas Petições</h3>
        {petitions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-slate-900">Nenhuma petição encontrada</h3>
            <p className="text-sm text-slate-500 mt-1">Comece criando sua primeira petição assistida por IA.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <ul role="list" className="divide-y divide-slate-100">
              {petitions.map((petition) => (
                <li key={petition.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-blue-600 truncate">{petition.title}</p>
                        <Badge variant={getStatusVariant(petition.status)}>{petition.status}</Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                        <span>Cliente: {petition.clientName}</span>
                        <span>•</span>
                        <span>Área: {petition.type}</span>
                        <span>•</span>
                        <span>Atualizado em: {new Date(petition.updatedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};