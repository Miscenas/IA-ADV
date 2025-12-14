import React, { useState } from 'react';
import { Search, Filter, FolderOpen, FileText, Calendar, ArrowUpRight, Scale, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, Input, Button, Badge } from '../components/ui';

// Mock Data representing active processes for the lawyer
const MOCK_PROCESSES = [
  {
    id: '1',
    number: '1009876-55.2024.8.26.0100',
    court: 'TJSP - 25ª Vara Cível - Foro Central Cível',
    parties: 'João da Silva x Construtora Exemplo Ltda',
    action: 'Procedimento Comum Cível',
    status: 'Em Andamento',
    lastUpdate: '2024-03-15',
    lastMovement: 'Conclusos para Despacho',
    client: 'João da Silva',
    tags: ['Cível', 'Consumidor']
  },
  {
    id: '2',
    number: '0004561-12.2023.8.26.0050',
    court: 'TJSP - 1ª Vara da Família e Sucessões',
    parties: 'Maria Oliveira x José Oliveira',
    action: 'Divórcio Consensual',
    status: 'Julgado',
    lastUpdate: '2024-02-10',
    lastMovement: 'Trânsito em Julgado',
    client: 'Maria Oliveira',
    tags: ['Família']
  },
   {
    id: '3',
    number: '5001234-88.2024.4.03.6100',
    court: 'TRF3 - 4ª Vara Federal de São Paulo',
    parties: 'Tech Solutions Ltda x União Federal',
    action: 'Mandado de Segurança',
    status: 'Suspenso',
    lastUpdate: '2024-01-20',
    lastMovement: 'Aguardando Decisão de Recurso (Agravo)',
    client: 'Tech Solutions Ltda',
    tags: ['Tributário', 'Federal']
  },
  {
    id: '4',
    number: '1500222-33.2023.8.26.0001',
    court: 'TJSP - 2ª Vara Criminal - Santana',
    parties: 'Justiça Pública x Carlos Eduardo',
    action: 'Ação Penal - Procedimento Ordinário',
    status: 'Em Andamento',
    lastUpdate: '2024-03-18',
    lastMovement: 'Expedição de Mandado de Citação',
    client: 'Carlos Eduardo',
    tags: ['Criminal']
  }
];

export const ProcessHistory: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProcesses = MOCK_PROCESSES.filter(p => 
        p.number.includes(searchTerm) || 
        p.parties.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Em Andamento': return 'bg-blue-100 text-blue-800';
            case 'Julgado': return 'bg-green-100 text-green-800';
            case 'Suspenso': return 'bg-yellow-100 text-yellow-800';
            case 'Arquivado': return 'bg-slate-100 text-slate-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Meus Processos</h2>
                    <p className="text-slate-500 mt-1">Histórico completo de processos em que você atua.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={Filter}>Filtrar</Button>
                    <Button icon={FolderOpen}>Cadastrar Processo</Button>
                </div>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Buscar por número CNJ, partes ou cliente..." 
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Process List */}
            <div className="space-y-4">
                {filteredProcesses.map((proc) => (
                    <Card key={proc.id} className="hover:shadow-md transition-shadow group">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                                {/* Left Status Strip */}
                                <div className={`w-2 md:w-2 rounded-l-lg ${
                                    proc.status === 'Em Andamento' ? 'bg-blue-500' :
                                    proc.status === 'Julgado' ? 'bg-green-500' :
                                    'bg-yellow-500'
                                }`}></div>

                                <div className="p-6 flex-1">
                                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="font-mono text-lg font-bold text-slate-800 flex items-center gap-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                                                    {proc.number}
                                                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(proc.status)}`}>
                                                    {proc.status}
                                                </span>
                                                {proc.tags.map(tag => (
                                                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h3 className="text-base font-semibold text-slate-700">{proc.parties}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <span className="flex items-center gap-1"><Scale className="h-3 w-3" /> {proc.court}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-between items-end min-w-[200px]">
                                             <div className="text-right">
                                                 <span className="text-xs text-slate-400 uppercase font-bold">Cliente</span>
                                                 <p className="text-sm font-medium text-slate-800">{proc.client}</p>
                                             </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-md p-3 border border-slate-100 flex items-start gap-3 mt-2">
                                        <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Última Movimentação ({new Date(proc.lastUpdate).toLocaleDateString('pt-BR')})</p>
                                            <p className="text-sm text-slate-800 font-medium">{proc.lastMovement}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 self-center">
                                            <FileText className="h-4 w-4 mr-1" /> Ver Autos
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredProcesses.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-white border border-dashed border-slate-200 rounded-lg">
                        <AlertCircle className="h-10 w-10 mb-3 text-slate-300" />
                        <p className="font-medium">Nenhum processo encontrado</p>
                        <p className="text-sm mt-1">Tente ajustar os filtros de busca.</p>
                    </div>
                )}
            </div>
        </div>
    );
};