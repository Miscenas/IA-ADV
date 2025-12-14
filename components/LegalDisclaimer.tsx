import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from './ui';
import { useStore } from '../store';

export const LegalDisclaimerModal: React.FC = () => {
  const { user, acceptDisclaimer } = useStore();

  if (!user || user.acceptedLegalDisclaimer) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Aviso Legal Obrigatório</h2>
            <p className="text-sm text-slate-500">Leia com atenção antes de prosseguir</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Bem-vindo ao <strong>Assistente Jurídico Brasileiro</strong>.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r">
            <p className="text-blue-900 font-medium text-sm">
              Este software é um assistente baseado em inteligência artificial e NÃO substitui um advogado.
            </p>
          </div>

          <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
            <li>Todas as petições, contratos e documentos gerados <strong>DEVEM ser revisados</strong> por um profissional habilitado.</li>
            <li>O sistema não fornece aconselhamento jurídico definitivo ou garantia de resultado.</li>
            <li>O usuário é o <strong>único responsável</strong> pelo conteúdo final e pelo uso das peças processuais.</li>
          </ul>

          <p className="text-xs text-slate-500 mt-4">
            Ao clicar em "Aceitar e Continuar", você declara estar ciente e de acordo com estes termos, assumindo total responsabilidade pelo uso da ferramenta.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
          <Button 
            onClick={acceptDisclaimer}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800"
            icon={ShieldCheck}
          >
            Aceitar e Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};