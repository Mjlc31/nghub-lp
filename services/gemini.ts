import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

export const getGeminiModel = (modelName: string = "gemini-pro") => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY);
    if (!apiKey) {
        throw new Error("Gemini API not configured. Please define VITE_GEMINI_API_KEY in your .env file.");
    }
    if (!genAI) {
        genAI = new GoogleGenerativeAI(apiKey);
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
