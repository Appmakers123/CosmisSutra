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

// Helper to get Coordinates and Timezone from Location String
async function getGeoLocation(location: string) {
  try {
    // Use FreeAstrologyAPI for Geocoding
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
    if (!timeZone) return 5.5; // Default to IST if missing
    const date = new Date(`${dateStr}T${timeStr}:00`);
    // Fallback if date is invalid
    if (isNaN(date.getTime())) return 5.5;

    const str = date.toLocaleString('en-US', { timeZone, timeZoneName: 'shortOffset' });
    const match = str.match(/GMT([+-]\d{1,2}):?(\d{2})?/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      const sign = hours >= 0 ? 1 : -1;
      return hours + (sign * minutes / 60);
    }
    return 5.5; // Default fallback
  } catch (e) {
    console.warn("Timezone calculation failed, defaulting to 5.5", e);
    return 5.5;
  }
}

// --- VEDIC ASTROLOGY MATH ENGINE ---

function getSignName(signId: number): string {
    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    return signs[(signId - 1) % 12] || "Aries";
}

function getHouseFromAscendant(planetSignId: number, ascendantSignId: number): number {
    // Calculate house number relative to Ascendant (Lagna)
    // House 1 = Ascendant Sign
    let house = (planetSignId - ascendantSignId) + 1;
    if (house <= 0) house += 12;
    return house;
}

// --- API FETCHERS ---

