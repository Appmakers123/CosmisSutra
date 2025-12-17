import { GoogleGenAI, Type } from "@google/genai";
import { HoroscopeResponse, KundaliFormData, KundaliResponse, Language, DailyPanchangResponse, NumerologyResponse, MatchMakingInput, MatchMakingResponse, PlanetaryPosition } from "../types";
import { PLANETS_INFO, ZODIAC_SIGNS } from "../constants";

const apiKey = process.env.API_KEY;

// APIs
const ASTRO_BASE_URL = 'https://json.freeastrologyapi.com';
const ASTRO_API_KEY = 'trwsyF7g7Q6EekOJgWB3P18n38CWmp2Z18v0BxKX';

if (!apiKey) {
  console.error("API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

// --- UTILITIES ---

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get Coordinates and Timezone from Location String
async function getGeoLocation(location: string) {
  try {
    const result = await fetchAstroApi('/geo-details', { location });
    if (Array.isArray(result) && result.length > 0) {
      const place = result[0];
      return {
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude),
          name: place.location_name,
          timezone: place.timezone,
          timezoneOffset: place.timezone_offset ? parseFloat(place.timezone_offset) : undefined
      };
    }
    return null;
  } catch (e) {
    console.error("Geocoding error", e);
    return null;
  }
}

// Calculate Timezone Offset (e.g. 5.5 for IST)
function getTimezoneOffset(timeZone: string, dateStr: string, timeStr: string): number {
  try {
    if (!timeZone) return 5.5;
    const date = new Date(`${dateStr}T${timeStr}:00`);
    if (isNaN(date.getTime())) return 5.5;
    const str = date.toLocaleString('en-US', { timeZone, timeZoneName: 'shortOffset' });
    const match = str.match(/GMT([+-]\d{1,2}):?(\d{2})?/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      const sign = hours >= 0 ? 1 : -1;
      return hours + (sign * minutes / 60);
    }
    return 5.5;
  } catch (e) {
    return 5.5;
  }
}

// --- VEDIC ASTROLOGY MATH ENGINE ---

function getSignName(signId: number): string {
    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    return signs[(signId - 1) % 12] || "Aries";
}

function getHouseFromAscendant(planetSignId: number, ascendantSignId: number): number {
    let house = (planetSignId - ascendantSignId) + 1;
    if (house <= 0) house += 12;
    return house;
}

// --- API FETCHERS ---

// Generic fetcher for Astro API with Exponential Backoff for 429 Errors
async function fetchAstroApi(endpoint: string, payload: any, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(`${ASTRO_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": ASTRO_API_KEY
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 429) {
                const waitTime = 1500 * Math.pow(2, attempt);
                console.warn(`Rate Limit hit for ${endpoint}. Retrying in ${waitTime}ms...`);
                await delay(waitTime);
                continue;
            }

            if (!response.ok) {
                 const errorBody = await response.text();
                 console.error(`API Error ${endpoint}: ${response.status} - ${errorBody}`);
                 return null;
            }

            const data = await response.json();
            return data.output || data.response || data;
        } catch(e) {
            if (attempt === retries - 1) return null;
            await delay(1000);
        }
    }
    return null;
}

async function fetchD1Data(date: string, time: string, lat: number, lon: number, tzone: number) {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, min] = time.split(':').map(Number);
    if ([year, month, day, hour, min, lat, lon, tzone].some(x => isNaN(x))) return null;

    const payload = {
        year, month, date: day, hours: hour, minutes: min, seconds: 0,
        latitude: lat, longitude: lon, timezone: tzone,
        settings: { observation_point: "topocentric", ayanamsha: "lahiri" }
    };
    return fetchAstroApi('/planets', payload);
}

async function fetchD9Data(date: string, time: string, lat: number, lon: number, tzone: number) {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, min] = time.split(':').map(Number);
    const payload = {
        year, month, date: day, hours: hour, minutes: min, seconds: 0,
        latitude: lat, longitude: lon, timezone: tzone,
        settings: { observation_point: "topocentric", ayanamsha: "lahiri" }
    };
    return fetchAstroApi('/navamsa-chart-info', payload);
}

// --- CORE GENERATORS ---

export const generateHoroscope = async (signName: string, language: Language = 'en'): Promise<HoroscopeResponse> => {
  const todayDate = new Date();
  const dateKey = todayDate.toLocaleDateString('en-CA');
  const cacheKey = `cs_horoscope_${signName.toLowerCase().replace(/\s+/g, '_')}_${language}_${dateKey}`;

  try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
  } catch (e) {}

  try {
    const today = todayDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const langString = language === 'hi' ? 'Hindi' : 'English';
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a daily horoscope for ${signName} for today, ${today}. Language: ${langString}. Include lucky number, color, mood, and compatibility.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            horoscope: { type: Type.STRING },
            luckyNumber: { type: Type.INTEGER },
            luckyColor: { type: Type.STRING },
            mood: { type: Type.STRING },
            compatibility: { type: Type.STRING }
          },
          required: ["horoscope", "luckyNumber", "luckyColor", "mood", "compatibility"]
        }
      }
    });
    const result = JSON.parse(response.text!) as HoroscopeResponse;
    try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch (e) {}
    return result;
  } catch (error) {
    console.error("Error generating horoscope:", error);
    throw error;
  }
};

export const generatePersonalizedDailyHoroscope = async (data: KundaliFormData, language: Language = 'en'): Promise<HoroscopeResponse> => {
    return generateHoroscope(data.name, language); 
};

export const generateKundali = async (data: KundaliFormData, language: Language = 'en'): Promise<KundaliResponse> => {
  try {
    const langString = language === 'hi' ? 'Hindi' : 'English';
    let lat = data.lat || 28.6139;
    let lon = data.lon || 77.2090;
    let tzoneOffset = 5.5;
    
    if (data.lat === undefined || data.lon === undefined) {
        const geo = await getGeoLocation(data.location);
        if (geo) {
            lat = geo.latitude;
            lon = geo.longitude;
            tzoneOffset = geo.timezoneOffset !== undefined ? geo.timezoneOffset : getTimezoneOffset(geo.timezone, data.date, data.time);
        }
    } else {
        tzoneOffset = getTimezoneOffset(data.tzone || 'Asia/Kolkata', data.date, data.time);
    }

    // CRITICAL: Fetch sequentially to avoid 429 Errors
    const d1Raw = await fetchD1Data(data.date, data.time, lat, lon, tzoneOffset);
    await delay(500); // Small gap
    const d9Raw = await fetchD9Data(data.date, data.time, lat, lon, tzoneOffset);

    const mockPlanets = {
         "Sun": { "current_sign": 1, "isRetro": "false" },
         "Moon": { "current_sign": 4, "isRetro": "false" },
         "Ascendant": { "current_sign": 1 }
    };
    
    const d1Data = d1Raw || mockPlanets;
    const getD1Info = (p: string) => {
        const key = Object.keys(d1Data).find(k => k.toLowerCase() === p.toLowerCase());
        return key ? d1Data[key] : null;
    };

    const d1AscSignId = parseInt(getD1Info("Ascendant")?.current_sign) || 1;
    const planetList = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    const d1Positions: PlanetaryPosition[] = [];
    const d9Positions: PlanetaryPosition[] = [];

    const getD9SignId = (p: string) => {
        if (!d9Raw) return 0;
        const key = Object.keys(d9Raw).find(k => k.toLowerCase() === p.toLowerCase());
        const val = key ? d9Raw[key] : null;
        if (typeof val === 'object' && val !== null) return parseInt(val.current_sign);
        return parseInt(val) || 0;
    };
    
    const d9AscSignId = getD9SignId("Ascendant") || d1AscSignId;

    planetList.forEach(pName => {
        const pInfo = getD1Info(pName);
        if (pInfo) {
            const d1SignId = parseInt(pInfo.current_sign);
            d1Positions.push({
                planet: pName,
                sign: getSignName(d1SignId),
                signId: d1SignId,
                house: getHouseFromAscendant(d1SignId, d1AscSignId),
                isRetrograde: String(pInfo.isRetro) === "true"
            });
            let d9SignId = getD9SignId(pName) || d1SignId;
            d9Positions.push({
                planet: pName,
                sign: getSignName(d9SignId),
                signId: d9SignId,
                house: getHouseFromAscendant(d9SignId, d9AscSignId),
                isRetrograde: String(pInfo.isRetro) === "true"
            });
        }
    });

    const chartContext = JSON.stringify({ d1: d1Positions, d9: d9Positions });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate a detailed Vedic Kundali reading for ${data.name}. Data: ${chartContext}. Analysis in ${langString}.`,
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            basicDetails: { type: Type.OBJECT, properties: { ascendant: { type: Type.STRING }, moonSign: { type: Type.STRING }, sunSign: { type: Type.STRING }, nakshatra: { type: Type.STRING } } },
            panchang: { type: Type.OBJECT, properties: { tithi: { type: Type.STRING }, vara: { type: Type.STRING }, nakshatra: { type: Type.STRING }, yoga: { type: Type.STRING }, karana: { type: Type.STRING } } },
            details: { 
              type: Type.OBJECT, 
              properties: { 
                mangalDosha: { type: Type.OBJECT, properties: { present: { type: Type.BOOLEAN }, one_line_description: { type: Type.STRING } } }, 
                gemstones: { 
                  type: Type.OBJECT, 
                  properties: { 
                    life: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, gem: { type: Type.STRING }, wear_finger: { type: Type.STRING }, wear_metal: { type: Type.STRING }, reason: { type: Type.STRING } } },
                    lucky: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, gem: { type: Type.STRING }, wear_finger: { type: Type.STRING }, wear_metal: { type: Type.STRING }, reason: { type: Type.STRING } } },
                    benefic: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, gem: { type: Type.STRING }, wear_finger: { type: Type.STRING }, wear_metal: { type: Type.STRING }, reason: { type: Type.STRING } } }
                  },
                  required: ["life", "lucky", "benefic"]
                }, 
                yogas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } }, 
                remedies: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } } } 
              } 
            },
            planetAnalysis: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet: { type: Type.STRING }, position: { type: Type.STRING }, analysis: { type: Type.STRING } } } },
            dasha: { type: Type.OBJECT, properties: { currentMahadasha: { type: Type.STRING }, antardasha: { type: Type.STRING }, endsAt: { type: Type.STRING }, analysis: { type: Type.STRING } } },
            predictions: { type: Type.OBJECT, properties: { general: { type: Type.STRING }, career: { type: Type.STRING }, love: { type: Type.STRING }, health: { type: Type.STRING } } }
          }
        }
      }
    });

    const aiData = JSON.parse(response.text!);
    return {
        ...aiData,
        basicDetails: { ...aiData.basicDetails, ascendantSignId: d1AscSignId },
        charts: { planetaryPositions: d1Positions, navamshaPositions: d9Positions, navamshaAscendantSignId: d9AscSignId, shadbala: [] }
    };
  } catch (error) {
    console.error("Kundali Error:", error);
    throw error;
  }
};

