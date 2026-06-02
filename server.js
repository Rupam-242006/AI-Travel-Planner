import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname)); 

app.post('/api/plan-trip', async (req, res) => {
    const { destination, duration, budget, vibe } = req.body;

    if (!destination || !duration) {
        return res.status(400).json({ error: 'Destination and duration are required.' });
    }

    const prompt = `
        You are an expert travel itinerary planner. Generate a highly tailored daily travel itinerary based on these constraints:
        - Destination: ${destination}
        - Duration: ${duration} days
        - Budget level: ${budget}
        - Overall Vibe/Interests: ${vibe}

        You MUST respond ONLY with a raw JSON object matching the following structure exactly. Do not include any markdown formatting or backticks outside the JSON object.

        JSON Structure:
        {
          "trip_title": "String summarizing the trip",
          "itinerary": [
            {
              "day": 1,
              "theme": "Theme for the day",
              "activities": [
                {
                  "time": "09:00 AM",
                  "place_name": "Name of attraction",
                  "description": "Short description",
                  "estimated_cost": "Cost string"
                }
              ]
            }
          ]
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        let cleanText = response.text.trim();
        // Clean out stray markdown backticks if the model ignores responseMimeType instructions
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
        }

        const itineraryData = JSON.parse(cleanText);
        res.json(itineraryData);

    } catch (error) {
        console.error('Backend Error:', error);
        res.status(500).json({ error: 'Failed to generate travel plan due to internal engine processing error.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'travel.html'));
});

app.listen(port, () => {
    console.log(`🚀 Server spinning at http://localhost:${port}`);
});