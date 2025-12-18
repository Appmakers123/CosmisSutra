
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { HoroscopeResponse, KundaliFormData, KundaliResponse, Language, DailyPanchangResponse, NumerologyResponse, MatchMakingInput, MatchMakingResponse, MuhuratItem, TransitResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MASTER_MENTOR_PROMPT = "You are a world-class mentor for CosmicSutra Academy. Your goal is to explain occult sciences like astrology, palmistry, and numerology with deep scholarly insight but simple words. IMPORTANT: You must respond ONLY in the language requested (English or Hindi). Use bullet points and clear headers.";

export const generateMantraAudio = async (mantraText: string): Promise<string> => {
    // Zero-frills prompt to maximize TTS success rate
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Speak slowly and clearly: ${mantraText}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Zephyr' } 
                }
            }
        }
    });

    // Exhaustive search for the audio part to prevent "undefined" errors
    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(p => p.inlineData && p.inlineData.mimeType.includes('audio'));
    const base64Audio = audioPart?.inlineData?.data;
    
    if (!base64Audio) {
        console.warn("Audio extraction failed, checking fallback parts...");
        // Final fallback: just take the first part that has inlineData
        const fallbackPart = candidate?.content?.parts?.find(p => p.inlineData);
        if (!fallbackPart?.inlineData?.data) {
            throw new Error("No audio data received from celestial servers.");
        }
        return fallbackPart.inlineData.data;
    }
    return base64Audio;
};

export const generateGenericTransits = async (location: string, rashi: string, language: Language): Promise<TransitResponse> => {
    const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Location: ${location}. Date: ${today}. Task: Verify current planetary positions using GOOGLE SEARCH for "Vedic Sidereal Ephemeris ${today} Lahiri". Reference Sign: ${rashi}. Ensure Rahu/Ketu are true nodes and 180 degrees apart. Language: ${language}.`,
        config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: "Precision Vedic Astronomer. Priority 1: Match Drik Panchang exactly using Lahiri Ayanamsha. Priority 2: Use Search to find exact degrees. Return ONLY the requested JSON.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    currentPositions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { 
                                planet: { type: Type.STRING }, 
                                sign: { type: Type.STRING }, 
                                signId: { type: Type.INTEGER },
                                isRetrograde: { type: Type.BOOLEAN },
                                nakshatra: { type: Type.STRING },
                                degree: { type: Type.STRING }
                            },
                            required: ["planet", "sign", "signId", "nakshatra"]
                        }
                    },
                    personalImpact: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { planet: { type: Type.STRING }, house: { type: Type.INTEGER }, sign: { type: Type.STRING }, meaning: { type: Type.STRING } },
                            required: ["planet", "house", "meaning"]
                        }
                    }
                },
                required: ["currentPositions", "personalImpact"]
            }
        }
    });
    const parsed = JSON.parse(response.text || "{}");
    return {
        currentPositions: parsed.currentPositions || [],
        personalImpact: parsed.personalImpact || []
    };
};

export const generatePersonalTransits = async (kundali: KundaliResponse, language: Language): Promise<TransitResponse> => {
    const today = new Date().toLocaleDateString('en-GB');
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Today: ${today}. Birth Ascendant: ${kundali.basicDetails.ascendant}. Task: Search for "Sidereal Planetary positions ${today} Lahiri". Map current planets to the user's specific birth houses (1-12). Verify exact degrees for boundary cases. Language: ${language}.`,
        config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: "Advanced Vedic Analyst. Use Lahiri Ayanamsha. Return positions for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu. Focus on house-specific transits for the individual's map.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    currentPositions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { 
                                planet: { type: Type.STRING }, 
                                sign: { type: Type.STRING }, 
                                signId: { type: Type.INTEGER },
                                isRetrograde: { type: Type.BOOLEAN },
                                nakshatra: { type: Type.STRING },
                                degree: { type: Type.STRING }
                            },
                            required: ["planet", "sign", "signId"]
                        }
                    },
                    personalImpact: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { planet: { type: Type.STRING }, house: { type: Type.INTEGER }, sign: { type: Type.STRING }, meaning: { type: Type.STRING } },
                            required: ["planet", "house", "meaning"]
                        }
                    }
                },
                required: ["currentPositions", "personalImpact"]
            }
        }
    });
    const parsed = JSON.parse(response.text || "{}");
    return {
        currentPositions: parsed.currentPositions || [],
        personalImpact: parsed.personalImpact || []
    };
};

