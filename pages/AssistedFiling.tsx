import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  Info, 
  Search, 
  UserPlus, 
  UploadCloud, 
  FileText, 
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Input, Button, Card, CardContent } from '../components/ui';
import { useStore } from '../store';
import { analyzePetitionForCnj } from '../services/aiService';

type Tab = 'dados' | 'assuntos' | 'partes' | 'documentos';

export const AssistedFiling: React.FC = () => {
  const { activePetitionForFiling } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('dados');
  
  // State for auto-filling
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form Data
  const [tribunal, setTribunal] = useState('TJSP - Tribunal de Justiça de São Paulo');
  const [comarca, setComarca] = useState('');
  const [competencia, setCompetencia] = useState('');
  const [classe, setClasse] = useState('');
  const [valorCausa, setValorCausa] = useState('');
  const [partes, setPartes] = useState<{ativo: string[], passivo: string[]}>({ ativo: [], passivo: [] });

  const [assuntos, setAssuntos] = useState<string[]>([]);
  const [assuntoInput, setAssuntoInput] = useState('');

  // Effect to load data from active petition
  useEffect(() => {
    const loadPetitionData = async () => {
      if (activePetitionForFiling && activePetitionForFiling.content) {
        setIsAnalyzing(true);
        try {
          // Pre-fill parts immediately from metadata if available (client name)
          setPartes(prev => ({
            ...prev,
            ativo: [activePetitionForFiling.clientName]
          }));

          // Ask AI to analyze the text and extract CNJ data
          const cnjData = await analyzePetitionForCnj(activePetitionForFiling.content);
          
          if (cnjData) {
            setClasse(`${cnjData.classe} (Cód: ${cnjData.codigoClasse})`);
            setAssuntos([`${cnjData.assunto} (Cód: ${cnjData.codigoAssunto})`]);
            setValorCausa(cnjData.valorCausa || '');
            // Attempt to parse jurisdiction/comarca from the text could be added here
            setCompetencia(cnjData.classe.includes("Família") ? "Família e Sucessões" : "Cível");
          }
        } catch (error) {
          console.error("Erro ao analisar petição:", error);
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    loadPetitionData();
  }, [activePetitionForFiling]);

  const handleAddAssunto = () => {
    if (assuntoInput) {
      setAssuntos([...assuntos, `[DIREITO CIVIL] ${assuntoInput} (Cód. CNJ: ${Math.floor(Math.random() * 9000) + 1000})`]);
      setAssuntoInput('');
    }
  };

  const tabs = [
    { id: 'dados', label: '1. Dados Iniciais' },
    { id: 'assuntos', label: '2. Assuntos' },
    { id: 'partes', label: '3. Partes' },
    { id: 'documentos', label: '4. Documentos' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Simulation Banner */}
      <div className="bg-orange-50 border-l-4 border-orange-400 p-4 shadow-sm flex items-start gap-3 justify-between">
        <div className="flex gap-3">
            <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
            <h4 className="font-bold text-orange-800 text-sm">Modo de Simulação (eproc TJSP)</h4>
            <p className="text-sm text-orange-700 mt-1">
                Esta tela emula o fluxo de protocolo. 
                {activePetitionForFiling && <span className="font-semibold block mt-1">Petição em análise: {activePetitionForFiling.title}</span>}
            </p>
            </div>
        </div>
        {isAnalyzing && (
            <div className="flex items-center text-orange-700 text-xs bg-orange-100 px-3 py-1 rounded-full animate-pulse">
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Preenchendo automaticamente com IA...
            </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Nova Ação (Simulador)</h2>
        <div className="flex items-center gap-2">
            <a 
                href="https://www.cnj.jus.br/sgt/consulta_publica_classes.php" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
            >
                Consultar Tabela CNJ (SGT) <ExternalLink className="h-3 w-3"/>
            </a>
            <div className="text-xs font-mono bg-slate-100 px-3 py-1 rounded text-slate-500">
            Ref: eproc-TJSP-v2
            </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        
        {/* TAB 1: DADOS INICIAIS */}
        {activeTab === 'dados' && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardContent className="pt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <label className="block text-sm font-semibold text-slate-700">Seção Judiciária / Tribunal</label>
                   <select 
                     className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     value={tribunal}
                     onChange={(e) => setTribunal(e.target.value)}
                   >
                      <option>TJSP - Tribunal de Justiça de São Paulo</option>
                      <option>TRF3 - Tribunal Regional Federal da 3ª Região</option>
                   </select>

                   <label className="block text-sm font-semibold text-slate-700">Comarca</label>
                   <select 
                     className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     value={comarca}
                     onChange={(e) => setComarca(e.target.value)}
                   >
                      <option value="">Selecione...</option>
                      <option>São Paulo - Foro Central Cível</option>
                      <option>Campinas</option>
                      <option>Santos</option>
                   </select>

                   <Input 
                        label="Competência" 
                        placeholder="Ex: Cível, Família e Sucessões" 
                        value={competencia}
                        onChange={(e) => setCompetencia(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between">
                       <label className="block text-sm font-semibold text-slate-700">Classe Processual</label>
                       {activePetitionForFiling && (
                           <span className="text-xs text-blue-600 flex items-center">
                               <Sparkles className="h-3 w-3 mr-1"/> Sugerido por IA
                           </span>
                       )}
                   </div>
                   <div className="flex gap-2">
                      <Input 
                        placeholder="Digite o código ou nome da classe" 
                        className="flex-1"
                        value={classe}
                        onChange={(e) => setClasse(e.target.value)}
                      />
                      <Button variant="secondary" icon={Search} className="w-12 p-0" />
                   </div>
                   
                   <label className="block text-sm font-semibold text-slate-700">Valor da Causa</label>
                   <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 text-sm"></span>
                      <input 
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white pl-3 pr-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-slate-400 outline-none font-medium" 
                        placeholder="R$ 0,00" 
                        value={valorCausa}
                        onChange={(e) => setValorCausa(e.target.value)}
                      />
                   </div>
                   
                   <div className="flex items-center space-x-2 mt-4">
                      <input type="checkbox" id="jg" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                      <label htmlFor="jg" className="text-sm text-slate-700">Requer Justiça Gratuita?</label>
                   </div>
                   <div className="flex items-center space-x-2">
                      <input type="checkbox" id="liminar" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                      <label htmlFor="liminar" className="text-sm text-slate-700">Pedido de Liminar / Tutela de Urgência?</label>
                   </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button onClick={() => setActiveTab('assuntos')}>Próximo: Assuntos</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: ASSUNTOS */}
        {activeTab === 'assuntos' && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardContent className="pt-6 space-y-6">
               <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700">Pesquisar Assunto (Tabela CNJ)</label>
                    <a href="https://www.cnj.jus.br/sgt/consulta_publica_classes.php" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Ver Tabela Completa</a>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ex: Danos Morais, Inclusão Indevida em Cadastro de Inadimplentes..." 
                      value={assuntoInput}
                      onChange={(e) => setAssuntoInput(e.target.value)}
                    />
                    <Button onClick={handleAddAssunto} icon={Search}>Adicionar</Button>
                  </div>
               </div>

               <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Assuntos Selecionados</h4>
                  {assuntos.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                       <p className="text-slate-400 text-sm">Nenhum assunto selecionado.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-100">
                      {assuntos.map((assunto, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                             <span className="text-sm text-slate-700 font-medium">{assunto}</span>
                           </div>
                           <button 
                             onClick={() => setAssuntos(assuntos.filter((_, i) => i !== idx))}
                             className="text-red-500 hover:bg-red-50 p-1 rounded"
                           >
                             <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>

               <div className="flex justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setActiveTab('dados')}>Voltar</Button>
                <Button onClick={() => setActiveTab('partes')}>Próximo: Partes</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: PARTES */}
        {activeTab === 'partes' && (
           <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <CardContent className="pt-6 space-y-6">
                
                {/* Polo Ativo */}
                <div>
                   <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-blue-800 uppercase flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-600 rounded-sm"></span>
                        Polo Ativo (Autor)
                      </h4>
                      <Button size="sm" variant="outline" icon={UserPlus}>Adicionar Parte</Button>
                   </div>
                   <div className="border border-slate-200 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nome / Razão Social</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">CPF / CNPJ</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Advogado</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                           {partes.ativo.length > 0 ? partes.ativo.map((p, i) => (
                             <tr key={i}>
                                <td className="px-4 py-3 text-sm text-slate-900">{p}</td>
                                <td className="px-4 py-3 text-sm text-slate-500">123.456.789-00</td>
                                <td className="px-4 py-3 text-sm text-slate-500">Dr. Roberto Almeida</td>
                             </tr>
                           )) : (
                             <tr>
                                <td className="px-4 py-3 text-sm text-slate-900">João da Silva (Exemplo)</td>
                                <td className="px-4 py-3 text-sm text-slate-500">123.456.789-00</td>
                                <td className="px-4 py-3 text-sm text-slate-500">Dr. Roberto Almeida</td>
                             </tr>
                           )}
                        </tbody>
                      </table>
                   </div>
                </div>

                {/* Polo Passivo */}
                <div>
                   <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-red-800 uppercase flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-600 rounded-sm"></span>
                        Polo Passivo (Réu)
                      </h4>
                      <Button size="sm" variant="outline" icon={UserPlus}>Adicionar Parte</Button>
                   </div>
                   <div className="border border-slate-200 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nome / Razão Social</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">CPF / CNPJ</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                           <tr>
                             <td className="px-4 py-3 text-sm text-slate-400 italic" colSpan={2}>Nenhum réu adicionado</td>
                           </tr>
                        </tbody>
                      </table>
                   </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setActiveTab('assuntos')}>Voltar</Button>
                  <Button onClick={() => setActiveTab('documentos')}>Próximo: Documentos</Button>
                </div>
             </CardContent>
           </Card>
        )}

        {/* TAB 4: DOCUMENTOS */}
        {activeTab === 'documentos' && (
           <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <CardContent className="pt-6 space-y-6">
                
                <div className="space-y-4">
                   <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 text-center hover:bg-slate-100 transition-colors cursor-pointer group">
                      <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-2 group-hover:text-blue-500" />
                      <h3 className="text-sm font-medium text-slate-900">Arraste seus arquivos PDF aqui</h3>
                      <p className="text-xs text-slate-500 mt-1">Tamanho máximo: 10MB por arquivo. Apenas PDF.</p>
                   </div>

                   <h4 className="font-semibold text-slate-800 text-sm mt-6">Arquivos Anexados (Simulação)</h4>
                   <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md shadow-sm">
                         <div className="flex items-center gap-3">
                           <FileText className="h-5 w-5 text-red-500" />
                           <div>
                             <p className="text-sm font-medium text-slate-900">
                                {activePetitionForFiling ? 'Peticao_Gerada_IA.pdf' : 'Peticao_Inicial_Assinada.pdf'}
                             </p>
                             <p className="text-xs text-slate-500">Petição Inicial • 2.4 MB</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-xs font-medium text-green-600 flex items-center bg-green-50 px-2 py-1 rounded">
                             <CheckCircle2 className="h-3 w-3 mr-1" /> Assinado
                           </span>
                           <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Excluir</Button>
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md shadow-sm">
                         <div className="flex items-center gap-3">
                           <FileText className="h-5 w-5 text-red-500" />
                           <div>
                             <p className="text-sm font-medium text-slate-900">Procuracao.pdf</p>
                             <p className="text-xs text-slate-500">Procuração • 1.1 MB</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-xs font-medium text-slate-500 flex items-center bg-slate-100 px-2 py-1 rounded">
                             Pendente Assinatura
                           </span>
                           <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Excluir</Button>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setActiveTab('partes')}>Voltar</Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Simular Protocolo
                  </Button>
                </div>
             </CardContent>
           </Card>
        )}

      </div>
    </div>
  );
};