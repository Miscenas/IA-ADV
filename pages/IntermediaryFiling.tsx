import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  UploadCloud, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import { Input, Button, Card, CardContent, Badge } from '../components/ui';
import { useStore } from '../store';

export const IntermediaryFiling: React.FC = () => {
  const { activePetitionForFiling } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [processNumber, setProcessNumber] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [teor, setTeor] = useState('');

  // Auto-fill logic
  useEffect(() => {
     if (activePetitionForFiling) {
       // If there is an active petition, we assume the user might have the process number already 
       // or is here to attach this petition.
       // We can pre-fill the "Teor" (Description)
       setTeor(`Juntada de ${activePetitionForFiling.title}. Requerente: ${activePetitionForFiling.clientName}.`);
       setFiles(prev => [...prev, "Peticao_Gerada.pdf"]);
     }
  }, [activePetitionForFiling]);

  // Mock search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (processNumber.length > 5) {
      setStep(2);
    }
  };

  const handleFileUpload = () => {
    setFiles([...files, "Anexo_Extra.pdf"]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg flex justify-between items-center">
        <div>
            <div className="flex items-center gap-3 mb-2">
            <Briefcase className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Peticionamento Intermediário</h2>
            </div>
            <p className="text-slate-400">
            Simulador de juntada de petições e documentos em processos em andamento (eSAJ/eproc).
            </p>
        </div>
        {activePetitionForFiling && (
            <div className="bg-blue-900/50 px-4 py-2 rounded border border-blue-500/30 text-xs">
                <p className="text-blue-200">Anexando: <span className="font-bold text-white">{activePetitionForFiling.title}</span></p>
            </div>
        )}
      </div>

      {step === 1 ? (
        <Card className="animate-in fade-in slide-in-from-bottom-4">
          <CardContent className="pt-8 pb-8">
            <div className="max-w-md mx-auto space-y-6 text-center">
              <FolderOpen className="h-16 w-16 text-blue-100 text-blue-600 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-slate-900">Buscar Processo</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Digite o número do processo (CNJ) para realizar a juntada.
                </p>
              </div>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <Input 
                  placeholder="Ex: 1000001-00.2024.8.26.0001" 
                  value={processNumber}
                  onChange={(e) => setProcessNumber(e.target.value)}
                  className="text-center text-lg tracking-wider"
                />
                <Button className="w-full" disabled={!processNumber}>
                  <Search className="mr-2 h-4 w-4" />
                  Localizar Processo
                </Button>
              </form>
              
              <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200 text-left">
                <strong>Dica:</strong> Para fins de teste deste simulador, digite qualquer número.
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          
          {/* Process Header */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-slate-900">1009876-55.2024.8.26.0100</span>
                <Badge variant="success">Ativo</Badge>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                <strong>Ação:</strong> Procedimento Comum Cível &nbsp;|&nbsp; 
                <strong>Vara:</strong> 25ª Vara Cível - Foro Central Cível
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                <strong>Partes:</strong> João da Silva (Reqte) x Construtora Exemplo Ltda (Reqdo)
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              Alterar Processo
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Form Column */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="font-medium text-slate-900">Dados da Petição</h3>
                </div>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Tipo da Petição</label>
                    <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400">
                      <option>Petição Diversa</option>
                      <option>Contestação</option>
                      <option>Réplica</option>
                      <option>Alegações Finais</option>
                      <option>Embargos de Declaração</option>
                      <option>Recurso de Apelação</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700">Categoria (Opcional)</label>
                     <div className="flex gap-2">
                       <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 cursor-pointer hover:bg-slate-200">
                         Manifestação
                       </span>
                       <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 cursor-pointer hover:bg-slate-200">
                         Pedido de Juntada
                       </span>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Teor da Petição (Resumo)</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
                      placeholder="Ex: Requer a juntada de comprovante de pagamento das custas..."
                      value={teor}
                      onChange={(e) => setTeor(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                  <h3 className="font-medium text-slate-900">Anexos</h3>
                  <span className="text-xs text-slate-500">PDF apenas (Max 10MB)</span>
                </div>
                <CardContent className="pt-6 space-y-4">
                  
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium text-slate-700">{file}</span>
                      </div>
                      <Badge variant="success">Carregado</Badge>
                    </div>
                  ))}

                  <div 
                    onClick={handleFileUpload}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 font-medium">Clique para selecionar arquivos</p>
                    <p className="text-xs text-slate-400 mt-1">ou arraste e solte aqui</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Column */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 text-sm mb-2">Resumo do Protocolo</h4>
                <ul className="text-xs text-blue-800 space-y-2">
                  <li className="flex justify-between">
                    <span>Processo:</span>
                    <span className="font-mono">1009876...</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Arquivos:</span>
                    <span>{files.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Tipo:</span>
                    <span>Petição Diversa</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-base" disabled={files.length === 0}>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Protocolar Petição
              </Button>

              <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-100 p-3 rounded">
                <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <p>
                  Este é um ambiente simulado. Ao clicar em protocolar, nenhum documento será enviado ao Tribunal de Justiça.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};