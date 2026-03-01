import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

export const callGeminiProxy = onRequest(
    { secrets: [geminiApiKey], region: 'us-central1', cors: true },
    async (req, res) => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        const { payload, modelId } = req.body;

        if (!payload || !modelId) {
            res.status(400).json({ error: 'Missing required fields: payload, modelId' });
            return;
        }

        const apiKey = geminiApiKey.value();
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const err = await response.text();
            res.status(response.status).json({ error: `Gemini API error: ${err}` });
            return;
        }

        const data = await response.json();
        res.json(data);
    }
);
