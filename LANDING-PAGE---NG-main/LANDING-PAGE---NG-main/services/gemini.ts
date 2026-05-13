import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
} else {
    console.warn("Missing Gemini API Key");
}

export const getGeminiModel = (modelName: string = "gemini-pro") => {
    if (!genAI) {
        throw new Error("Gemini API not initialized");
    }
    return genAI.getGenerativeModel({ model: modelName });
};

export const generateContent = async (prompt: string, modelName: string = "gemini-pro") => {
    try {
        const model = getGeminiModel(modelName);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating content with Gemini:", error);
        throw error;
    }
};

export const classifyLead = async (leadData: {
    niche: string;
    revenue_range: string;
    biggest_challenge: string;
}) => {
    const prompt = `
    Atue como um qualificador de leads experiente para um ecossistema de alta performance (Mastermind/Business).
    Use o seguinte contexto:
    - Nicho: ${leadData.niche}
    - Faturamento: ${leadData.revenue_range}
    - Desafio: ${leadData.biggest_challenge}

    Responda em formato curto (texto simples):
    [SCORE 0-100] | [PERFIL: Iniciante, Promissor, Ideal, Whale] | [ANÁLISE EM UMA FRASE]
    
    Exemplo:
    85 | Ideal | Faturamento consolidado e desafio de escala claro.
    `;

    try {
        const result = await generateContent(prompt);
        return result?.trim() || "Análise indisponível";
    } catch (error) {
        console.error("Erro ao classificar lead:", error);
        return "Erro na análise de IA.";
    }
};
