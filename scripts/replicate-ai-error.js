import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.VITE_GEMINI_API_KEY;
const MODEL_ID = 'gemini-3-flash-preview';

if (!apiKey) {
    console.error('❌ VITE_GEMINI_API_KEY not found in process.env');
    process.exit(1);
}

async function testGeminiFailing() {
    try {
        const ai = new GoogleGenAI({ apiKey });

        console.log('⏳ Sending REPLICATED request to ai.models.generateContent...');
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: [{
                role: 'user',
                parts: [{ text: 'Write a brief, helpful description for: Eiffel Tower in Paris, France (Category: Attraction)' }]
            }],
            config: {
                systemInstruction: 'You are a knowledgeable travel guide assistant. Write exactly 2 sentences about a place that a traveler would find useful.',
                temperature: 0.3,
                maxOutputTokens: 500,
                thinkingConfig: {
                    thinkingBudget: 1024,
                },
                tools: [{ googleSearch: {} }] // This might be the cause
            },
        });

        console.log('✅ Success! Response:', response.text);

    } catch (error) {
        console.error('❌ API Call Failed with exact payload:');
        if (error.status) console.error('Status:', error.status);
        console.error(error);
        process.exit(1);
    }
}

testGeminiFailing();