export const generateAstroQuiz = async (language: Language): Promise<any[]> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 5 scholarly MCQs about occult sciences. Language: ${language}. Respond only in ${language}.`,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING }
                    },
                    required: ["question", "options", "correctIndex"]
                }
            }
        }
    });
    const parsed = JSON.parse(response.text || "[]");
    return Array.isArray(parsed) ? parsed : [];
};

export const generateHoroscope = async (signName: string, language: Language = 'en'): Promise<HoroscopeResponse> => {
  const today = new Date().toDateString();
  const dailySeed = generateDailySeed(today + signName);

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: `Planetary transits for ${signName} on ${today}. Language: ${language}. Respond only in ${language}.`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: MASTER_MENTOR_PROMPT + " Deterministic output.",
      temperature: 0, 
      seed: dailySeed, 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          horoscope: { type: Type.STRING },
          luckyNumber: { type: Type.INTEGER },
          luckyColor: { type: Type.STRING },
          mood: { type: Type.STRING },
          compatibility: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text!) as HoroscopeResponse;
};

export const generateKundali = async (formData: KundaliFormData, language: Language = 'en'): Promise<KundaliResponse> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", 
    contents: `Calculate Sidereal chart: ${formData.name}, ${formData.date}, ${formData.time}, ${formData.location}. Lahiri Ayanamsha. Language: ${language}.`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: MASTER_MENTOR_PROMPT,
      thinkingConfig: { thinkingBudget: 4000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          basicDetails: {
            type: Type.OBJECT,
            properties: {
              ascendant: { type: Type.STRING },
              ascendantSignId: { type: Type.INTEGER },
              moonSign: { type: Type.STRING },
              sunSign: { type: Type.STRING },
              nakshatra: { type: Type.STRING }
            }
          },
          panchang: { type: Type.OBJECT, properties: { tithi: { type: Type.STRING }, vara: { type: Type.STRING }, nakshatra: { type: Type.STRING }, yoga: { type: Type.STRING }, karana: { type: Type.STRING } } },
          charts: {
            type: Type.OBJECT,
            properties: {
              planetaryPositions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet: { type: Type.STRING }, signId: { type: Type.INTEGER }, house: { type: Type.INTEGER }, isRetrograde: { type: Type.BOOLEAN } } } },
              navamshaPositions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet: { type: Type.STRING }, signId: { type: Type.INTEGER }, house: { type: Type.INTEGER } } } },
              navamshaAscendantSignId: { type: Type.INTEGER }
            }
          },
          dasha: { type: Type.OBJECT, properties: { currentMahadasha: { type: Type.STRING }, antardasha: { type: Type.STRING }, endsAt: { type: Type.STRING }, analysis: { type: Type.STRING } } },
          predictions: { type: Type.OBJECT, properties: { general: { type: Type.STRING }, career: { type: Type.STRING }, love: { type: Type.STRING }, health: { type: Type.STRING } } }
        }
      }
    }
  });
  return JSON.parse(response.text!) as KundaliResponse;
};

export const generateRudrakshAdvice = async (problem: string, language: Language): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Explain which Rudraksh Mukhi is best for this specific problem: "${problem}". Language: ${language}.`,
        config: { systemInstruction: MASTER_MENTOR_PROMPT }
    });
    return response.text || "";
};

export const searchOccultVault = async (query: string, category: string, language: Language): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Category: ${category}. Deep Question: ${query}. Language: ${language}.`,
        config: { tools: [{ googleSearch: {} }], systemInstruction: MASTER_MENTOR_PROMPT }
    });
    return response.text || "";
};

const generateDailySeed = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export const generateDailyPanchang = async (location: string, language: Language): Promise<DailyPanchangResponse> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Vedic Panchang for ${location} on ${new Date().toLocaleDateString()}. Language: ${language}.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING },
                    location: { type: Type.STRING },
                    sunrise: { type: Type.STRING },
                    sunset: { type: Type.STRING },
                    moonrise: { type: Type.STRING },
                    tithi: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, endTime: { type: Type.STRING } } },
                    nakshatra: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, endTime: { type: Type.STRING } } },
                    yoga: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, endTime: { type: Type.STRING } } },
                    karana: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, endTime: { type: Type.STRING } } },
                    rahuKalam: { type: Type.STRING },
                    yamaganda: { type: Type.STRING },
                    abhijitMuhurat: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text!);
};

export const generateMuhuratPlanner = async (location: string, language: Language): Promise<MuhuratItem[]> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Muhurat timings for ${location}. Language: ${language}.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        activity: { type: Type.STRING },
                        status: { type: Type.STRING },
                        timeRange: { type: Type.STRING },
                        reason: { type: Type.STRING }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text!);
};

export const generateDreamAnalysis = async (dream: string, language: Language): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Interpret dream: "${dream}". Language: ${language}.`,
    });
    return response.text || "";
};

