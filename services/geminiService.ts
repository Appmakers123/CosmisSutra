
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { HoroscopeResponse, KundaliFormData, KundaliResponse, Language, DailyPanchangResponse, NumerologyResponse, MatchMakingInput, MatchMakingResponse, MuhuratItem, TransitResponse } from "../types";

// Helper to get a fresh AI instance using the pre-configured system key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const MASTER_MENTOR_PROMPT = "You are a world-class mentor for CosmicSutra Academy. Your goal is to explain occult sciences like astrology, palmistry, and numerology with deep scholarly insight but simple words. IMPORTANT: You must respond ONLY in the language requested (English or Hindi). Use bullet points and clear headers.";

/**
 * Common Logic for all Occult Lab Interpretations
 */
const generateInterpretativeReading = async (prompt: string, systemInstruction: string, model: string = "gemini-3-flash-preview") => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { systemInstruction: MASTER_MENTOR_PROMPT + " " + systemInstruction }
        });
        return response.text || "";
    } catch (e) {
        throw e;
    }
};

export const generatePalmInterpretation = async (lines: string[], language: Language): Promise<string> => 
    generateInterpretativeReading(`Analyze these detected palm lines: ${lines.join(", ")}. Language: ${language}.`, "Act as an expert Vedic Palmist.");

export const generateConjunctionAnalysis = async (planets: string[], house: number, sign: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Analyze the conjunction of ${planets.join(" and ")} in house ${house} within the sign of ${sign}. Language: ${language}.`, "Focus on Yoga results in Vedic Astrology.");

export const generateVastuAnalysis = async (room: string, direction: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Analyze the Vastu energy flow of a ${room} placed in the ${direction} direction. Language: ${language}.`, "Act as a Vastu Shastra expert.");

export const generateGemstoneAdvice = async (planet: string, problem: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Suggest a gemstone remedy for a weak ${planet} and the life objective: ${problem}. Language: ${language}.`, "Focus on Ratna Shastra (Gemstone Science).");

export const generateDreamAnalysis = async (dream: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Interpret this dream from a Vedic perspective: "${dream}". Language: ${language}.`, "Focus on Swapna Shastra (Dream Interpretation).");

export const generateRudrakshAdvice = async (problem: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Identify the best Rudraksh bead for this problem: ${problem}. Language: ${language}.`, "Focus on Rudraksh Vidya.");

export const searchOccultVault = async (query: string, category: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Explain "${query}" within the context of "${category}". Language: ${language}.`, "Provide deep esoteric wisdom.");

export const generateAstroStory = async (target: string, type: string, language: Language): Promise<string> => 
    generateInterpretativeReading(`Tell a mystical legend from the Puranas about the ${type} ${target}. Language: ${language}.`, "Act as a Vedic Storyteller.");

export const generateTarotReading = async (cards: string[], language: Language): Promise<string> => 
    generateInterpretativeReading(`Interpret this 3-card Tarot spread: ${cards.join(", ")} representing Past, Present, and Future. Language: ${language}.`, "Act as a Mystic Tarot Reader.");

/**
 * Structured Data Services
 */
export const generateHoroscope = async (signName: string, language: Language = 'en'): Promise<HoroscopeResponse> => {
  try {
      const ai = getAI();
      const today = new Date().toDateString();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: `Planetary transits for ${signName} on ${today}. Language: ${language}.`,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: MASTER_MENTOR_PROMPT + " Deterministic output.",
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
  } catch (e) {
      throw e;
  }
};