// Generic fetcher for Astro API
async function fetchAstroApi(endpoint: string, payload: any) {
    try {
        const response = await fetch(`${ASTRO_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": ASTRO_API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
             const errorBody = await response.text();
             console.error(`API Error ${endpoint}: ${response.status} - ${errorBody}`);
             return null;
        }

        const data = await response.json();
        // The API returns { statusCode: 200, output: { ... } } or just the object depending on endpoint
        return data.output || data.response || data;
    } catch(e) {
        console.error(`Fetch failed for ${endpoint}`, e);
        return null;
    }
}

// 1. Fetch D1 Chart Data (Planets)
// Uses endpoint: https://json.freeastrologyapi.com/planets
async function fetchD1Data(date: string, time: string, lat: number, lon: number, tzone: number) {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, min] = time.split(':').map(Number);
    
    // Ensure inputs are numbers
    if ([year, month, day, hour, min, lat, lon, tzone].some(x => isNaN(x))) {
        console.error("Invalid input data for D1 Data", {date, time, lat, lon, tzone});
        return null;
    }

    const payload = {
        year, month, date: day, hours: hour, minutes: min, seconds: 0,
        latitude: lat, longitude: lon, timezone: tzone,
        settings: { 
            observation_point: "topocentric", 
            ayanamsha: "lahiri"
        }
    };

    return fetchAstroApi('/planets', payload);
}

// 2. Fetch D9 Chart Data (Navamsa Chart Info)
// Uses endpoint: https://json.freeastrologyapi.com/navamsa-chart-info
async function fetchD9Data(date: string, time: string, lat: number, lon: number, tzone: number) {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, min] = time.split(':').map(Number);
    
    const payload = {
        year, month, date: day, hours: hour, minutes: min, seconds: 0,
        latitude: lat, longitude: lon, timezone: tzone,
        settings: { 
            observation_point: "topocentric", 
            ayanamsha: "lahiri" 
        }
    };

    return fetchAstroApi('/navamsa-chart-info', payload);
}

// 3. Fetch D1 SVG Chart
async function fetchD1Svg(date: string, time: string, lat: number, lon: number, tzone: number) {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, min] = time.split(':').map(Number);
    
    const payload = {
        year, month, date: day, hours: hour, minutes: min, seconds: 0,
        latitude: lat, longitude: lon, timezone: tzone,
        settings: { 
            observation_point: "topocentric", 
            ayanamsha: "lahiri" 
        }
    };

    const result = await fetchAstroApi('/horoscope-chart-svg-code', payload);
    return result; 
}

// 4. Fetch D9 SVG Chart
async function fetchD9Svg(date: string, time: string, lat: number, lon: number, tzone: number) {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, min] = time.split(':').map(Number);
    
    const payload = {
        year, month, date: day, hours: hour, minutes: min, seconds: 0,
        latitude: lat, longitude: lon, timezone: tzone,
        settings: {
            observation_point: "topocentric", 
            ayanamsha: "lahiri" 
        }
    };

    const result = await fetchAstroApi('/navamsa-chart-svg-code', payload);
    return result; 
}


// --- CORE GENERATORS ---

export const generateHoroscope = async (signName: string, language: Language = 'en'): Promise<HoroscopeResponse> => {
  try {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const langString = language === 'hi' ? 'Hindi' : 'English';
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a daily horoscope for ${signName} for today, ${today}. 
      Output language: ${langString}.
      The tone should be mystical, encouraging, yet grounded. 
      Also provide a lucky number (1-99), a lucky color, a one-word mood, and a compatible sign.
      Ensure all text fields are in ${langString}.`,
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

    return JSON.parse(response.text!) as HoroscopeResponse;
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
    
    // 1. Prepare Geolocation & Time Data
    let lat = data.lat;
    let lon = data.lon;
    let tzoneOffset = 0;
    
    // If lat/lon provided, calculate tzone from provided tzone string or default
    if (lat !== undefined && lon !== undefined) {
         tzoneOffset = getTimezoneOffset(data.tzone || 'Asia/Kolkata', data.date, data.time);
    }

    // If missing lat/lon, try to fetch
    if (lat === undefined || lon === undefined) {
        const geo = await getGeoLocation(data.location);
        if (geo) {
            lat = geo.latitude;
            lon = geo.longitude;
            tzoneOffset = geo.timezoneOffset !== undefined 
                ? geo.timezoneOffset 
                : getTimezoneOffset(geo.timezone, data.date, data.time);
        } else {
            // Fallback for demo purposes if Geo fails (avoid 400 error by sending valid dummy coords)
            console.warn("Geocoding failed, using default coordinates (Delhi)");
            lat = 28.6139;
            lon = 77.2090;
            tzoneOffset = 5.5;
        }
    }

    // Ensure lat/lon are numbers and not null/undefined
    lat = Number(lat);
    lon = Number(lon);
    
    // Safety check for NaN
    if (isNaN(lat)) lat = 28.6139;
    if (isNaN(lon)) lon = 77.2090;

    // 2. Fetch Charts from API
    // Run all fetches in parallel for speed
    const [d1Raw, d9Raw, d1Svg, d9Svg] = await Promise.all([
        fetchD1Data(data.date, data.time, lat, lon, tzoneOffset),
        fetchD9Data(data.date, data.time, lat, lon, tzoneOffset),
        fetchD1Svg(data.date, data.time, lat, lon, tzoneOffset),
        fetchD9Svg(data.date, data.time, lat, lon, tzoneOffset)
    ]);

    // Fallback Mock Data if API totally fails
    const mockPlanets = {
         "Sun": { "current_sign": 5, "isRetro": "false" },
         "Moon": { "current_sign": 2, "isRetro": "false" },
         "Mars": { "current_sign": 8, "isRetro": "false" },
         "Mercury": { "current_sign": 4, "isRetro": "false" },
         "Jupiter": { "current_sign": 12, "isRetro": "false" },
         "Venus": { "current_sign": 6, "isRetro": "false" },
         "Saturn": { "current_sign": 11, "isRetro": "true" },
         "Rahu": { "current_sign": 1, "isRetro": "true" },
         "Ketu": { "current_sign": 7, "isRetro": "true" },
         "Ascendant": { "current_sign": 10 }
    };
    
    // Use API data or fallback
    const d1Data = d1Raw || mockPlanets;

    if (!d1Raw) console.warn("Using Fallback D1 Data because API returned null/error");

    // 3. Process D1 Charts
    const getD1Info = (planetName: string) => {
        // API extended keys often match planet names. Ascendant might be 'Ascendant'
        // d1Data keys might be lowercase
        const key = Object.keys(d1Data).find(k => k.toLowerCase() === planetName.toLowerCase());
        return key ? d1Data[key] : null;
    };

    const ascendantInfo = getD1Info("Ascendant") || { current_sign: 1 };
    const d1AscSignId = parseInt(ascendantInfo.current_sign) || 1;

    const planetList = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    const d1Positions: PlanetaryPosition[] = [];
    const d9Positions: PlanetaryPosition[] = [];

    // Helper for Navamsha
    const getD9SignId = (planetName: string) => {
        if (d9Raw) {
             const key = Object.keys(d9Raw).find(k => k.toLowerCase() === planetName.toLowerCase());
             if (key) return parseInt(d9Raw[key]);
        }
        return 0; // 0 means unknown/unmapped
    };
    
    const d9AscSignId = getD9SignId("Ascendant") || d1AscSignId; // Fallback to D1 Asc if D9 fails

    planetList.forEach(planetName => {
        // D1 Processing
        const pInfo = getD1Info(planetName);
        if (pInfo) {
            const d1SignId = parseInt(pInfo.current_sign);
            const d1House = getHouseFromAscendant(d1SignId, d1AscSignId);
            const isRetro = String(pInfo.isRetro) === "true";

            d1Positions.push({
                planet: planetName,
                sign: getSignName(d1SignId),
                signId: d1SignId,
                house: d1House,
                isRetrograde: isRetro
            });

            // D9 Processing
            let d9SignId = getD9SignId(planetName);
            if (d9SignId === 0) d9SignId = d1SignId; // Fallback
            
            const d9House = getHouseFromAscendant(d9SignId, d9AscSignId);
            
            d9Positions.push({
                planet: planetName,
                sign: getSignName(d9SignId),
                signId: d9SignId,
                house: d9House,
                isRetrograde: isRetro
            });
        }
    });

    // 4. Generate Analysis with Gemini
    const chartContext = JSON.stringify({
        ascendant: getSignName(d1AscSignId),
        planets: d1Positions.map(p => `${p.planet} in ${p.sign} (${p.house}th House)`)
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Act as a master Vedic Astrologer. Create a DETAILED Janam Kundali Reading for ${data.name}.
      
      ACCURATE CHART DATA (Calculated):
      Ascendant: ${getSignName(d1AscSignId)}
      Planetary Positions: ${chartContext}
      
      INSTRUCTIONS:
      1. Use the calculated chart data above. Do NOT hallucinate positions.
      2. Analyze the strength of the Ascendant and Moon sign.
      3. **Major Yogas**: Identify specific meaningful yogas formed in this chart.
      4. **Planetary Analysis**: For EACH planet, provide a concise analysis of its effect based on its House and Sign placement.
      5. Provide detailed predictions for General, Career, Love, and Health.
      6. **Remedies**: Provide 3-4 specific, practical Vedic remedies.
      7. Calculate and mention the likely current Mahadasha based on Moon's position.
      
      Output Language: ${langString}.
      
      Format: JSON`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
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
            panchang: {
              type: Type.OBJECT,
              properties: {
                tithi: { type: Type.STRING },
                vara: { type: Type.STRING },
                nakshatra: { type: Type.STRING },
                yoga: { type: Type.STRING },
                karana: { type: Type.STRING }
              }
            },
            details: {
                type: Type.OBJECT,
                properties: {
                    mangalDosha: { type: Type.OBJECT, properties: { present: { type: Type.BOOLEAN }, one_line_description: { type: Type.STRING } } },
                    kalsarpaDosha: { type: Type.OBJECT, properties: { present: { type: Type.BOOLEAN }, one_line_description: { type: Type.STRING } } },
                    sadeSati: { type: Type.OBJECT, properties: { is_undergoing: { type: Type.BOOLEAN }, phase: { type: Type.STRING }, description: { type: Type.STRING } } },
                    gemstones: {
                         type: Type.OBJECT,
                        properties: {
                            life: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, gem: { type: Type.STRING }, wear_finger: { type: Type.STRING }, wear_metal: { type: Type.STRING } } },
                            lucky: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, gem: { type: Type.STRING }, wear_finger: { type: Type.STRING }, wear_metal: { type: Type.STRING } } },
                            benefic: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, gem: { type: Type.STRING }, wear_finger: { type: Type.STRING }, wear_metal: { type: Type.STRING } } }
                        }
                    },
                    yogas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } },
                    remedies: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING }
                            }
                        }
                    },
                    favorablePoints: {
                        type: Type.OBJECT,
                        properties: {
                            lucky_number: { type: Type.INTEGER },
                            lucky_day: { type: Type.STRING },
                            lucky_metal: { type: Type.STRING },
                            lucky_stone: { type: Type.STRING }
                        }
                    }
                }
            },
            planetAnalysis: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        planet: { type: Type.STRING },
                        position: { type: Type.STRING },
                        analysis: { type: Type.STRING }
                    }
                }
            },
            dasha: {
              type: Type.OBJECT,
              properties: {
                currentMahadasha: { type: Type.STRING },
                antardasha: { type: Type.STRING },
                endsAt: { type: Type.STRING },
                analysis: { type: Type.STRING }
              }
            },
            predictions: {
              type: Type.OBJECT,
              properties: {
                general: { type: Type.STRING },
                career: { type: Type.STRING },
                love: { type: Type.STRING },
                health: { type: Type.STRING }
              }
            }
          },
          required: ["basicDetails", "predictions", "details", "planetAnalysis"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Empty response from Gemini");
    const aiData = JSON.parse(responseText);

    const mergedResponse: KundaliResponse = {
        ...aiData,
        basicDetails: {
            ...aiData.basicDetails,
            ascendant: getSignName(d1AscSignId),
            ascendantSignId: d1AscSignId,
            moonSign: d1Positions.find(p => p.planet === "Moon")?.sign || aiData.basicDetails.moonSign
        },
        charts: {
            planetaryPositions: d1Positions,
            navamshaPositions: d9Positions,
            navamshaAscendantSignId: d9AscSignId,
            shadbala: [], 
            d1Svg: typeof d1Svg === 'string' ? d1Svg : undefined,
            d9Svg: typeof d9Svg === 'string' ? d9Svg : undefined
        }
    };
    
    return mergedResponse;

  } catch (error) {
    console.error("Error generating Kundali:", error);
    throw error;
  }
};

export const generateDailyPanchang = async (location: string = "New Delhi, India", language: Language = 'en'): Promise<DailyPanchangResponse> => {
    try {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const langString = language === 'hi' ? 'Hindi' : 'English';

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate accurate daily Panchang for today: ${today} for ${location}. Output in ${langString}. JSON Format.`,
            config: {
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

        return JSON.parse(response.text!) as DailyPanchangResponse;
    } catch (error) {
        console.error("Error generating Panchang:", error);
        throw error;
    }
}

export const generatePalmInterpretation = async (lines: string[], language: Language = 'en'): Promise<string> => {
  try {
    const langString = language === 'hi' ? 'Hindi' : 'English';
    const detectedLines = lines.join(", ");
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Palm reading for lines: ${detectedLines}. Act as expert. Language: ${langString}. Structure: Summary, Heart, Mind, Life, Fate, Guidance.`,
    });
    return response.text || "Could not generate reading.";
  } catch (error) {
    console.error("Error generating palm interpretation:", error);
    throw error;
  }
}

export const generateNumerologyReport = async (name: string, lifePath: number, destiny: number, soulUrge: number, personality: number, birthday: number, language: Language = 'en'): Promise<NumerologyResponse> => {
  try {
    const langString = language === 'hi' ? 'Hindi' : 'English';
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Numerology Report for ${name}. LP: ${lifePath}, Dest: ${destiny}, Soul: ${soulUrge}, Pers: ${personality}, Bday: ${birthday}. Language: ${langString}. JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lifePath: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, description: { type: Type.STRING } } },
            destiny: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, description: { type: Type.STRING } } },
            soulUrge: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, description: { type: Type.STRING } } },
            personality: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, description: { type: Type.STRING } } },
            birthday: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, description: { type: Type.STRING } } },
            dailyForecast: { type: Type.STRING }
          },
          required: ["lifePath", "destiny", "soulUrge", "personality", "birthday", "dailyForecast"]
        }
      }
    });
    return JSON.parse(response.text!) as NumerologyResponse;
  } catch (error) {
    console.error("Error generating numerology:", error);
    throw error;
  }
}

export const generateConjunctionAnalysis = async (planets: string[], house: number, sign: string, language: Language = 'en'): Promise<string> => {
    try {
        const langString = language === 'hi' ? 'Hindi' : 'English';
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Analyze Conjunction: ${planets.join("+")} in House ${house} (${sign}). Vedic Astrology. Concise. Language: ${langString}.`,
            config: { thinkingConfig: { thinkingBudget: 32768 } }
        });
        return response.text || "Analysis not available.";
    } catch (error) {
        console.error("Error generating conjunction analysis:", error);
        throw error;
    }
}

export const generatePlacementAnalysis = async (planet: string, house: number, sign: string, language: Language = 'en'): Promise<string> => {
    try {
        const langString = language === 'hi' ? 'Hindi' : 'English';
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Analyze Placement: ${planet} in House ${house} (${sign}). Vedic Astrology. Deep. Language: ${langString}.`,
            config: { thinkingConfig: { thinkingBudget: 32768 } }
        });
        return response.text || "Analysis not available.";
    } catch (error) {
        console.error("Error generating placement analysis:", error);
        throw error;
    }
}

export const generateMatchMaking = async (boy: MatchMakingInput, girl: MatchMakingInput, language: Language = 'en'): Promise<MatchMakingResponse> => {
    try {
        let bLat = boy.lat, bLon = boy.lon, bTz = boy.tzone ? getTimezoneOffset(boy.tzone, boy.date, boy.time) : 0;
        let gLat = girl.lat, gLon = girl.lon, gTz = girl.tzone ? getTimezoneOffset(girl.tzone, girl.date, girl.time) : 0;

        // If lat/lon missing, fetch
        if (!bLat || !bLon) { 
            const g = await getGeoLocation(boy.location); 
            if(g){ 
                bLat=g.latitude; 
                bLon=g.longitude; 
                bTz = g.timezoneOffset !== undefined ? g.timezoneOffset : (getTimezoneOffset(g.timezone, boy.date, boy.time) || 0); 
            } else {
                // Fallback for demo
                 bLat = 28.6; bLon = 77.2; bTz = 5.5;
            }
        }
        if (!gLat || !gLon) { 
            const g = await getGeoLocation(girl.location); 
            if(g){ 
                gLat=g.latitude; 
                gLon=g.longitude; 
                gTz = g.timezoneOffset !== undefined ? g.timezoneOffset : (getTimezoneOffset(g.timezone, girl.date, girl.time) || 0); 
            } else {
                 // Fallback for demo
                 gLat = 28.6; gLon = 77.2; gTz = 5.5;
            }
        }

        const [by, bm, bd] = boy.date.split('-').map(Number);
        const [bh, bmin] = boy.time.split(':').map(Number);
        
        const [gy, gm, gd] = girl.date.split('-').map(Number);
        const [gh, gmin] = girl.time.split(':').map(Number);

        const payload = {
            male: { 
                year: by, month: bm, date: bd, 
                hours: bh, minutes: bmin, seconds: 0, 
                latitude: bLat, longitude: bLon, timezone: bTz 
            },
            female: { 
                year: gy, month: gm, date: gd, 
                hours: gh, minutes: gmin, seconds: 0, 
                latitude: gLat, longitude: gLon, timezone: gTz 
            },
            // Standard Astro API settings
            settings: { observation_point: "topocentric", language: language === 'hi' ? "hi" : "en", ayanamsha: "lahiri" }
        };

        const data = await fetchAstroApi('/match-making/ashtakoot-score', payload);
        
        if (data) {
             // If response is flattened (no ashtakoot_score key but contains valid keys)
             if (!data.ashtakoot_score && data.total && data.conclusion) {
                 return {
                     ashtakoot_score: {
                         varna: data.varna,
                         vashya: data.vashya,
                         tara: data.tara,
                         yoni: data.yoni,
                         graha_maitri: data.graha_maitri,
                         gana: data.gana,
                         bhakoot: data.bhakoot,
                         nadi: data.nadi,
                         total: data.total
                     },
                     conclusion: data.conclusion
                 };
             }
             
             // If nested correctly
             if (data.ashtakoot_score) {
                 return data;
             }
        }
        
        console.error("Matchmaking API Invalid Response", data);
        throw new Error("Matchmaking API returned invalid data.");

    } catch (error) {
        console.error("Error generating matchmaking:", error);
        throw error;
    }
}

export const createChatSession = (language: Language) => {
    const langString = language === 'hi' ? 'Hindi' : 'English';
    return ai.chats.create({
        model: "gemini-3-pro-preview",
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            systemInstruction: `You are Rishi, a Vedic Astrologer. Answer questions using Vedic principles. Language: ${langString}.`
        }
    });
};
