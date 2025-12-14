import React, { useState } from 'react';
import { Calculator, DollarSign, Calendar, Info, RefreshCw, Printer, User, Wallet, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Badge } from '../components/ui';

interface CalculationResult {
  // Proventos
  saldoSalario: number;
  avisoPrevio: number;
  decimoTerceiro: number;
  feriasProporcionais: number;
  tercoFerias: number;
  feriasVencidas: number;
  tercoFeriasVencidas: number;
  multaFgts: number;
  
  // Descontos
  inss: number;
  irrf: number;
  
  // Totais
  totalBruto: number;
  totalDescontos: number;
  totalLiquido: number;
  
  tempoServico: { anos: number; meses: number; dias: number };
}

export const LaborCalculator: React.FC = () => {
  const [admissionDate, setAdmissionDate] = useState('');
  const [demissionDate, setDemissionDate] = useState('');
  const [salary, setSalary] = useState('');
  const [dependents, setDependents] = useState('0');
  const [fgtsBalance, setFgtsBalance] = useState('');
  const [reason, setReason] = useState('sem_justa_causa');
  const [hasExpiredVacation, setHasExpiredVacation] = useState(false); // New state for Overdue Vacation
  const [result, setResult] = useState<CalculationResult | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Tabela Progressiva INSS 2024
  const calculateINSS = (baseSalary: number): number => {
    let discount = 0;
    
    if (baseSalary <= 1412.00) {
      discount = baseSalary * 0.075;
    } else if (baseSalary <= 2666.68) {
      discount = (1412.00 * 0.075) + ((baseSalary - 1412.00) * 0.09);
    } else if (baseSalary <= 4000.03) {
      discount = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((baseSalary - 2666.68) * 0.12);
    } else if (baseSalary <= 7786.02) {
      discount = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((baseSalary - 4000.03) * 0.14);
    } else {
      // Teto
      discount = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((7786.02 - 4000.03) * 0.14);
    }
    
    return discount;
  };

  // Tabela IRRF (Simplificada vigente)
  const calculateIRRF = (baseCalc: number, numberOfDependents: number): number => {
    const deductionPerDependent = 189.59;
    const base = baseCalc - (numberOfDependents * deductionPerDependent);
    
    let tax = 0;
    let deduction = 0;

    if (base <= 2259.20) {
      return 0;
    } else if (base <= 2826.65) {
      tax = 0.075;
      deduction = 169.44;
    } else if (base <= 3751.05) {
      tax = 0.15;
      deduction = 381.44;
    } else if (base <= 4664.68) {
      tax = 0.225;
      deduction = 662.77;
    } else {
      tax = 0.275;
      deduction = 896.00;
    }

    const irrf = (base * tax) - deduction;
    return irrf > 0 ? irrf : 0;
  };

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionDate || !demissionDate || !salary) return;

    const start = new Date(admissionDate);
    const end = new Date(demissionDate);
    const bruto = parseFloat(salary.replace(/\./g, '').replace(',', '.'));
    const numDependents = parseInt(dependents) || 0;
    const exactFgts = fgtsBalance ? parseFloat(fgtsBalance.replace(/\./g, '').replace(',', '.')) : 0;

    if (end < start) {
      alert("A data de demissão deve ser posterior à data de admissão.");
      return;
    }

    // 1. Tempo de Serviço
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = (totalDays % 365) % 30;

    // 2. Saldo de Salário
    const daysInLastMonth = end.getDate();
    const saldoSalario = (bruto / 30) * daysInLastMonth;

    // 3. Aviso Prévio (Lei 12.506/11)
    let diasAviso = 30 + (years * 3);
    if (diasAviso > 90) diasAviso = 90;
    
    let avisoPrevio = 0;
    if (reason === 'sem_justa_causa') {
      avisoPrevio = (bruto / 30) * diasAviso;
    }

    // 4. Décimo Terceiro Proporcional
    const startYear = new Date(end.getFullYear(), 0, 1);
    let monthsFor13th = end.getMonth(); 
    if (end.getDate() >= 15) monthsFor13th += 1;
    const decimoTerceiro = (bruto / 12) * monthsFor13th;

    // 5. Férias Proporcionais + 1/3
    const anniversary = new Date(admissionDate);
    anniversary.setFullYear(end.getFullYear());
    if (anniversary > end) anniversary.setFullYear(end.getFullYear() - 1);
    
    let monthsForVacation = (end.getFullYear() - anniversary.getFullYear()) * 12 + (end.getMonth() - anniversary.getMonth());
    if (end.getDate() >= 15) monthsForVacation += 1; 
    if (monthsForVacation > 12) monthsForVacation = 12;

    let feriasProporcionais = (bruto / 12) * monthsForVacation;
    if (reason === 'justa_causa') feriasProporcionais = 0;

    const tercoFerias = feriasProporcionais / 3;

    // 6. Férias Vencidas (Novo)
    let feriasVencidas = 0;
    let tercoFeriasVencidas = 0;
    
    if (hasExpiredVacation && reason !== 'justa_causa') {
        feriasVencidas = bruto;
        tercoFeriasVencidas = bruto / 3;
    }

    // 7. Multa FGTS (40%)
    let multaFgts = 0;
    if (reason === 'sem_justa_causa') {
      if (exactFgts > 0) {
        // Use exact balance if provided
        multaFgts = exactFgts * 0.40;
      } else {
        // Estimate based on time
        const totalMonthsWorked = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        const estimatedBalance = (bruto * 0.08) * totalMonthsWorked;
        multaFgts = estimatedBalance * 0.40;
      }
    }

    // --- CÁLCULO DE DESCONTOS (Estimativa) ---
    
    // INSS (Incide sobre Saldo Salário e 13º)
    // Aviso prévio, Férias Indenizadas e Férias Vencidas na rescisão geralmente são isentos.
    const inssSaldoSalario = calculateINSS(saldoSalario);
    const inss13 = calculateINSS(decimoTerceiro);
    const totalInss = inssSaldoSalario + inss13;

    // IRRF
    // Base Salário = Saldo Salário - INSS Saldo - (Deps * 189.59)
    const baseIrrfSalario = saldoSalario - inssSaldoSalario;
    const irrfSalario = calculateIRRF(baseIrrfSalario, numDependents);

    // Base 13º = 13º - INSS 13º - (Deps * 189.59)
    const baseIrrf13 = decimoTerceiro - inss13;
    const irrf13 = calculateIRRF(baseIrrf13, numDependents);

    const totalIrrf = irrfSalario + irrf13;

    const totalBruto = saldoSalario + avisoPrevio + decimoTerceiro + feriasProporcionais + tercoFerias + feriasVencidas + tercoFeriasVencidas + multaFgts;
    const totalDescontos = totalInss + totalIrrf;
    const totalLiquido = totalBruto - totalDescontos;

    setResult({
      saldoSalario,
      avisoPrevio,
      decimoTerceiro,
      feriasProporcionais,
      tercoFerias,
      feriasVencidas,
      tercoFeriasVencidas,
      multaFgts,
      inss: totalInss,
      irrf: totalIrrf,
      totalBruto,
      totalDescontos,
      totalLiquido,
      tempoServico: { anos: years, meses: months, dias: days }
    });
  };

  const reset = () => {
    setAdmissionDate('');
    setDemissionDate('');
    setSalary('');
    setReason('sem_justa_causa');
    setDependents('0');
    setFgtsBalance('');
    setHasExpiredVacation(false);
    setResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Calculator className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Calculadora de Rescisão</h2>
          <p className="text-slate-500 text-sm">Estime os valores de verbas rescisórias trabalhistas (CLT), incluindo descontos de INSS e IRRF.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados do Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={calculate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Data de Admissão</label>
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      value={admissionDate}
                      onChange={(e) => setAdmissionDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Data de Demissão</label>
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      value={demissionDate}
                      onChange={(e) => setDemissionDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Input
                  label="Último Salário Bruto (R$)"
                  placeholder="Ex: 2500.00"
                  type="number"
                  step="0.01"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Dependentes (IRRF)"
                        placeholder="Qtd."
                        type="number"
                        min="0"
                        value={dependents}
                        onChange={(e) => setDependents(e.target.value)}
                        icon={User}
                    />
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                             FGTS Saldo <span className="text-slate-400 font-normal">(Opcional)</span>
                        </label>
                        <div className="relative">
                             <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                placeholder="0,00"
                                type="number"
                                step="0.01"
                                value={fgtsBalance}
                                onChange={(e) => setFgtsBalance(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Motivo da Rescisão</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="sem_justa_causa">Dispensa sem Justa Causa</option>
                    <option value="pedido_demissao">Pedido de Demissão</option>
                    <option value="justa_causa">Dispensa por Justa Causa</option>
                    <option value="acordo">Acordo (Reforma Trabalhista)</option>
                  </select>
                </div>

                {/* Overdue Vacation Toggle */}
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex items-center gap-3">
                   <input 
                      type="checkbox" 
                      id="vacationCheck"
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={hasExpiredVacation}
                      onChange={(e) => setHasExpiredVacation(e.target.checked)}
                   />
                   <label htmlFor="vacationCheck" className="text-sm text-slate-700 cursor-pointer select-none flex-1">
                      <span className="font-medium block">Possui Férias Vencidas?</span>
                      <span className="text-xs text-slate-500">Adicionar 1 salário integral + 1/3</span>
                   </label>
                   <CalendarCheck className="h-5 w-5 text-slate-400" />
                </div>

                <div className="pt-2 flex gap-3">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Calculator className="mr-2 h-4 w-4" /> Calcular
                  </Button>
                  <Button type="button" variant="outline" onClick={reset}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <Info className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <p className="text-xs text-yellow-800 leading-relaxed">
              <strong>Atenção:</strong> Cálculo estimativo baseado nas regras gerais da CLT e tabelas de 2024. 
              As férias e aviso prévio indenizados, assim como férias vencidas pagas na rescisão, são considerados isentos de INSS/IRRF neste simulador (regra geral indenizatória).
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              {/* Summary Card */}
              <Card className="bg-slate-900 text-white border-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Total Líquido Estimado</p>
                    <h3 className="text-4xl font-bold text-green-400">{formatCurrency(result.totalLiquido)}</h3>
                    <div className="flex justify-center gap-2 mt-4 flex-wrap">
                      <Badge variant="warning">
                        Tempo de Casa: {result.tempoServico.anos} anos e {result.tempoServico.meses} meses
                      </Badge>
                      {hasExpiredVacation && <Badge variant="warning">Com Férias Vencidas</Badge>}
                      {fgtsBalance && <Badge variant="default">Multa s/ saldo exato</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Details */}
              <Card>
                <CardHeader className="border-b border-slate-100 pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Detalhamento da Rescisão</CardTitle>
                    <Button size="sm" variant="ghost" icon={Printer} onClick={() => window.print()}>Imprimir</Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-slate-100">
                    {/* Earnings */}
                    <div className="py-2 bg-slate-50/50 px-2 -mx-2 mt-2 rounded">
                        <span className="text-xs font-bold text-slate-500 uppercase">Proventos (+)</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-slate-600 text-sm">Saldo de Salário</span>
                      <span className="font-mono font-medium text-slate-900">{formatCurrency(result.saldoSalario)}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-slate-600 text-sm">Aviso Prévio Indenizado</span>
                      <span className="font-mono font-medium text-slate-900">{formatCurrency(result.avisoPrevio)}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-slate-600 text-sm">13º Salário Proporcional</span>
                      <span className="font-mono font-medium text-slate-900">{formatCurrency(result.decimoTerceiro)}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-slate-600 text-sm">Férias Proporcionais</span>
                      <span className="font-mono font-medium text-slate-900">{formatCurrency(result.feriasProporcionais)}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-slate-600 text-sm">1/3 sobre Férias Prop.</span>
                      <span className="font-mono font-medium text-slate-900">{formatCurrency(result.tercoFerias)}</span>
                    </div>
                    
                    {/* Férias Vencidas Rows */}
                    {result.feriasVencidas > 0 && (
                      <>
                        <div className="py-3 flex justify-between items-center bg-yellow-50/50 -mx-2 px-2">
                          <span className="text-slate-700 text-sm font-medium">Férias Vencidas (1 ano)</span>
                          <span className="font-mono font-medium text-slate-900">{formatCurrency(result.feriasVencidas)}</span>
                        </div>
                        <div className="py-3 flex justify-between items-center bg-yellow-50/50 -mx-2 px-2">
                          <span className="text-slate-700 text-sm font-medium">1/3 sobre Férias Vencidas</span>
                          <span className="font-mono font-medium text-slate-900">{formatCurrency(result.tercoFeriasVencidas)}</span>
                        </div>
                      </>
                    )}

                     <div className="py-3 flex justify-between items-center">
                      <span className="text-slate-600 text-sm">Multa FGTS (40%)</span>
                      <span className="font-mono font-medium text-slate-900">{formatCurrency(result.multaFgts)}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center bg-green-50/30">
                        <span className="text-sm font-semibold text-slate-700">Total Bruto</span>
                        <span className="font-mono font-bold text-green-700">{formatCurrency(result.totalBruto)}</span>
                    </div>

                    {/* Deductions */}
                    <div className="py-2 bg-slate-50/50 px-2 -mx-2 mt-2 rounded">
                        <span className="text-xs font-bold text-slate-500 uppercase">Descontos Estimados (-)</span>
                    </div>
                    <div className="py-3 flex justify-between items-center text-red-700">
                      <span className="text-sm">INSS (Salário + 13º)</span>
                      <span className="font-mono font-medium"> - {formatCurrency(result.inss)}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center text-red-700">
                      <span className="text-sm">IRRF (Salário + 13º)</span>
                      <span className="font-mono font-medium"> - {formatCurrency(result.irrf)}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center bg-red-50/30">
                        <span className="text-sm font-semibold text-slate-700">Total Descontos</span>
                        <span className="font-mono font-bold text-red-700"> - {formatCurrency(result.totalDescontos)}</span>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <DollarSign className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Aguardando Cálculo</h3>
              <p className="text-slate-500 max-w-sm mt-2">
                Preencha os dados do contrato, dependentes e FGTS ao lado para visualizar o valor líquido da rescisão.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};