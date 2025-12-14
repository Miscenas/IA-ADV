import React, { useState, useEffect } from 'react';
import { Siren, Search, AlertTriangle, BookOpen, Check, Gavel, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Badge } from '../components/ui';

interface Crime {
  id: string;
  artigo: string;
  nome: string;
  penaMin: number; // anos
  penaMax: number; // anos
  legislacao: string;
}

// Base de dados de crimes comuns
const CRIMES_DB: Crime[] = [
  { id: '1', artigo: 'Art. 121, caput', nome: 'Homicídio Simples', penaMin: 6, penaMax: 20, legislacao: 'CP' },
  { id: '2', artigo: 'Art. 121, § 2º', nome: 'Homicídio Qualificado', penaMin: 12, penaMax: 30, legislacao: 'CP' },
  { id: '3', artigo: 'Art. 155, caput', nome: 'Furto', penaMin: 1, penaMax: 4, legislacao: 'CP' },
  { id: '4', artigo: 'Art. 155, § 4º', nome: 'Furto Qualificado', penaMin: 2, penaMax: 8, legislacao: 'CP' },
  { id: '5', artigo: 'Art. 157, caput', nome: 'Roubo', penaMin: 4, penaMax: 10, legislacao: 'CP' },
  { id: '6', artigo: 'Art. 33, caput', nome: 'Tráfico de Drogas', penaMin: 5, penaMax: 15, legislacao: 'Lei 11.343/06' },
  { id: '7', artigo: 'Art. 171, caput', nome: 'Estelionato', penaMin: 1, penaMax: 5, legislacao: 'CP' },
  { id: '8', artigo: 'Art. 129, caput', nome: 'Lesão Corporal', penaMin: 0.25, penaMax: 1, legislacao: 'CP' }, // 3 meses a 1 ano
  { id: '9', artigo: 'Art. 129, § 1º', nome: 'Lesão Corporal Grave', penaMin: 1, penaMax: 5, legislacao: 'CP' },
  { id: '10', artigo: 'Art. 180, caput', nome: 'Receptação', penaMin: 1, penaMax: 4, legislacao: 'CP' },
  { id: '11', artigo: 'Art. 217-A', nome: 'Estupro de Vulnerável', penaMin: 8, penaMax: 15, legislacao: 'CP' },
];