export const generateDailyPanchang = async (location: string = "New Delhi, India", language: Language = 'en'): Promise<DailyPanchangResponse> => {
    const todayDate = new Date();
    const dateKey = todayDate.toLocaleDateString('en-CA');
    const cacheKey = `cs_panchang_${location.toLowerCase().replace(/\s+/g, '_')}_${language}_${dateKey}`;
    let cachedData: DailyPanchangResponse | null = null;
    try { const cached = localStorage.getItem(cacheKey); if (cached) cachedData = JSON.parse(cached); } catch(e) {}

    let lat = 28.6139, lon = 77.2090, tzone = 5.5;
    const geo = await getGeoLocation(location);
    if (geo) { lat = geo.latitude; lon = geo.longitude; tzone = geo.timezoneOffset || 5.5; }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    // Fix: Ensure time string is zero-padded for the API (HH:MM)
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const d1Raw = await fetchD1Data(dateStr, timeStr, lat, lon, tzone);
    let textData = cachedData;

    if (!textData) {
        const langString = language === 'hi' ? 'Hindi' : 'English';
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate daily Panchang for ${location} on ${dateStr}. Language: ${langString}. JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING }, location: { type: Type.STRING }, sunrise: { type: Type.STRING }, sunset: { type: Type.STRING }, moonrise: { type: Type.STRING },
                        tithi: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, endTime: { type: Type.STRING } } },
                        nakshatra: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, endTime: { type: Type.STRING } } },
                        yoga: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, endTime: { type: Type.STRING } } },
                        karana: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, endTime: { type: Type.STRING } } },
                        rahuKalam: { type: Type.STRING }, yamaganda: { type: Type.STRING }, abhijitMuhurat: { type: Type.STRING }
                    }
                }
            }
        });
        textData = JSON.parse(response.text!) as DailyPanchangResponse;
        try { localStorage.setItem(cacheKey, JSON.stringify(textData)); } catch(e) {}
    }

    // High Quality Fallback Data for Transit chart if API fails
    const d1Final = d1Raw || {
        "Sun": { "current_sign": (now.getMonth() + 1), "isRetro": "false" },
        "Moon": { "current_sign": Math.floor(now.getDate() / 2.5) + 1, "isRetro": "false" },
        "Jupiter": { "current_sign": 2, "isRetro": "false" },
        "Saturn": { "current_sign": 11, "isRetro": "true" },
        "Mars": { "current_sign": 4, "isRetro": "false" },
        "Mercury": { "current_sign": 12, "isRetro": "false" },
        "Venus": { "current_sign": 1, "isRetro": "false" },
        "Rahu": { "current_sign": 12, "isRetro": "true" },
        "Ketu": { "current_sign": 6, "isRetro": "true" },
        "Ascendant": { "current_sign": 1 }
    };

    let planetaryPositions: PlanetaryPosition[] = [];
    const ascInfo = d1Final["Ascendant"] || d1Final["ascendant"] || { current_sign: 1 };
    const ascSignId = parseInt(ascInfo.current_sign) || 1;

    ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].forEach(p => {
        const info = d1Final[p] || d1Final[p.toLowerCase()];
        if (info) {
            const sId = parseInt(info.current_sign);
            planetaryPositions.push({
                planet: p, sign: getSignName(sId), signId: sId,
                house: getHouseFromAscendant(sId, ascSignId),
                isRetrograde: String(info.isRetro) === "true"
            });
        }
    });

    return { ...textData!, planetaryPositions, ascendantSignId: ascSignId };
}