export const generateKundali = async (formData: KundaliFormData, language: Language = 'en'): Promise<KundaliResponse> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: "gemini-3-pro-preview", 
          contents: `Calculate Sidereal chart: ${formData.name}, ${formData.date}, ${formData.time}, ${formData.location}.`,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: MASTER_MENTOR_PROMPT,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                basicDetails: { type: Type.OBJECT, properties: { ascendant: { type: Type.STRING }, ascendantSignId: { type: Type.INTEGER }, moonSign: { type: Type.STRING }, sunSign: { type: Type.STRING }, nakshatra: { type: Type.STRING } } },
                panchang: { type: Type.OBJECT, properties: { tithi: { type: Type.STRING }, vara: { type: Type.STRING } } },
                charts: { type: Type.OBJECT, properties: { planetaryPositions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet: { type: Type.STRING }, signId: { type: Type.INTEGER }, house: { type: Type.INTEGER } } } }, navamshaPositions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet: { type: Type.STRING }, signId: { type: Type.INTEGER }, house: { type: Type.INTEGER } } } }, navamshaAscendantSignId: { type: Type.INTEGER } } },
                dasha: { type: Type.OBJECT, properties: { currentMahadasha: { type: Type.STRING }, antardasha: { type: Type.STRING } } },
                predictions: { type: Type.OBJECT, properties: { general: { type: Type.STRING }, career: { type: Type.STRING }, love: { type: Type.STRING }, health: { type: Type.STRING } } }
              }
            }
          }
        });
        return JSON.parse(response.text!) as KundaliResponse;
    } catch (e) {
        throw e;
    }
};

export const generateDailyPanchang = async (location: string, language: Language): Promise<DailyPanchangResponse> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Vedic Panchang for ${location}.`,
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
    } catch (e) {
        throw e;
    }
};

export const generateMuhuratPlanner = async (location: string, language: Language): Promise<MuhuratItem[]> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Auspicious Muhurat timings for today in ${location}. Language: ${language}.`,
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
    } catch (e) {
        throw e;
    }
};

/**
 * Multimedia & Interactive Services
 */
export const generateMantraAudio = async (mantraText: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Speak slowly and clearly with a spiritual tone: ${mantraText}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                }
            }
        });
        const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData && p.inlineData.mimeType.includes('audio'));
        const base64Audio = audioPart?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data received.");
        return base64Audio;
    } catch (e) {
        throw e;
    }
};

export const generateMysticReading = async (base64Image: string, features: string[], mode: 'face' | 'object', language: Language): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { 
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: `Esoterically analyze this ${mode} looking for: ${features.join(", ")}. Language: ${language}.` }
                ] 
            },
            config: { systemInstruction: MASTER_MENTOR_PROMPT + " Act as a Mystic Seer." }
        });
        return response.text || "";
    } catch (e) {
        throw e;
    }
};

export const generateCosmicArt = async (prompt: string, language: Language): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: `Mystical Cosmic Vedic artwork representing: ${prompt}. Cinematic, detailed, spiritual.` }] }
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        return "";
    } catch (e) {
        throw e;
    }
};

export const generateStoryImage = async (target: string, story: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: `Historical Vedic illustration of ${target}. Intricate temple art style.` }] }
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        return "";
    } catch (e) {
        throw e;
    }
};

/**
 * Chat and Fallback Services
 */
export const createChatSession = (language: Language, context?: string) => {
    const ai = getAI();
    return ai.chats.create({
        model: "gemini-3-flash-preview", 
        config: { systemInstruction: `You are CosmicSutra Sage. Guide the seeker with Vedic wisdom. Context: ${context}. Language: ${language}.` }
    });
};

export const askRishiWithFallback = async (prompt: string, language: Language, context?: string) => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `${context ? "Context: " + context + "\n" : ""}User: ${prompt}.`,
            config: { 
                tools: [{ googleSearch: {} }],
                systemInstruction: "Search the web to provide a helpful answer about astrology or related spirituality. Respond in " + language
            }
        });
        return { 
            text: response.text || "The cosmic library is currently undergoing maintenance. Please try again soon.", 
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
                title: chunk.web?.title || "Celestial Source",
                uri: chunk.web?.uri || "#"
            })) || []
        };
    } catch (e) {
        return { text: "The stars are silent. Even the internet cannot reach them right now.", sources: [] };
    }
};

// New Service: Astro Riddles
export const generateAstroRiddles = async (language: Language): Promise<any[]> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Create 3 mysterious riddles about Vedic signs or planets. Language: ${language}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            riddle: { type: Type.STRING },
                            answer: { type: Type.STRING },
                            clue: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        throw e;
    }
};

