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

console.log('Testing Gemini API with key:', apiKey.substring(0, 8) + '...');
console.log('Model ID:', MODEL_ID);

async function testGemini() {
    try {
        console.log('🚀 Initializing GoogleGenAI with { apiKey }...');
        const ai = new GoogleGenAI({ apiKey });

        console.log('⏳ Sending test request to ai.models.generateContent...');
        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: [{
                role: 'user',
                parts: [{ text: 'Write a 5-word greeting for a traveler.' }]
            }],
            config: {
                temperature: 0.3,
                maxOutputTokens: 100,
                thinkingConfig: {
                    thinkingBudget: 1024,
                }
            },
        });

        const textContent = response.text ?? '';
        console.log('✅ Success! Response:', textContent);

        if (response.usageMetadata) {
            console.log('📊 Usage:', response.usageMetadata);
        }

    } catch (error) {
        console.error('❌ API Call Failed:');
        console.error(error);
        process.exit(1);
    }
}

testGemini();
