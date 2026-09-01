import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Fallback curated blessings if API key is missing or quota/network error occurs
const FALLBACK_BLESSINGS = [
  {
    title: 'Divine Blessings & Infinite Smiles for Shweta',
    mainMessage:
      'Mahadev hamesha apko swasth, khush aur surakshit rakhe. Apka mera saath hamesha bana rahe aur apki pyari loving-caring nature hamesha aisi hi chamakti rahe. Apki har icha aur har sapna pura ho!',
    hindiMessage:
      'महादेव हमेशा आपको स्वस्थ, खुश और सुरक्षित रखें। आपका मेरा साथ हमेशा बना रहे और आपकी प्यारी लविंग-केयरिंग नेचर हमेशा ऐसी ही चमकती रहे। आपकी हर इच्छा और हर सपना पूरा हो!',
    signoffTitle: 'With Eternal Prayers & Pure Warmth',
    signoffSubtitle: 'May Mahadev shower abundant happiness upon your life always.',
  },
  {
    title: 'Auspicious Birthday Wishes for Shweta',
    mainMessage:
      'On this special 25 October, may Lord Shiva bless your path with peace, boundless joy, and success. You deserve every dream and every bit of love the universe has to offer. Hamesha haste muskurate raho!',
    hindiMessage:
      'इस पावन जन्मदिवस पर भगवान शिव आपके मार्ग को शांति, असीम आनंद और सफलता से भर दें। आप अपने जीवन में वो हर खुशी डिज़र्व करती हैं जो आप चाहती हैं। हमेशा हँसते-मुस्कुराते रहो!',
    signoffTitle: 'With Deepest Love & Sacred Wishes',
    signoffSubtitle: '॥ ॐ नमः शिवाय ॥ Always in my heartfelt prayers.',
  },
  {
    title: 'Heartfelt Blessings for a Beautiful Soul',
    mainMessage:
      'Apki aawaz aur muskurahat hamesha sabke chehre par khushi lati hai. Mahadev apki har manokamna puri karein, jeevan me kabhi koi dukh na aaye, aur humara saath sadaiv isi tarah atoot rahe.',
    hindiMessage:
      'आपकी आवाज़ और मुस्कुराहट हमेशा सबके चेहरे पर खुशी लाती है। महादेव आपकी हर मनोकामना पूरी करें, जीवन में कभी कोई दुख न आए, और हमारा साथ सदैव इसी तरह अटूट रहे।',
    signoffTitle: 'Forever By Your Side',
    signoffSubtitle: 'Wishing dearest Shweta the most magical year ahead.',
  },
  {
    title: 'Grace, Strength & Endless Success for Shweta',
    mainMessage:
      'May Bholenath grant you inner strength, endless opportunities, and peace in every step. Aap jaise loving aur caring ho, duniya ki har khushi apke kadmo me ho. Happy Birthday Shweta!',
    hindiMessage:
      'भोलेनाथ आपको आत्मिक बल, अनंत अवसर और हर कदम पर शांति प्रदान करें। आप जैसी लविंग और केयरिंग इंसान के जीवन में दुनिया की हर खुशी आए। जन्मदिन की बहुत-बहुत शुभकामनाएं!',
    signoffTitle: 'With Heartfelt Blessings',
    signoffSubtitle: 'Shine bright today and all the days to come.',
  },
];

