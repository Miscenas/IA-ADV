import React, { useState } from 'react';
import { Search, ExternalLink, Globe, Building2, Landmark, Gavel } from 'lucide-react';
import { Card, CardContent, Input, Badge, Button } from '../components/ui';

interface CourtLink {
  name: string;
  uf?: string;
  system: 'PJe' | 'e-SAJ' | 'eproc' | 'Projudi' | 'e-STJ' | 'Outros';
  url: string;
  type: 'superior' | 'federal' | 'state' | 'labor';
}

const COURTS_DATA: CourtLink[] = [
  // Superiores
  { name: 'STF - Supremo Tribunal Federal', system: 'Outros', url: 'https://peticionamento.stf.jus.br/', type: 'superior' },
  { name: 'STJ - Superior Tribunal de Justiça', system: 'e-STJ', url: 'https://www.stj.jus.br/sites/portalp/Processos/Peticionamento-Eletronico', type: 'superior' },
  { name: 'TST - Tribunal Superior do Trabalho', system: 'PJe', url: 'https://pje.tst.jus.br/', type: 'superior' },
  { name: 'TSE - Tribunal Superior Eleitoral', system: 'PJe', url: 'https://pje.tse.jus.br/', type: 'superior' },

  // Federais (TRFs)
  { name: 'TRF1 (AC, AM, AP, BA, DF, GO, MA, MG, MT, PA, PI, RO, RR, TO)', system: 'PJe', url: 'https://pje1g.trf1.jus.br/', type: 'federal' },
  { name: 'TRF2 (RJ, ES)', system: 'eproc', url: 'https://eproc.trf2.jus.br/', type: 'federal' },
  { name: 'TRF3 (SP, MS)', system: 'PJe', url: 'https://pje1g.trf3.jus.br/', type: 'federal' },
  { name: 'TRF4 (RS, SC, PR)', system: 'eproc', url: 'https://eproc.trf4.jus.br/', type: 'federal' },
  { name: 'TRF5 (AL, CE, PB, PE, RN, SE)', system: 'PJe', url: 'https://pje.trf5.jus.br/', type: 'federal' },
  { name: 'TRF6 (MG)', system: 'PJe', url: 'https://pje1g.trf6.jus.br/', type: 'federal' },

  // Estaduais (TJs)
  { name: 'TJSP - São Paulo', uf: 'SP', system: 'e-SAJ', url: 'https://esaj.tjsp.jus.br/esaj/portal.do?servico=740000', type: 'state' },
  { name: 'TJRJ - Rio de Janeiro', uf: 'RJ', system: 'PJe', url: 'https://tjrj.pje.jus.br/1g/login.seam', type: 'state' },
  { name: 'TJMG - Minas Gerais', uf: 'MG', system: 'PJe', url: 'https://pje.tjmg.jus.br/', type: 'state' },
  { name: 'TJRS - Rio Grande do Sul', uf: 'RS', system: 'eproc', url: 'https://eproc1g.tjrs.jus.br/', type: 'state' },
  { name: 'TJPR - Paraná', uf: 'PR', system: 'Projudi', url: 'https://projudi.tjpr.jus.br/', type: 'state' },
  { name: 'TJSC - Santa Catarina', uf: 'SC', system: 'eproc', url: 'https://eproc1g.tjsc.jus.br/', type: 'state' },
  { name: 'TJBA - Bahia', uf: 'BA', system: 'PJe', url: 'https://pje.tjba.jus.br/', type: 'state' },
  { name: 'TJDF - Distrito Federal', uf: 'DF', system: 'PJe', url: 'https://pje.tjdft.jus.br/', type: 'state' },
  { name: 'TJCE - Ceará', uf: 'CE', system: 'e-SAJ', url: 'https://esaj.tjce.jus.br/', type: 'state' },
  { name: 'TJPE - Pernambuco', uf: 'PE', system: 'PJe', url: 'https://pje.tjpe.jus.br/', type: 'state' },
  { name: 'TJGO - Goiás', uf: 'GO', system: 'Projudi', url: 'https://projudi.tjgo.jus.br/', type: 'state' },
  { name: 'TJES - Espírito Santo', uf: 'ES', system: 'PJe', url: 'https://pje.tjes.jus.br/', type: 'state' },
  { name: 'TJMT - Mato Grosso', uf: 'MT', system: 'PJe', url: 'https://pje.tjmt.jus.br/', type: 'state' },
  { name: 'TJMS - Mato Grosso do Sul', uf: 'MS', system: 'e-SAJ', url: 'https://esaj.tjms.jus.br/', type: 'state' },

  // Trabalhistas (Exemplos)
  { name: 'CSJT - PJe Nacional (Trabalhista)', system: 'PJe', url: 'https://www.csjt.jus.br/pje', type: 'labor' },
  { name: 'TRT2 - São Paulo (Capital)', system: 'PJe', url: 'https://pje.trt2.jus.br/', type: 'labor' },
  { name: 'TRT15 - Campinas/Interior SP', system: 'PJe', url: 'https://pje.trt15.jus.br/', type: 'labor' },
  { name: 'TRT1 - Rio de Janeiro', system: 'PJe', url: 'https://pje.trt1.jus.br/', type: 'labor' },
];

