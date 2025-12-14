import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Sparkles, 
  Check, 
  Loader2, 
  AlertCircle, 
  Lightbulb, 
  BookOpen, 
  ExternalLink 
} from 'lucide-react';
import { Button, Input, Textarea, Card, CardContent } from '../components/ui';
import { useStore } from '../store';
import { PetitionDraft, PetitionStatus, Petition, CnjMetadata, JurisprudenceResult } from '../types';
import { generatePetitionDraft, analyzePetitionForCnj, searchJurisprudence } from '../services/aiService';

interface CreatePetitionProps {
  onComplete: () => void;
}

// Reordered steps: Parties first, then Action Type
const STEPS = ['Partes', 'Tipo de Ação', 'Fatos', 'Pedidos', 'Revisão'];

export const CreatePetition: React.FC<CreatePetitionProps> = ({ onComplete }) => {
  const { addPetition } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [savedPetition, setSavedPetition] = useState<Petition | null>(null);
  
  // State for CNJ suggestions & Jurisprudence
  const [cnjSuggestions, setCnjSuggestions] = useState<CnjMetadata | null>(null);
  const [jurisprudence, setJurisprudence] = useState<JurisprudenceResult | null>(null);
  const [isSearchingJurisprudence, setIsSearchingJurisprudence] = useState(false);
  
  const [formData, setFormData] = useState<PetitionDraft>({
    actionType: '',
    plaintiff: '',
    defendant: '',
    facts: '',
    requests: [],
    jurisdiction: ''
  });
  const [requestInput, setRequestInput] = useState('');

  const handleNext = async () => {
    if (currentStep === 3) {
      // Transitioning from Requests (3) to Review (4) -> Trigger AI
      setIsGenerating(true);
      setCurrentStep(curr => curr + 1);
      
      try {
        // 1. Generate Draft
        const draft = await generatePetitionDraft(formData);
        setGeneratedContent(draft);
        
        // 2. Analyze for CNJ Metadata immediately
        const analysis = await analyzePetitionForCnj(draft);
        setCnjSuggestions(analysis);
        
      } catch (error) {
        console.error(error);
        setGeneratedContent("Erro ao gerar a petição. Por favor, tente novamente ou escreva manualmente.");
      } finally {
        setIsGenerating(false);
      }
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleSearchJurisprudence = async () => {
    if (!formData.facts) return;
    
    setIsSearchingJurisprudence(true);
    try {
      const result = await searchJurisprudence(formData.facts, formData.actionType);
      setJurisprudence(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingJurisprudence(false);
    }
  };

  const handleFinish = () => {
    const newPetition: Petition = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.actionType || 'Nova Petição',
      type: cnjSuggestions?.competencia || 'Cível', // Use suggested competency if available
      clientName: formData.plaintiff,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: PetitionStatus.DRAFT,
      content: generatedContent,
      cnjData: cnjSuggestions || undefined, // Save the suggestions
    };
    
    addPetition(newPetition);
    setSavedPetition(newPetition);
  };

  const addRequest = () => {
    if (requestInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requests: [...prev.requests, requestInput]
      }));
      setRequestInput('');
    }
  };

  const renderSuccessScreen = () => (
    <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in-95 duration-300">
      <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Petição Salva com Sucesso!</h2>
      <p className="text-slate-500 text-center max-w-md">
        Sua petição foi salva no histórico. Você pode consultá-la a qualquer momento na sua lista de documentos.
      </p>
      
      <div className="w-full max-w-sm">
        <Button onClick={onComplete} className="w-full bg-slate-900 hover:bg-slate-800">
          Voltar para o Painel
        </Button>
      </div>
    </div>
  );

  if (savedPetition) {
    return renderSuccessScreen();
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Parties
        return (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Qualificação das Partes</h3>
            <p className="text-sm text-slate-500 mb-4">
              Informe quem está processando (Polo Ativo) e quem será processado (Polo Passivo).
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Polo Ativo (Requerente)
                </h4>
                <Input 
                  label="Nome Completo / Razão Social" 
                  placeholder="Ex: João da Silva" 
                  value={formData.plaintiff}
                  onChange={(e) => setFormData({...formData, plaintiff: e.target.value})}
                />
                <p className="text-xs text-slate-500 mt-2">
                  O cliente que você está representando.
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="font-medium text-red-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Polo Passivo (Requerido)
                </h4>
                <Input 
                  label="Nome Completo / Razão Social" 
                  placeholder="Ex: Empresa X LTDA" 
                  value={formData.defendant}
                  onChange={(e) => setFormData({...formData, defendant: e.target.value})}
                />
                 <p className="text-xs text-slate-500 mt-2">
                  A parte contrária no processo.
                </p>
              </div>
            </div>
          </div>
        );
      case 1: // Action Type
        return (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Dados da Ação</h3>
              <Input 
                label="Nome da Ação" 
                placeholder="Ex: Ação de Indenização por Danos Morais, Divórcio..." 
                value={formData.actionType}
                onChange={(e) => setFormData({...formData, actionType: e.target.value})}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2 mt-6">Endereçamento (Competência)</h3>
              <Input 
                label="Comarca/Tribunal" 
                placeholder="Ex: Excelentíssimo Senhor Doutor Juiz de Direito da Vara Cível de..." 
                value={formData.jurisdiction}
                onChange={(e) => setFormData({...formData, jurisdiction: e.target.value})}
              />
            </div>
          </div>
        );
      case 2: // Facts
        return (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-lg font-medium text-slate-900">Dos Fatos</h3>
               <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
                 <Sparkles className="w-3 h-3 mr-1" />
                 Base para IA
               </span>
             </div>
            <p className="text-sm text-slate-500 mb-2">
              Relate o ocorrido envolvendo <strong>{formData.plaintiff || 'o Requerente'}</strong> e <strong>{formData.defendant || 'o Requerido'}</strong>. 
              Nossa IA irá transformar este relato em linguagem jurídica formal.
            </p>
            <Textarea 
              className="min-h-[200px]"
              placeholder="Ex: No dia 10 de janeiro, o Requerente comprou um produto da Requerida que veio com defeito..."
              value={formData.facts}
              onChange={(e) => setFormData({...formData, facts: e.target.value})}
            />
          </div>
        );
      case 3: // Requests
        return (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Dos Pedidos</h3>
            <div className="flex gap-2">
              <Input 
                placeholder="Digite um pedido (ex: Condenação em R$ 10.000,00)" 
                value={requestInput}
                onChange={(e) => setRequestInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addRequest()}
              />
              <Button onClick={addRequest} variant="secondary">Adicionar</Button>
            </div>
            
            <div className="mt-4 space-y-2">
              {formData.requests.map((req, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-md border border-slate-100 flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-slate-700">{req}</span>
                </div>
              ))}
              {formData.requests.length === 0 && (
                <p className="text-sm text-slate-400 italic">Nenhum pedido adicionado ainda.</p>
              )}
            </div>
          </div>
        );
      case 4: // Review & Generate
        if (isGenerating) {
          return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in fade-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-white p-4 rounded-full shadow-lg">
                  <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Gerando Minuta Jurídica...</h3>
              <p className="text-slate-500 text-center max-w-md">
                A IA está analisando os fatos, pesquisando a fundamentação legal aplicável e estruturando sua petição.
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             
             {/* AI Suggestions Panel */}
             {cnjSuggestions && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-5 w-5 text-indigo-600" />
                        <h4 className="font-semibold text-indigo-900 text-sm">Sugestões de Classificação (IA)</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/80 p-2 rounded border border-indigo-100">
                            <span className="text-xs text-indigo-500 uppercase font-bold block">Competência Sugerida</span>
                            <span className="text-sm font-medium text-slate-800">{cnjSuggestions.competencia}</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded border border-indigo-100">
                            <span className="text-xs text-indigo-500 uppercase font-bold block">Classe Processual</span>
                            <span className="text-sm font-medium text-slate-800">{cnjSuggestions.classe}</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded border border-indigo-100">
                            <span className="text-xs text-indigo-500 uppercase font-bold block">Assunto Principal</span>
                            <span className="text-sm font-medium text-slate-800">{cnjSuggestions.assunto}</span>
                        </div>
                    </div>
                </div>
             )}

             {/* Jurisprudence Search */}
             <div className="bg-white border border-slate-200 rounded-md p-4">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <BookOpen className="h-5 w-5 text-blue-600" />
                   <h4 className="font-semibold text-slate-900 text-sm">Jurisprudência Relacionada</h4>
                 </div>
                 <Button 
                   size="sm" 
                   variant="outline"
                   onClick={handleSearchJurisprudence}
                   disabled={isSearchingJurisprudence}
                 >
                   {isSearchingJurisprudence ? (
                     <Loader2 className="h-4 w-4 animate-spin" />
                   ) : (
                     "Buscar Jurisprudência"
                   )}
                 </Button>
               </div>

               {jurisprudence && (
                 <div className="space-y-4 animate-in fade-in">
                    <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded whitespace-pre-line">
                      {jurisprudence.analysis}
                    </div>
                    {jurisprudence.sources.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Fontes encontradas:</p>
                        <ul className="space-y-1">
                          {jurisprudence.sources.map((source, idx) => (
                            <li key={idx} className="text-xs">
                              <a 
                                href={source.uri} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center text-blue-600 hover:underline gap-1"
                              >
                                {source.title} <ExternalLink className="h-3 w-3" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                 </div>
               )}
               {!jurisprudence && !isSearchingJurisprudence && (
                 <p className="text-sm text-slate-500">
                   Clique em "Buscar" para que a IA pesquise julgados semelhantes aos fatos da sua petição.
                 </p>
               )}
             </div>

             <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-800 text-sm font-medium">Revisão Obrigatória</p>
                  <p className="text-yellow-700 text-xs mt-1">
                    O texto abaixo foi gerado por IA. Verifique a qualificação, fatos e fundamentação legal antes de utilizar.
                    Você pode editar livremente o texto abaixo.
                  </p>
                </div>
             </div>
             
             <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <h3 className="text-lg font-bold text-slate-900">Minuta da Petição</h3>
                 <Button 
                   size="sm" 
                   variant="secondary"
                   onClick={() => {
                     setIsGenerating(true);
                     generatePetitionDraft(formData).then(res => {
                       setGeneratedContent(res);
                       setIsGenerating(false);
                     });
                   }}
                 >
                   Regerar com IA
                 </Button>
               </div>
               <Textarea 
                 className="min-h-[500px] font-mono text-sm leading-relaxed p-6"
                 value={generatedContent}
                 onChange={(e) => setGeneratedContent(e.target.value)}
               />
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-slate-900">Nova Petição</h2>
         <span className="text-sm text-slate-500">Passo {currentStep + 1} de {STEPS.length}</span>
      </div>

      {/* Stepper Progress */}
      <div className="relative">
        <div className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-slate-200" aria-hidden="true" />
        <ul className="relative flex justify-between w-full">
          {STEPS.map((step, stepIdx) => (
            <li key={step} className="flex flex-col items-center">
              <div 
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors z-10 ${
                  stepIdx <= currentStep 
                    ? 'border-blue-600 bg-blue-600 text-white' 
                    : 'border-slate-300 bg-white text-slate-400'
                }`}
              >
                {stepIdx < currentStep ? <Check className="h-4 w-4" /> : <span>{stepIdx + 1}</span>}
              </div>
              <span className={`mt-2 text-xs font-medium hidden sm:block ${stepIdx <= currentStep ? 'text-blue-600' : 'text-slate-500'}`}>
                {step}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Card>
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handleBack} 
          disabled={currentStep === 0 || isGenerating}
          icon={ChevronLeft}
        >
          Voltar
        </Button>
        
        {!isGenerating && (
          <Button 
            onClick={handleNext}
            className="w-40"
            disabled={isGenerating}
          >
            {currentStep === STEPS.length - 1 ? (
               <span className="flex items-center">Salvar Petição <Save className="ml-2 h-4 w-4"/></span>
            ) : currentStep === 3 ? (
               <span className="flex items-center">Gerar Minuta <Sparkles className="ml-2 h-4 w-4"/></span>
            ) : (
               <span className="flex items-center">Próximo <ChevronRight className="ml-2 h-4 w-4"/></span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};