// POST /api/blessing/generate
app.post('/api/blessing/generate', async (req, res) => {
  try {
    const { tone = 'divine', currentRecipient = 'Shweta', customNotes = '' } = req.body || {};

    const ai = getGeminiClient();

    if (!ai) {
      // Return a random curated blessing from fallbacks
      const randomBlessing =
        FALLBACK_BLESSINGS[Math.floor(Math.random() * FALLBACK_BLESSINGS.length)];
      return res.json({
        success: true,
        source: 'curated_fallback',
        blessing: randomBlessing,
      });
    }

    const systemPrompt = `You are a deeply empathetic, poetic, and spiritual Indian well-wisher composing a unique, emotional, and heartfelt birthday blessing letter for a very special person named "${currentRecipient}".
The tone must align with:
- Sacred devotion to Lord Shiva / Mahadev (॥ ॐ नमः शिवाय ॥, Ganga Aarti purity, Bholenath's blessings).
- Acknowledging her pure, gentle, loving, caring, and radiant personality.
- Heartfelt sentiments like "Apka mera saath hamesha bane rhe", "Apki nature hamesha aisi hi loving caring rhe", "Apki har icha puri ho, aap apne jeevan me wo sab deserve karo jo aap chahte ho".
- The celebration of her birthday (25 October).
- Language style: A warm blend of respectful Hindi/Roman-Hindi and emotional phrasing, along with a proper Devanagari Hindi translation.

Tone modifier requested: ${tone}
Additional user notes: ${customNotes || 'Focus on lifelong companionship, peace, pure happiness, and Mahadev’s divine grace.'}`;

    const userPrompt = `Generate a fresh, unique, and emotionally touching birthday blessing message for ${currentRecipient}.
Return the response strictly matching the schema with:
1. title: A beautiful short title (e.g., "Blessings of Grace & Light for Shweta").
2. mainMessage: The core blessing message (3-5 sentences in Roman Hindi or Hindi-English mix, warm and sincere).
3. hindiMessage: The corresponding Devanagari Hindi version of the blessing.
4. signoffTitle: A warm signoff heading (e.g., "With Infinite Love & Prayers").
5. signoffSubtitle: A short blessing closing line (e.g., "॥ हर हर महादेव ॥ Forever by your side.").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'The title of the blessing letter.',
            },
            mainMessage: {
              type: Type.STRING,
              description: 'The main blessing text in Roman Hindi or English.',
            },
            hindiMessage: {
              type: Type.STRING,
              description: 'The blessing text written in Devanagari Hindi script.',
            },
            signoffTitle: {
              type: Type.STRING,
              description: 'Signoff title line.',
            },
            signoffSubtitle: {
              type: Type.STRING,
              description: 'Signoff subtitle line.',
            },
          },
          required: ['title', 'mainMessage', 'hindiMessage', 'signoffTitle', 'signoffSubtitle'],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        return res.json({
          success: true,
          source: 'gemini_ai',
          blessing: parsed,
        });
      } catch (parseErr) {
        console.error('Error parsing JSON from Gemini:', parseErr, jsonText);
      }
    }

    // If parse failed, fallback
    const fallback =
      FALLBACK_BLESSINGS[Math.floor(Math.random() * FALLBACK_BLESSINGS.length)];
    return res.json({
      success: true,
      source: 'curated_fallback',
      blessing: fallback,
    });
  } catch (error: any) {
    console.error('Error in /api/blessing/generate:', error);
    // Provide graceful fallback
    const fallback =
      FALLBACK_BLESSINGS[Math.floor(Math.random() * FALLBACK_BLESSINGS.length)];
    return res.json({
      success: true,
      source: 'curated_fallback',
      blessing: fallback,
      errorNotice: error?.message || 'Generated via curated blessings',
    });
  }
});

// POST /api/trivia/generate
app.post('/api/trivia/generate', async (req, res) => {
  try {
    const { recipient = 'Shweta', theme = 'personality' } = req.body || {};
    const ai = getGeminiClient();

    const fallbackTrivia = {
      id: `trivia_${Date.now()}`,
      question: `What makes dearest ${recipient} so uniquely special and loved by everyone?`,
      options: [
        `Her genuine warmth, loving-caring heart & radiant smile 🌸`,
        `Always being in a hurry`,
        `Eating pizza for every single breakfast`,
        `Never answering birthday calls`,
      ],
      correctIndex: 0,
      explanation: `${recipient}'s loving nature and sincere kindness brighten up every room and touch every heart.`,
      rewardMessage: `✨ Exactly right! ${recipient}'s caring essence is pure gold. Mahadev hamesha unhe khush aur surakshit rakhe!`,
      category: 'Special Personality 💖',
    };

    if (!ai) {
      return res.json({ success: true, source: 'fallback', question: fallbackTrivia });
    }

    const prompt = `Create a fun, heartwarming, and celebratory birthday trivia question about a special person named "${recipient}".
Context:
- Her birthday is on 25 October.
- She is deeply respected and protected with Mahadev (Lord Shiva) blessings and mantras.
- She has an immensely loving, caring, and sweet nature.
- Key heartfelt sentiment: "Apka mera saath hamesha bane rhe, apki har icha puri ho aur aap apne jeevan me wo sab deserve karo jo aap chahte ho."

Return JSON with:
1. question: The trivia question.
2. options: An array of 4 multiple-choice options (1 clear correct, 3 fun/lighthearted wrong options).
3. correctIndex: Index (0 to 3) of the correct option.
4. explanation: A 1-2 sentence warm explanation.
5. rewardMessage: A delightful, personalized celebratory reward message to show when guessed correctly (with emojis and blessings).
6. category: A short category badge (e.g., "Personality 💖", "Mahadev Prayers 🕉️", "Celebration Wishes 🎂").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            rewardMessage: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ['question', 'options', 'correctIndex', 'explanation', 'rewardMessage', 'category'],
        },
      },
    });

    const text = response.text?.trim();
    if (text) {
      const parsed = JSON.parse(text);
      return res.json({
        success: true,
        source: 'gemini_ai',
        question: {
          id: `trivia_${Date.now()}`,
          ...parsed,
        },
      });
    }

    return res.json({ success: true, source: 'fallback', question: fallbackTrivia });
  } catch (err: any) {
    console.error('Error generating trivia question:', err);
    return res.json({
      success: true,
      source: 'fallback',
      question: {
        id: `trivia_${Date.now()}`,
        question: 'What is the most cherished blessing for Shweta on her birthday?',
        options: [
          'Mahadev hamesha swasth aur khush rakhe, aur saath sada bane rahe 🕉️',
          'Getting caught in daily traffic',
          'Eating cold tea',
          'Doing endless paperwork',
        ],
        correctIndex: 0,
        explanation: 'Eternal health, joy, and unbroken companionship are the truest wishes for Shweta.',
        rewardMessage: '🌸 May Mahadev shower infinite bliss and success upon Shweta every single day!',
        category: 'Sacred Blessings 🕉️',
      },
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start Express Server with Vite middleware in development or static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