export const CriminalCalculator: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);

  // Dosimetry State
  const [basePenalty, setBasePenalty] = useState<number>(0); // Years
  const [agravantes, setAgravantes] = useState<number>(0); // Quantidade
  const [atenuantes, setAtenuantes] = useState<number>(0); // Quantidade
  const [increaseFraction, setIncreaseFraction] = useState<number>(0); // ex: 0.333 for 1/3
  const [decreaseFraction, setDecreaseFraction] = useState<number>(0); // ex: 0.666 for 2/3

  // Results
  const [phase1Result, setPhase1Result] = useState<number>(0);
  const [phase2Result, setPhase2Result] = useState<number>(0);
  const [finalResult, setFinalResult] = useState<number>(0);
  const [regime, setRegime] = useState<string>('');

  const filteredCrimes = CRIMES_DB.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.artigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedCrime) {
      setBasePenalty(selectedCrime.penaMin);
      calculate(selectedCrime.penaMin, agravantes, atenuantes, increaseFraction, decreaseFraction);
    }
  }, [selectedCrime]);

  const formatYearsToText = (years: number) => {
    const y = Math.floor(years);
    const months = Math.round((years - y) * 12);
    
    let text = "";
    if (y > 0) text += `${y} ano(s)`;
    if (months > 0) text += `${text ? ' e ' : ''}${months} mês(es)`;
    if (!text) text = "0";
    return text;
  };

  const calculate = (
    base: number, 
    agrav: number, 
    aten: number, 
    inc: number, 
    dec: number
  ) => {
    if (!selectedCrime) return;

    // FASE 1: Pena Base
    // Limite legal: não pode passar do máximo nem ser menor que o mínimo (tecnicamente o juiz decide, mas o input limita)
    const p1 = base;
    setPhase1Result(p1);

    // FASE 2: Agravantes e Atenuantes
    // Jurisprudência dominante: Fração de 1/6 para cada circunstância
    const fraction = 1/6;
    const diffCircumstances = agrav - aten;
    let p2 = p1 + (p1 * fraction * diffCircumstances);

    // Súmula 231 STJ: A incidência de circunstância atenuante não pode conduzir à redução da pena abaixo do mínimo legal.
    // Também não se costuma elevar acima do máximo nesta fase.
    if (p2 < selectedCrime.penaMin) p2 = selectedCrime.penaMin;
    if (p2 > selectedCrime.penaMax) p2 = selectedCrime.penaMax;
    
    setPhase2Result(p2);

    // FASE 3: Causas de Aumento e Diminuição
    // Podem romper os limites mínimo e máximo
    let p3 = p2;
    
    // Aplica aumento
    if (inc > 0) {
      p3 = p3 * (1 + inc);
    }
    
    // Aplica diminuição (sobre o resultado já aumentado ou sobre o da fase 2? 
    // O CP diz que aplica-se um sobre o outro se forem sucessivas, aqui simplificamos para aplicar sobre o resultado atual)
    if (dec > 0) {
      p3 = p3 * (1 - dec);
    }

    setFinalResult(p3);

    // Definição de Regime (Art. 33 CP)
    // Regra geral para não reincidentes (simplificação)
    if (p3 > 8) {
      setRegime('FECHADO');
    } else if (p3 > 4) {
      setRegime('SEMIABERTO');
    } else {
      setRegime('ABERTO');
    }
  };

  // Trigger calculation when inputs change
  useEffect(() => {
    if (selectedCrime) {
      calculate(basePenalty, agravantes, atenuantes, increaseFraction, decreaseFraction);
    }
  }, [basePenalty, agravantes, atenuantes, increaseFraction, decreaseFraction]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
                <Siren className="h-6 w-6 text-red-700" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Calculadora Penal</h2>
                <p className="text-slate-500 text-sm">Consulta de penas e simulação de dosimetria (CP Brasileiro).</p>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Selection & Calculator */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Crime Search */}
           <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-base">1. Selecione o Crime / Capitulação</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                 <Input 
                   placeholder="Buscar por nome (ex: Roubo) ou artigo..." 
                   className="pl-9"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>

               {searchTerm && !selectedCrime && (
                 <div className="border border-slate-200 rounded-md max-h-60 overflow-y-auto">
                    {filteredCrimes.length > 0 ? (
                        filteredCrimes.map(crime => (
                            <button
                                key={crime.id}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center"
                                onClick={() => {
                                    setSelectedCrime(crime);
                                    setSearchTerm('');
                                }}
                            >
                                <div>
                                    <p className="font-medium text-slate-900">{crime.nome}</p>
                                    <p className="text-xs text-slate-500">{crime.artigo} - {crime.legislacao}</p>
                                </div>
                                <Badge variant="default">{formatYearsToText(crime.penaMin)} a {formatYearsToText(crime.penaMax)}</Badge>
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center text-slate-500 text-sm">Nenhum crime encontrado.</div>
                    )}
                 </div>
               )}

               {selectedCrime && (
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center animate-in fade-in">
                    <div>
                        <h3 className="font-bold text-blue-900">{selectedCrime.nome}</h3>
                        <p className="text-sm text-blue-700">{selectedCrime.artigo}</p>
                    </div>
                    <div className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCrime(null)} className="text-blue-700 hover:bg-blue-100 h-8">
                            Alterar
                        </Button>
                    </div>
                 </div>
               )}
             </CardContent>
           </Card>

           {selectedCrime && (
             <div className="space-y-6 animate-in slide-in-from-bottom-4">
                {/* 1ª FASE */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-slate-500">1ª Fase - Circunstâncias Judiciais</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span>Pena Base (Art. 59 CP)</span>
                                <span className="font-mono font-bold">{formatYearsToText(basePenalty)}</span>
                            </div>
                            <input 
                                type="range" 
                                min={selectedCrime.penaMin} 
                                max={selectedCrime.penaMax} 
                                step="0.1" 
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                value={basePenalty}
                                onChange={(e) => setBasePenalty(parseFloat(e.target.value))}
                            />
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Min: {selectedCrime.penaMin} anos</span>
                                <span>Max: {selectedCrime.penaMax} anos</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2ª FASE */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-slate-500">2ª Fase - Legais</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Agravantes (Qtd)</label>
                            <Input 
                                type="number" 
                                min="0" 
                                value={agravantes} 
                                onChange={(e) => setAgravantes(parseInt(e.target.value) || 0)} 
                            />
                            <p className="text-xs text-slate-500">Ex: Reincidência, motivo fútil.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Atenuantes (Qtd)</label>
                            <Input 
                                type="number" 
                                min="0" 
                                value={atenuantes} 
                                onChange={(e) => setAtenuantes(parseInt(e.target.value) || 0)} 
                            />
                            <p className="text-xs text-slate-500">Ex: Confissão, menoridade.</p>
                        </div>
                        <div className="col-span-2 bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-200 flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Considerando fração de 1/6 por circunstância. Aplica-se Súmula 231 STJ (não reduz abaixo do mínimo).</span>
                        </div>
                    </CardContent>
                </Card>

                {/* 3ª FASE */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-slate-500">3ª Fase - Causas de Aumento/Diminuição</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Causa de Aumento (Majorante)</label>
                            <select 
                                className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={increaseFraction}
                                onChange={(e) => setIncreaseFraction(parseFloat(e.target.value))}
                            >
                                <option value="0">Nenhuma</option>
                                <option value="0.1666">1/6 (Mínima)</option>
                                <option value="0.3333">1/3 (Ex: Arma de fogo antiga)</option>
                                <option value="0.5">1/2 (Metade)</option>
                                <option value="0.6666">2/3 (Ex: Arma de fogo restrito)</option>
                                <option value="1">Dobro</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Causa de Diminuição (Minorante)</label>
                            <select 
                                className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={decreaseFraction}
                                onChange={(e) => setDecreaseFraction(parseFloat(e.target.value))}
                            >
                                <option value="0">Nenhuma</option>
                                <option value="0.1666">1/6</option>
                                <option value="0.3333">1/3 (Ex: Tentativa mínima)</option>
                                <option value="0.5">1/2 (Metade)</option>
                                <option value="0.6666">2/3 (Ex: Tentativa máxima/Tráfico Privilegiado)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>
             </div>
           )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5">
            {selectedCrime ? (
                <div className="sticky top-6 space-y-4 animate-in slide-in-from-right-4 duration-500">
                    <Card className="bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Gavel className="h-32 w-32" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-slate-200 text-sm uppercase tracking-wider">Pena Definitiva Estimada</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            <div>
                                <span className="text-4xl font-bold tracking-tight text-white block">
                                    {formatYearsToText(finalResult)}
                                </span>
                                <span className="text-sm text-slate-400 mt-1 block">
                                    {finalResult.toFixed(2)} anos (decimal)
                                </span>
                            </div>
                            
                            <div className="border-t border-slate-800 pt-4">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-2">Regime Inicial Sugerido</p>
                                <Badge className={`text-base px-3 py-1 ${
                                    regime === 'FECHADO' ? 'bg-red-900 text-red-100 hover:bg-red-900' :
                                    regime === 'SEMIABERTO' ? 'bg-yellow-900 text-yellow-100 hover:bg-yellow-900' :
                                    'bg-green-900 text-green-100 hover:bg-green-900'
                                }`}>
                                    {regime}
                                </Badge>
                                <p className="text-xs text-slate-500 mt-2 italic">
                                    *Considerando réu primário e circunstâncias favoráveis (Art. 33, § 2º CP).
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2 border-b border-slate-100">
                             <CardTitle className="text-sm font-bold text-slate-700">Memória de Cálculo</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Pena Mínima Legal</span>
                                <span className="font-mono">{formatYearsToText(selectedCrime.penaMin)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Pena Máxima Legal</span>
                                <span className="font-mono">{formatYearsToText(selectedCrime.penaMax)}</span>
                            </div>
                            <div className="h-px bg-slate-100 my-2" />
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-700 font-medium">1ª Fase (Base)</span>
                                <span className="font-mono">{formatYearsToText(phase1Result)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-700 font-medium">2ª Fase (Interm.)</span>
                                <span className="font-mono">{formatYearsToText(phase2Result)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-blue-700">
                                <span>3ª Fase (Final)</span>
                                <span className="font-mono">{formatYearsToText(finalResult)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs text-slate-500 flex gap-2">
                        <Scale className="h-4 w-4 flex-shrink-0" />
                        <p>
                            Esta ferramenta é um simulador para auxílio do advogado e não substitui a sentença judicial. 
                            O cálculo exato depende da subjetividade do magistrado na análise das circunstâncias do Art. 59.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <BookOpen className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Aguardando Seleção</h3>
                    <p className="text-slate-500 max-w-sm mt-2">
                        Pesquise e selecione um crime na lista ao lado para visualizar os limites de pena e simular a dosimetria.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};