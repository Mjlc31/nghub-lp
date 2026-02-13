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
