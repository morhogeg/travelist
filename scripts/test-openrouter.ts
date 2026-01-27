import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
config();

const API_KEY = process.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS_TO_TEST = [
    'google/gemma-3-27b-it:free',
    'deepseek/deepseek-r1-distill-llama-70b:free',
    'google/gemini-2.0-flash-lite-preview-02-05:free',
    'meta-llama/llama-3.3-70b-instruct:free'
];

async function testModel(model: string) {
    console.log(`\nTesting model: ${model}...`);

    if (!API_KEY) {
        console.error('❌ Error: VITE_OPENROUTER_API_KEY not found in .env');
        return;
    }

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Travelist Test Script'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'user', content: 'Say "Hello" if you can hear me.' }
                ],
                max_tokens: 50
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Failed: ${response.status} ${response.statusText}`);
            console.error(`Response: ${errorText}`);
        } else {
            const data = await response.json();
            console.log(`✅ Success! Response: "${data.choices[0].message.content}"`);
        }
    } catch (error) {
        console.error(`❌ Network Error: ${error.message}`);
    }
}

async function runTests() {
    console.log('Starting OpenRouter Connectivity Test...');
    if (!API_KEY) {
        console.error('❌ CRITICAL: VITE_OPENROUTER_API_KEY is missing from environment!');
        console.log('Please ensure you have a .env file with this key defined.');
        return;
    }

    for (const model of MODELS_TO_TEST) {
        await testModel(model);
    }
}

runTests();