export const FilingLinks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'superior' | 'federal' | 'state' | 'labor'>('all');

  const filteredCourts = COURTS_DATA.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          court.system.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (court.uf && court.uf.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || court.type === selectedType;

    return matchesSearch && matchesType;
  });

  const getSystemBadgeColor = (system: string) => {
    switch(system) {
      case 'PJe': return 'bg-blue-100 text-blue-800';
      case 'e-SAJ': return 'bg-orange-100 text-orange-800';
      case 'eproc': return 'bg-green-100 text-green-800';
      case 'Projudi': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Portais de Peticionamento</h2>
          <p className="text-slate-500 mt-1">Acesso rápido aos sistemas dos Tribunais Superiores, Federais e Estaduais.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por Tribunal, Estado (UF) ou Sistema..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <Button 
            variant={selectedType === 'all' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            Todos
          </Button>
          <Button 
            variant={selectedType === 'superior' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setSelectedType('superior')}
          >
            Superiores
          </Button>
          <Button 
            variant={selectedType === 'federal' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setSelectedType('federal')}
          >
            Federais
          </Button>
          <Button 
            variant={selectedType === 'state' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setSelectedType('state')}
          >
            Estaduais
          </Button>
           <Button 
            variant={selectedType === 'labor' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setSelectedType('labor')}
          >
            Trabalhista
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourts.map((court, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    court.type === 'federal' ? 'bg-blue-50' : 
                    court.type === 'state' ? 'bg-indigo-50' : 
                    court.type === 'superior' ? 'bg-yellow-50' : 'bg-slate-50'
                  }`}>
                    {court.type === 'federal' ? <Globe className="h-5 w-5 text-blue-600" /> :
                     court.type === 'superior' ? <Landmark className="h-5 w-5 text-yellow-600" /> :
                     court.type === 'labor' ? <Gavel className="h-5 w-5 text-slate-600" /> :
                     <Building2 className="h-5 w-5 text-indigo-600" />}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getSystemBadgeColor(court.system)}`}>
                    {court.system}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{court.name}</h3>
                <p className="text-xs text-slate-500 mb-4 truncate">{court.url}</p>
              </div>
              
              <a 
                href={court.url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors border border-slate-200"
              >
                Acessar Portal <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        ))}
        {filteredCourts.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500">Nenhum tribunal encontrado para a busca atual.</p>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-800 flex items-start gap-2">
         <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" />
         <p>
           Atenção: Os links acima redirecionam para portais externos oficiais dos tribunais. 
           O <strong>Assistente Jurídico Brasileiro</strong> não possui vínculo com estes sistemas e não armazena suas credenciais de acesso (certificado digital ou senha).
         </p>
      </div>
    </div>
  );
};