export const generatePalmInterpretation = async (lines: string[], language: Language): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Explain palm lines: ${lines.join(', ')}. Language: ${language}.`,
    });
    return response.text || "";
};

export const generateMysticReading = async (base64: string, labels: string[], mode: string, language: Language): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
            parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64 } }, { text: `Read ${mode} based on ${labels.join(', ')}. Language: ${language}.` }]
        },
    });
    return response.text || "";
};

export const generateTarotReading = async (cards: string[], language: Language): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tarot: ${cards.join(', ')}. Language: ${language}.`,
    });
    return response.text || "";
};

export const generateVastuAnalysis = async (roomType: string, direction: string, language: Language): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Vastu: ${roomType} in ${direction}. Language: ${language}.`,
    });
    return response.text || "";
};

export const generateGemstoneAdvice = async (planet: string, problem: string, language: Language): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Stone for ${problem} and planet ${planet}. Language: ${language}.`,
    });
    return response.text || "";
};

export const generateNumerologyReport = async (name: string, lp: number, destiny: number, soulUrge: number, personality: number, birthday: number, language: Language): Promise<NumerologyResponse> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Numerology Report: Name ${name}, LP ${lp}. Language: ${language}.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text!);
};

export const generateMatchMaking = async (boy: MatchMakingInput, girl: MatchMakingInput, language: Language): Promise<MatchMakingResponse> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Vedic Match: ${boy.name} & ${girl.name}. Language: ${language}.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text!);
};

export const generateCompatibilityReport = async (boy: MatchMakingInput, girl: MatchMakingInput, score: number, language: Language): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Compatibility for ${boy.name} & ${girl.name}, Score: ${score}/36. Language: ${language}.`,
    });
    return response.text || "";
};

export const getAstroDetails = async (input: MatchMakingInput): Promise<{ sign: string, nakshatra: string }> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find Moon Sign and Nakshatra for: ${input.date}, ${input.location}.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: { sign: { type: Type.STRING }, nakshatra: { type: Type.STRING } }
            }
        }
    });
    const data = JSON.parse(response.text!);
    return { sign: data.sign || "Aries", nakshatra: data.nakshatra || "Ashwini" };
};

export const generateTripleCompatibility = async (personA: any, personB: any, language: Language): Promise<any> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Match analysis: ${personA.name} and ${personB.name}. Language: ${language}.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text!);
};

export const generateConjunctionAnalysis = async (planets: string[], house: number, sign: string, language: Language): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Explain effect of ${planets.join(' + ')} in house ${house} sign ${sign}. Language: ${language}.`,
    });
    return response.text || "";
};

export const createChatSession = (language: Language, context?: string) => {
    return ai.chats.create({
        model: "gemini-3-flash-preview", 
        config: { systemInstruction: `You are CosmicSutra Sage. Guide user. Context: ${context}. Language: ${language}.` }
    });
};

export const askRishiWithFallback = async (prompt: string, language: Language, context?: string) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${context ? "Context: " + context + "\n" : ""}User: ${prompt}. Respond in ${language}.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return { text: response.text || "", sources: [] };
};

export const generateAstroStory = async (val: string, type: string, language: Language): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Story of ${val}. Language: ${language}.`,
    });
    return response.text || "";
};

export const generateStoryImage = async (target: string, story: string) => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Vedic mystical art: ${target}.` }] }
    });
    for (const part of response.candidates[0].content.parts) { if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`; }
    return "";
};

export const generateCosmicArt = async (prompt: string, language: Language): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Vedic cosmic art: ${prompt}.` }] }
    });
    for (const part of response.candidates[0].content.parts) { if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`; }
    return "";
};
