import { GoogleGenAI } from "@google/genai";
import { PetitionDraft, CnjMetadata, JurisprudenceResult, GroundingSource } from "../types";

/**
 * AI Service Layer
 * Handles interactions with Google Gemini API for legal text generation.
 */

// Initialize Gemini with the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const generatePetitionDraft = async (data: PetitionDraft): Promise<string> => {
  try {
    // Construct a structured prompt for the legal assistant
    const prompt = `
      Atue como um Advogado Sênior especialista em Direito Brasileiro.
      Sua tarefa é redigir uma Petição Inicial completa e profissional com base nos dados brutos fornecidos abaixo.
      
      DADOS DO CASO:
      - Tipo de Ação: ${data.actionType}
      - Foro/Competência: ${data.jurisdiction || 'A definir pelo advogado'}
      - Autor (Requerente): ${data.plaintiff}
      - Réu (Requerido): ${data.defendant}
      - Fatos Brutos: ${data.facts}
      - Pedidos Solicitados: ${data.requests.join('; ')}

      DIRETRIZES DE REDAÇÃO:
      1. Estrutura: Endereçamento, Qualificação das Partes, Dos Fatos (narrativa jurídica), Do Direito (Fundamentação Legal), Dos Pedidos, Valor da Causa e Fechamento.
      2. Linguagem: Formal, culta, persuasiva e técnica (juridiquês moderado).
      3. Fundamentação: Cite legislação pertinente (CF/88, CC/02, CPC/15, CDC, etc.) que se aplique aos fatos narrados. NÃO invente leis, use apenas as reais.
      4. Expansão: Não apenas copie os fatos. Reescreva-os de forma cronológica e lógica, destacando os danos ou direitos violados.
      5. Formatação: Use espaçamento adequado para leitura.

      Gere apenas o texto da petição, pronto para ser revisado e protocolado.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.4, // Lower temperature for more consistent/factual legal outputs
        topK: 40,
        topP: 0.95,
      }
    });

    return response.text || "Houve um erro ao gerar o conteúdo. Por favor, tente novamente.";
  } catch (error) {
    console.error("Erro ao chamar Gemini API:", error);
    return "Erro ao conectar com o assistente jurídico. Verifique sua conexão ou tente mais tarde. Detalhes técnicos: " + (error instanceof Error ? error.message : String(error));
  }
};

export const analyzePetitionForCnj = async (petitionText: string): Promise<CnjMetadata> => {
  try {
    const prompt = `
      Analise o texto da petição jurídica abaixo e extraia/sugira os metadados para cadastro no sistema do tribunal (CNJ).
      
      PETIÇÃO:
      ${petitionText.substring(0, 5000)}... (texto truncado para análise)

      TAREFA:
      Retorne APENAS um objeto JSON (sem markdown, sem explicações) com a seguinte estrutura:
      {
        "classe": "Nome da Classe Processual CNJ mais adequada (ex: Procedimento Comum Cível)",
        "codigoClasse": "Código numérico da classe (estimado)",
        "assunto": "Assunto Principal CNJ mais adequado",
        "codigoAssunto": "Código numérico do assunto (estimado)",
        "competencia": "Sugestão de Competência/Foro (ex: Vara Cível, Juizado Especial Cível, Vara de Família)",
        "valorCausa": "Valor da causa extraído do texto ou 0,00 se não encontrado (formato R$ 0.000,00)",
        "resumo": "Um resumo de 1 linha sobre o teor da petição para cadastro"
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as CnjMetadata;
  } catch (error) {
    console.error("Erro ao analisar CNJ:", error);
    return {
      classe: "Procedimento Comum Cível",
      codigoClasse: "7",
      assunto: "Direito Civil",
      codigoAssunto: "899",
      competencia: "Cível",
      valorCausa: "R$ 1.000,00",
      resumo: "Petição Inicial"
    };
  }
};

export const searchJurisprudence = async (facts: string, actionType: string): Promise<JurisprudenceResult> => {
  try {
    const prompt = `
      Você é um assistente jurídico.
      Com base nos seguintes FATOS da causa: "${facts}" e Tipo de Ação: "${actionType}".
      
      PESQUISE e retorne jurisprudência (julgados/acórdãos) brasileira RECENTE e RELEVANTE que apoie a tese do autor.
      Priorize tribunais superiores (STJ) ou grandes tribunais estaduais (TJSP, TJRJ).
      
      No texto de resposta, liste 3 julgados resumindo:
      1. Tribunal e data aproximada.
      2. O entendimento fixado (Ementa resumida).
      3. Como isso se aplica ao caso.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType cannot be JSON when using googleSearch
      }
    });

    // Extract sources from grounding metadata
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || 'Fonte Web',
            uri: chunk.web.uri
          });
        }
      });
    }

    return {
      analysis: response.text || "Não foi possível encontrar jurisprudência específica no momento.",
      sources: sources
    };

  } catch (error) {
    console.error("Erro ao buscar jurisprudência:", error);
    return {
      analysis: "Erro ao conectar com o serviço de pesquisa de jurisprudência.",
      sources: []
    };
  }
};