// ... remaining stubs for compatibility features
export const generateMatchMaking = async (boy: MatchMakingInput, girl: MatchMakingInput, language: Language): Promise<MatchMakingResponse> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Guna Milan for Boy: ${JSON.stringify(boy)}, Girl: ${JSON.stringify(girl)}. Language: ${language}.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    ashtakoot_score: { type: Type.OBJECT, properties: { total: { type: Type.OBJECT, properties: { obtained_points: { type: Type.NUMBER } } } } },
                    conclusion: { type: Type.OBJECT, properties: { status: { type: Type.BOOLEAN }, report: { type: Type.STRING } } }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generateCompatibilityReport = async (boy: MatchMakingInput, girl: MatchMakingInput, score: number, language: Language): Promise<string> => 
    generateInterpretativeReading(`Compatibility report for ${boy.name} and ${girl.name} with score ${score}/36. Language: ${language}.`, "Expert Vedic Matchmaker.");

export const generateNumerologyReport = async (name: string, lp: number, destiny: number, soulUrge: number, personality: number, birthday: number, language: Language): Promise<NumerologyResponse> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Interpret Numerology: ${name}, LifePath ${lp}. Language: ${language}.`,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    lifePath: { type: Type.OBJECT, properties: { number: { type: Type.NUMBER }, description: { type: Type.STRING } } },
                    destiny: { type: Type.OBJECT, properties: { number: { type: Type.NUMBER }, description: { type: Type.STRING } } },
                    soulUrge: { type: Type.OBJECT, properties: { number: { type: Type.NUMBER }, description: { type: Type.STRING } } },
                    personality: { type: Type.OBJECT, properties: { number: { type: Type.NUMBER }, description: { type: Type.STRING } } },
                    birthday: { type: Type.OBJECT, properties: { number: { type: Type.NUMBER }, description: { type: Type.STRING } } },
                    dailyForecast: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text!);
};

export const generateAstroQuiz = async (language: Language): Promise<any[]> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create 5 Vedic Astrology quiz questions. Language: ${language}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctIndex: { type: Type.NUMBER },
                        explanation: { type: Type.STRING }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || "[]");
};

export const generatePersonalTransits = async (kundali: KundaliResponse, language: Language): Promise<TransitResponse> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Current transits relative to: ${JSON.stringify(kundali.basicDetails)}. Language: ${language}.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    currentPositions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet: { type: Type.STRING }, sign: { type: Type.STRING }, signId: { type: Type.NUMBER }, house: { type: Type.NUMBER }, isRetrograde: { type: Type.BOOLEAN }, nakshatra: { type: Type.STRING }, degree: { type: Type.STRING } } } },
                    personalImpact: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet: { type: Type.STRING }, house: { type: Type.NUMBER }, sign: { type: Type.STRING }, meaning: { type: Type.STRING } } } }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generateGenericTransits = async (location: string, rashi: string, language: Language): Promise<TransitResponse> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `General transits for today at ${location} for sign ${rashi}. Language: ${language}.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    currentPositions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet: { type: Type.STRING }, sign: { type: Type.STRING }, signId: { type: Type.NUMBER }, house: { type: Type.NUMBER }, isRetrograde: { type: Type.BOOLEAN }, nakshatra: { type: Type.STRING }, degree: { type: Type.STRING } } } },
                    personalImpact: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet: { type: Type.STRING }, house: { type: Type.NUMBER }, sign: { type: Type.STRING }, meaning: { type: Type.STRING } } } }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const getAstroDetails = async (person: MatchMakingInput): Promise<{sign: string, nakshatra: string}> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Identify Moon Sign and Nakshatra for: ${JSON.stringify(person)}.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { sign: { type: Type.STRING }, nakshatra: { type: Type.STRING } } }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generateTripleCompatibility = async (personA: any, personB: any, language: Language): Promise<any> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Triple compatibility between: ${JSON.stringify(personA)} and ${JSON.stringify(personB)}. Language: ${language}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    overallScore: { type: Type.NUMBER },
                    numerologyScore: { type: Type.NUMBER },
                    nakshatraScore: { type: Type.NUMBER },
                    signScore: { type: Type.NUMBER },
                    report: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
};