export const generatePalmInterpretation = async (lines: string[], language: Language = 'en'): Promise<string> => {
    const langString = language === 'hi' ? 'Hindi' : 'English';
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Palm reading for lines: ${lines.join(", ")}. Language: ${langString}.`,
    });
    return response.text || "Reading unavailable.";
}

export const generateNumerologyReport = async (name: string, lifePath: number, destiny: number, soulUrge: number, personality: number, birthday: number, language: Language = 'en'): Promise<NumerologyResponse> => {
    const langString = language === 'hi' ? 'Hindi' : 'English';
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Numerology for ${name}. LP: ${lifePath}, Dest: ${destiny}. Language: ${langString}.`,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { lifePath: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, description: { type: Type.STRING } } }, destiny: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, description: { type: Type.STRING } } }, soulUrge: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, description: { type: Type.STRING } } }, personality: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, description: { type: Type.STRING } } }, birthday: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, description: { type: Type.STRING } } }, dailyForecast: { type: Type.STRING } } } }
    });
    return JSON.parse(response.text!) as NumerologyResponse;
}

export const generateConjunctionAnalysis = async (planets: string[], house: number, sign: string, language: Language = 'en'): Promise<string> => {
    const langString = language === 'hi' ? 'Hindi' : 'English';
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Analyze Conjunction: ${planets.join("+")} in House ${house} (${sign}). Language: ${langString}.`,
        config: { thinkingConfig: { thinkingBudget: 4000 } }
    });
    return response.text || "Analysis unavailable.";
}

export const generatePlacementAnalysis = async (planet: string, house: number, sign: string, language: Language = 'en'): Promise<string> => {
    const langString = language === 'hi' ? 'Hindi' : 'English';
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Analyze Placement: ${planet} in House ${house} (${sign}). Language: ${langString}.`,
        config: { thinkingConfig: { thinkingBudget: 4000 } }
    });
    return response.text || "Analysis unavailable.";
}

