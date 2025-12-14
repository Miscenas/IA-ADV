import React, { useState } from 'react';
import { 
  CalendarDays, 
  Bell, 
  Plus, 
  AlertCircle,
  AlertTriangle,
  Clock, 
  CheckCircle2, 
  Trash2, 
  CalendarCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Badge } from '../components/ui';
import { useStore } from '../store';
import { LegalDeadline } from '../types';

export const LegalCalendar: React.FC = () => {
  const { deadlines, addDeadline, toggleDeadline, removeDeadline } = useStore();
  
  // Form State
  const [processNumber, setProcessNumber] = useState('');
  const [description, setDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [notifyDays, setNotifyDays] = useState('3');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processNumber || !deadlineDate || !description) return;

    const newDeadline: LegalDeadline = {
      id: Math.random().toString(36).substr(2, 9),
      processNumber,
      description,
      deadlineDate,
      notifyDaysBefore: parseInt(notifyDays),
      isCompleted: false
    };

    addDeadline(newDeadline);
    
    // Reset form
    setProcessNumber('');
    setDescription('');
    setDeadlineDate('');
    setNotifyDays('3');
  };

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dateStr);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const sortedDeadlines = [...deadlines].sort((a, b) => {
    // Sort logic: Pending first, then by date (closest first)
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Controle de Prazos</h2>
          <p className="text-slate-500 mt-1">Gerencie prazos processuais e configure lembretes automáticos.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Add New Deadline */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="flex items-center text-slate-800">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                Novo Prazo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Número do Processo"
                  placeholder="Ex: 1009876-55..."
                  value={processNumber}
                  onChange={(e) => setProcessNumber(e.target.value)}
                  required
                />
                
                <Input
                  label="Descrição do Prazo"
                  placeholder="Ex: Réplica, Apelação..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Data Fatal</label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-slate-500" /> Notificação por E-mail
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    value={notifyDays}
                    onChange={(e) => setNotifyDays(e.target.value)}
                  >
                    <option value="1">1 dia antes</option>
                    <option value="2">2 dias antes</option>
                    <option value="3">3 dias antes</option>
                    <option value="5">5 dias antes</option>
                    <option value="10">10 dias antes</option>
                    <option value="15">15 dias antes</option>
                  </select>
                  <p className="text-xs text-slate-500">
                    Você receberá um e-mail de alerta no endereço cadastrado.
                  </p>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
                  Agendar Prazo
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Deadline List */}
        <div className="lg:col-span-2 space-y-4">
           {sortedDeadlines.length === 0 ? (
             <div className="bg-white rounded-lg border border-dashed border-slate-300 p-12 text-center">
               <CalendarCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
               <h3 className="text-lg font-medium text-slate-900">Nenhum prazo cadastrado</h3>
               <p className="text-slate-500">Utilize o formulário ao lado para adicionar seus compromissos.</p>
             </div>
           ) : (
             sortedDeadlines.map((item) => {
               const daysLeft = getDaysRemaining(item.deadlineDate);
               const isLate = daysLeft < 0;
               const isUrgent = daysLeft <= 3 && !isLate && !item.isCompleted;

               return (
                 <div 
                  key={item.id} 
                  className={`
                    relative bg-white rounded-lg border shadow-sm p-4 transition-all
                    ${item.isCompleted ? 'border-slate-200 bg-slate-50 opacity-75' : 'border-slate-200 hover:border-blue-300'}
                    ${isUrgent ? 'border-l-4 border-l-orange-500' : ''}
                    ${isLate && !item.isCompleted ? 'border-l-4 border-l-red-500' : ''}
                  `}
                 >
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-start gap-4">
                       <div 
                         onClick={() => toggleDeadline(item.id)}
                         className={`
                           mt-1 h-6 w-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-colors
                           ${item.isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-slate-300 hover:border-blue-500 text-transparent'}
                         `}
                       >
                         <CheckCircle2 className="h-4 w-4" />
                       </div>
                       
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <h4 className={`font-semibold ${item.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                             {item.description}
                           </h4>
                           {item.isCompleted ? (
                             <Badge variant="success">Concluído</Badge>
                           ) : isLate ? (
                             <Badge variant="warning">Atrasado</Badge> // Using warning color for red visually via class overrides if needed, or simple badge
                           ) : isUrgent ? (
                             <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full font-bold flex items-center">
                               <AlertTriangle className="h-3 w-3 mr-1" /> Urgente
                             </span>
                           ) : null}
                         </div>
                         <p className="text-sm text-slate-500 font-mono">{item.processNumber}</p>
                         
                         <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                           <span className="flex items-center">
                             <CalendarDays className="h-3 w-3 mr-1" />
                             Fatal: {new Date(item.deadlineDate).toLocaleDateString('pt-BR')}
                           </span>
                           <span className="flex items-center" title={`Notificação configurada para ${item.notifyDaysBefore} dias antes`}>
                             <Bell className="h-3 w-3 mr-1 text-blue-500" />
                             Avisar {item.notifyDaysBefore} dias antes
                           </span>
                         </div>
                       </div>
                     </div>

                     <div className="flex items-center justify-between md:justify-end gap-4 min-w-[120px]">
                        {!item.isCompleted && (
                          <div className={`text-right ${isLate ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-blue-600'}`}>
                            <span className="block text-xl font-bold">
                              {isLate ? Math.abs(daysLeft) : daysLeft}
                            </span>
                            <span className="text-xs font-medium uppercase">
                              {isLate ? 'Dias Atraso' : 'Dias Restantes'}
                            </span>
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeDeadline(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                   </div>
                 </div>
               );
             })
           )}
        </div>
      </div>
    </div>
  );
};