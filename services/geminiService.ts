
import { GoogleGenAI, Type } from "@google/genai";
import { PuzzleData, AiSettings, DifficultyLevel } from '../types';

// --- Google Helpers ---
const getGoogleClient = (apiKey: string) => {
  if (!apiKey) throw new Error("Google API Key is missing. Please check Settings.");
  return new GoogleGenAI({ apiKey });
};

// --- OpenAI Helpers ---
// Using fetch to avoid adding a heavy dependency for just text generation
const generateOpenAIPuzzle = async (apiKey: string, categoryRequest: string, difficulty: string): Promise<PuzzleData> => {
    if (!apiKey) throw new Error("OpenAI API Key is missing. Please check Settings.");

    const prompt = `Generate a 'Wheel of Fortune' style puzzle for Taiwanese EFL students.
    The category is: ${categoryRequest}.
    The difficulty is: ${difficulty}.
    CRITICAL INSTRUCTION: The phrase MUST be a COMPLETE, GRAMMATICALLY CORRECT ENGLISH SENTENCE.
    Do NOT generate fragments or simple noun phrases.
    Example of bad output: "APPLE PIE"
    Example of good output: "I WANT TO EAT APPLE PIE"
    Length target: 5 to 9 words.
    Do not use punctuation other than hyphens or apostrophes if absolutely necessary.
    Return valid JSON with keys "category", "phrase", and "difficulty". phrase must be uppercase.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4.1-2025-04-14", // Cost effective, high quality
            messages: [
                { role: "system", content: "You are a puzzle generator. You always output JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`OpenAI Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    return {
        category: content.category.toUpperCase(),
        phrase: content.phrase.toUpperCase(),
        difficulty: difficulty as DifficultyLevel
    };
};


// --- Main Exported Functions ---

export const generatePuzzle = async (settings: AiSettings, categoryRequest: string = "General Knowledge", difficulty: DifficultyLevel = DifficultyLevel.A1): Promise<PuzzleData> => {
  try {
    // Branch based on provider
    if (settings.textProvider === 'openai') {
        return await generateOpenAIPuzzle(settings.openAiApiKey, categoryRequest, difficulty);
    } 
    
    // Default to Google
    const ai = getGoogleClient(settings.googleApiKey);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 'Wheel of Fortune' style puzzle for Taiwanese EFL students. 
      The category is: ${categoryRequest}.
      The difficulty is: ${difficulty}.
      CRITICAL INSTRUCTION: The phrase MUST be a COMPLETE, GRAMMATICALLY CORRECT ENGLISH SENTENCE.
      Do NOT generate fragments or simple noun phrases.
      Example of bad output: "BLUE SKY"
      Example of good output: "THE SKY IS VERY BLUE TODAY"
      Length target: 5 to 9 words.
      Do not use punctuation other than hyphens or apostrophes if absolutely necessary.
      Return valid JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            phrase: { type: Type.STRING, description: "The puzzle phrase in UPPERCASE. Must be a complete sentence." },
            difficulty: { type: Type.STRING, description: "The difficulty level used" }
          },
          required: ["category", "phrase"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    return {
      category: data.category.toUpperCase(),
      phrase: data.phrase.toUpperCase(),
      difficulty: difficulty
    };

  } catch (error) {
    console.error("AI Generation Error:", error);
    // Fallback if API fails
    return {
      category: "FALLBACK",
      phrase: "API CONFIGURATION ERROR",
      difficulty: DifficultyLevel.A1
    };
  }
};

/**
 * Checks voice solution using Gemini.
 * Implements strict failover: Try gemini-3-flash-preview, if error, try gemini-2.5-flash.
 */
export const checkVoiceSolution = async (settings: AiSettings, audioBase64: string, expectedPhrase: string): Promise<boolean> => {
  const apiKey = settings.googleApiKey;
  if (!apiKey) {
      console.error("Google API Key missing for voice analysis");
      return false;
  }

  const ai = getGoogleClient(apiKey);
  
  const prompt = `Analyze the audio of an EFL (English as Foreign Language) student attempting to solve a puzzle.
  The target phrase is: "${expectedPhrase}".
  
  Rules:
  1. If the audio is silent, mostly background noise, or unintelligible, return match: false.
  2. If the speaker only says part of the phrase (e.g. misses a word), return match: false.
  3. If the speaker attempts the full phrase but has a heavy accent, return match: true.
  4. Ignore filler words like "um", "uh", or "is it...".
  
  You are the judge. Did they say the specific words "${expectedPhrase}"? Return JSON.`;

  const audioPart = {
    inlineData: {
        mimeType: "audio/wav", 
        data: audioBase64
    }
  };

  const schema = {
    type: Type.OBJECT,
    properties: {
       match: { type: Type.BOOLEAN, description: "True if the audio matches the phrase, false otherwise." }
    },
    required: ["match"]
  };

  // Helper for calling specific model
  const callModel = async (modelName: string) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [audioPart, { text: prompt }]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      const result = JSON.parse(response.text || "{}");
      console.log(`AI Voice Analysis (${modelName}):`, result);
      return result.match === true;
  };

  try {
      // 1. Try Primary Model
      return await callModel("gemini-3-flash-preview");

  } catch (primaryError) {
      console.warn("Primary Gemini model failed, attempting fallback to gemini-2.5-flash...", primaryError);
      
      try {
          // 2. Try Fallback Model (User specified)
          return await callModel("gemini-2.5-flash");
      } catch (fallbackError) {
          console.error("Both Gemini models failed.", fallbackError);
          return false;
      }
  }
};
