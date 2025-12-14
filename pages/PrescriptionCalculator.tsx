import React, { useState } from 'react';
import { Hourglass, Calendar, AlertCircle, Calculator, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Badge } from '../components/ui';

type Tab = 'penal' | 'civil';

export const PrescriptionCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('penal');

  // --- STATE PENAL ---
  const [maxPenalty, setMaxPenalty] = useState(''); // Anos
  const [startDatePenal, setStartDatePenal] = useState('');
  const [isReducedAge, setIsReducedAge] = useState(false); // Réu < 21 ou > 70
  const [penalResult, setPenalResult] = useState<{ years: number; date: string; isPrescribed: boolean } | null>(null);

  // --- STATE CIVIL ---
  const [civilType, setCivilType] = useState('10'); // Anos (Regra Geral)
  const [startDateCivil, setStartDateCivil] = useState('');
  const [civilResult, setCivilResult] = useState<{ date: string; isPrescribed: boolean } | null>(null);

  // --- LOGIC PENAL ---
  // Art. 109 CP
  const calculatePenal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maxPenalty || !startDatePenal) return;

    const penalty = parseFloat(maxPenalty);
    let prescriptionTime = 0;

    if (penalty >= 12) {
      prescriptionTime = 20;
    } else if (penalty >= 8) {
      prescriptionTime = 16;
    } else if (penalty >= 4) {
      prescriptionTime = 12;
    } else if (penalty >= 2) {
      prescriptionTime = 8;
    } else if (penalty >= 1) {
      prescriptionTime = 4;
    } else {
      prescriptionTime = 3;
    }

    // Art. 115 CP - Redução pela metade
    if (isReducedAge) {
      prescriptionTime = prescriptionTime / 2;
    }

    const start = new Date(startDatePenal);
    // Adicionar anos à data
    const prescDate = new Date(start);
    prescDate.setFullYear(prescDate.getFullYear() + prescriptionTime);

    const today = new Date();
    const isPrescribed = today >= prescDate;

    setPenalResult({
      years: prescriptionTime,
      date: prescDate.toLocaleDateString('pt-BR'),
      isPrescribed
    });
  };

  // --- LOGIC CIVIL ---
  const calculateCivil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDateCivil) return;

    const years = parseInt(civilType);
    const start = new Date(startDateCivil);
    const prescDate = new Date(start);
    prescDate.setFullYear(prescDate.getFullYear() + years);

    const today = new Date();
    const isPrescribed = today >= prescDate;

    setCivilResult({
      date: prescDate.toLocaleDateString('pt-BR'),
      isPrescribed
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Hourglass className="h-6 w-6 text-purple-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Calculadora de Prescrição</h2>
          <p className="text-slate-500 text-sm">Estime prazos prescricionais penais (CP) e cíveis (CC).</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('penal')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'penal' 
              ? 'border-purple-600 text-purple-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Prescrição Penal (Art. 109 CP)
        </button>
        <button
          onClick={() => setActiveTab('civil')}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'civil' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Prescrição Cível (CC)
        </button>
      </div>

      {activeTab === 'penal' ? (
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-slate-800">Dados do Crime</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={calculatePenal} className="space-y-4">
                <Input
                  label="Pena Máxima em Abstrato (Anos)"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 4 (para pena de 1 a 4 anos)"
                  value={maxPenalty}
                  onChange={(e) => setMaxPenalty(e.target.value)}
                  required
                />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Data do Fato ou Interrupção</label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    value={startDatePenal}
                    onChange={(e) => setStartDatePenal(e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Insira a data do crime ou da última causa interruptiva (ex: Recebimento da Denúncia).
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex items-center gap-3">
                   <input 
                      type="checkbox" 
                      id="ageCheck"
                      className="h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      checked={isReducedAge}
                      onChange={(e) => setIsReducedAge(e.target.checked)}
                   />
                   <label htmlFor="ageCheck" className="text-sm text-slate-700 cursor-pointer select-none">
                      <span className="font-medium block">Redução de Prazo (Art. 115 CP)</span>
                      <span className="text-xs text-slate-500">Réu menor de 21 anos na data do fato ou maior de 70 na sentença.</span>
                   </label>
                </div>

                <Button className="w-full bg-purple-700 hover:bg-purple-800">
                  <Calculator className="mr-2 h-4 w-4" /> Calcular Prescrição
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
              <CardTitle className="text-base text-slate-800">Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              {penalResult ? (
                <div className="space-y-6">
                  <div className={`p-4 rounded-lg border text-center ${
                    penalResult.isPrescribed 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    {penalResult.isPrescribed ? (
                       <>
                         <div className="flex justify-center mb-2">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                         </div>
                         <h3 className="text-lg font-bold text-red-800">PRESCRIÇÃO OCORRIDA</h3>
                         <p className="text-sm text-red-600 mt-1">O Estado perdeu o direito de punir.</p>
                       </>
                    ) : (
                       <>
                         <div className="flex justify-center mb-2">
                            <Calendar className="h-8 w-8 text-green-600" />
                         </div>
                         <h3 className="text-lg font-bold text-green-800">NÃO PRESCRITO</h3>
                         <p className="text-sm text-green-600 mt-1">O prazo ainda está correndo.</p>
                       </>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-600 text-sm">Prazo Prescricional (Art. 109)</span>
                      <span className="font-mono font-bold text-slate-900">{penalResult.years} anos</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-600 text-sm">Data Fatal</span>
                      <span className="font-mono font-bold text-slate-900">{penalResult.date}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-500">
                    <p className="flex gap-2">
                      <Info className="h-4 w-4 flex-shrink-0" />
                      <span>
                        Este cálculo considera a pena máxima em abstrato (PPP). 
                        Se já houver sentença condenatória, deve-se usar a pena em concreto (PPE) e verificar prescrição retroativa/intercorrente.
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-8">
                  <Hourglass className="h-12 w-12 mb-2 opacity-20" />
                  <p>Preencha os dados ao lado para calcular.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
           <Card>
            <CardHeader>
              <CardTitle className="text-base text-slate-800">Natureza da Obrigação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={calculateCivil} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Tipo de Ação / Dívida</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    value={civilType}
                    onChange={(e) => setCivilType(e.target.value)}
                  >
                    <option value="10">Regra Geral (10 anos - Art. 205)</option>
                    <option value="5">Cobrança de Dívidas Líquidas (5 anos - Art. 206 §5º)</option>
                    <option value="5">Honorários Profissionais (5 anos - Art. 206 §5º)</option>
                    <option value="3">Reparação Civil / Danos (3 anos - Art. 206 §3º)</option>
                    <option value="3">Aluguéis (3 anos - Art. 206 §3º)</option>
                    <option value="3">Enriquecimento sem Causa (3 anos - Art. 206 §3º)</option>
                    <option value="2">Pensão Alimentícia (2 anos - Art. 206 §2º)</option>
                    <option value="1">Seguro (1 ano - Art. 206 §1º)</option>
                    <option value="1">Hospedagem (1 ano - Art. 206 §1º)</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Termo Inicial (Data de Início)</label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    value={startDateCivil}
                    onChange={(e) => setStartDateCivil(e.target.value)}
                    required
                  />
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Calculator className="mr-2 h-4 w-4" /> Calcular Prazo
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
              <CardTitle className="text-base text-slate-800">Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              {civilResult ? (
                <div className="space-y-6">
                  <div className={`p-4 rounded-lg border text-center ${
                    civilResult.isPrescribed 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    {civilResult.isPrescribed ? (
                       <>
                         <div className="flex justify-center mb-2">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                         </div>
                         <h3 className="text-lg font-bold text-red-800">DÍVIDA/DIREITO PRESCRITO</h3>
                       </>
                    ) : (
                       <>
                         <div className="flex justify-center mb-2">
                            <Calendar className="h-8 w-8 text-green-600" />
                         </div>
                         <h3 className="text-lg font-bold text-green-800">PRAZO VIGENTE</h3>
                       </>
                    )}
                  </div>

                  <div className="space-y-3">
                     <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-600 text-sm">Prazo Aplicável</span>
                      <span className="font-mono font-bold text-slate-900">{civilType} anos</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-600 text-sm">Data Limite</span>
                      <span className="font-mono font-bold text-slate-900">{civilResult.date}</span>
                    </div>
                  </div>
                  
                   <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-500">
                    <p className="flex gap-2">
                      <Info className="h-4 w-4 flex-shrink-0" />
                      <span>
                        Certifique-se de que não houve causas de impedimento, suspensão ou interrupção do prazo (Arts. 197 a 204 do Código Civil).
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-8">
                  <Hourglass className="h-12 w-12 mb-2 opacity-20" />
                  <p>Informe o tipo de dívida para calcular.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};