export const generateCompatibilityReport = async (boy: { name: string, sign: string, lifePath: number }, girl: { name: string, sign: string, lifePath: number }, ashtakoot: any, language: Language = 'en'): Promise<string> => {
    const langString = language === 'hi' ? 'Hindi' : 'English';
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Compatibility for ${boy.name} and ${girl.name}. Ashtakoot Score: ${ashtakoot?.total?.obtained_points || 0}/36. Language: ${langString}. Use search for celebrity examples.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "Report unavailable.";
}

export const generateMatchMaking = async (boy: MatchMakingInput, girl: MatchMakingInput, language: Language = 'en'): Promise<MatchMakingResponse> => {
    const bLat = boy.lat || 28.6, bLon = boy.lon || 77.2, bTz = 5.5;
    const gLat = girl.lat || 28.6, gLon = girl.lon || 77.2, gTz = 5.5;
    const [by, bm, bd] = boy.date.split('-').map(Number);
    const [bh, bmin] = boy.time.split(':').map(Number);
    const [gy, gm, gd] = girl.date.split('-').map(Number);
    const [gh, gmin] = girl.time.split(':').map(Number);
    const payload = { m_day: bd, m_month: bm, m_year: by, m_hour: bh, m_min: bmin, m_lat: bLat, m_lon: bLon, m_tzone: bTz, f_day: gd, f_month: gm, f_year: gy, f_hour: gh, f_min: gmin, f_lat: gLat, f_lon: gLon, f_tzone: gTz };
    const data = await fetchAstroApi('/match-making/ashtakoot-score', payload);
    if (data && (data.ashtakoot_score || data.total)) {
         if (data.ashtakoot_score) return data;
         return { ashtakoot_score: { varna: data.varna, vashya: data.vashya, tara: data.tara, yoni: data.yoni, graha_maitri: data.graha_maitri, gana: data.gana, bhakoot: data.bhakoot, nadi: data.nadi, total: data.total }, conclusion: data.conclusion };
    }
    return { ashtakoot_score: { varna: { total_points: 1, obtained_points: 0, description: "N/A" }, vashya: { total_points: 2, obtained_points: 0, description: "N/A" }, tara: { total_points: 3, obtained_points: 0, description: "N/A" }, yoni: { total_points: 4, obtained_points: 0, description: "N/A" }, graha_maitri: { total_points: 5, obtained_points: 0, description: "N/A" }, gana: { total_points: 6, obtained_points: 0, description: "N/A" }, bhakoot: { total_points: 7, obtained_points: 0, description: "N/A" }, nadi: { total_points: 8, obtained_points: 0, description: "N/A" }, total: { total_points: 36, obtained_points: 0, description: "Score Unavailable" } }, conclusion: { status: false, report: "Service temporarily unavailable." } };
}

export const generateTarotReading = async (cards: string[], language: Language = 'en'): Promise<string> => {
    const langString = language === 'hi' ? 'Hindi' : 'English';
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Tarot Reading (Past, Present, Future): ${cards.join(", ")}. Language: ${langString}.`,
        config: { thinkingConfig: { thinkingBudget: 4000 } }
    });
    return response.text || "Reading clouded.";
}

export const createChatSession = (language: Language, context?: string) => {
    const langString = language === 'hi' ? 'Hindi' : 'English';
    return ai.chats.create({
        model: "gemini-3-pro-preview",
        config: { thinkingConfig: { thinkingBudget: 8000 }, systemInstruction: `You are Rishi, a Vedic Astrologer. Language: ${langString}. Context: ${context || 'General'}` }
    });
};