import React, { useState } from 'react';
import { KundaliFormData, Language } from '../types';
import { useTranslation } from '../utils/translations';

interface KundaliFormProps {
  onSubmit: (data: KundaliFormData) => void;
  isLoading: boolean;
  language: Language;
  savedCharts?: KundaliFormData[];
  onLoadChart?: (data: KundaliFormData) => void;
  onDeleteChart?: (id: string) => void;
  onGetDaily?: (data: KundaliFormData) => void;
}

const COMMON_CITIES = [
  "New Delhi, India", "Mumbai, India", "Bangalore, India", "Chennai, India", "Kolkata, India", 
  "Hyderabad, India", "Pune, India", "Ahmedabad, India", "Jaipur, India", "Lucknow, India",
  "Patna, India", "Indore, India", "Bhopal, India", "Chandigarh, India", "Varanasi, India",
  "New York, USA", "London, UK", "Toronto, Canada", "Dubai, UAE", "Singapore", "Sydney, Australia"
];

const KundaliForm: React.FC<KundaliFormProps> = ({ 
    onSubmit, 
    isLoading, 
    language, 
    savedCharts = [], 
    onLoadChart,
    onDeleteChart,
    onGetDaily
}) => {
  const t = useTranslation(language);
  const [formData, setFormData] = useState<KundaliFormData>({
    name: '',
    date: '',
    time: '',
    location: '',
    lat: undefined,
    lon: undefined,
    tzone: undefined
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // If user manually types location, clear the precise coordinates to force re-geocoding
    if (name === 'location') {
        setFormData(prev => ({ ...prev, location: value, lat: undefined, lon: undefined, tzone: undefined }));
        setShowSuggestions(true);
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const selectCity = (city: string) => {
    setFormData(prev => ({ ...prev, location: city, lat: undefined, lon: undefined, tzone: undefined }));
    setShowSuggestions(false);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            // Use Open-Meteo Reverse Geocoding to get City Name and Timezone
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const place = data.results[0];
                const locationName = `${place.name}, ${place.country}`;
                setFormData(prev => ({
                    ...prev,
                    location: locationName,
                    lat: latitude,
                    lon: longitude,
                    tzone: place.timezone
                }));
            } else {
                // Fallback if no name found, just use coordinates string
                setFormData(prev => ({
                    ...prev,
                    location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                    lat: latitude,
                    lon: longitude
                }));
            }
        } catch (error) {
            console.error("Reverse geocoding failed", error);
            // Still set lat/lon even if name lookup fails
            setFormData(prev => ({
                ...prev,
                location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                lat: latitude,
                lon: longitude
            }));
        } finally {
            setIsDetecting(false);
        }
    }, (error) => {
        console.error("Geolocation error", error);
        alert("Unable to retrieve your location. Please check permissions.");
        setIsDetecting(false);
    }, { enableHighAccuracy: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.time || !formData.location) return;
    onSubmit(formData);
  };

  const filteredCities = COMMON_CITIES.filter(city => 
    city.toLowerCase().includes(formData.location.toLowerCase()) && 
    formData.location.length > 0 && 
    city !== formData.location
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 animate-fade-in flex flex-col md:flex-row gap-8 items-start">
      
      {/* Saved Charts Section - Only visible if there are charts */}
      {savedCharts.length > 0 && (
          <div className="w-full md:w-1/3 space-y-4">
              <h3 className="text-xl font-serif text-amber-200 pl-2">Saved Profiles</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {savedCharts.map((chart) => (
                      <div key={chart.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 hover:border-amber-500/50 transition-all">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <h4 className="font-bold text-slate-200">{chart.name}</h4>
                                  <p className="text-xs text-slate-500">{chart.date} • {chart.location}</p>
                              </div>
                              <button 
                                onClick={() => onDeleteChart && chart.id && onDeleteChart(chart.id)}
                                className="text-slate-600 hover:text-red-400 p-1"
                              >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                          </div>
                          <div className="flex gap-2 mt-3">
                              <button 
                                onClick={() => onLoadChart && onLoadChart(chart)}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-xs py-2 rounded text-slate-200 transition-colors"
                              >
                                  View Chart
                              </button>
                              <button 
                                onClick={() => onGetDaily && onGetDaily(chart)}
                                className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 text-xs py-2 rounded transition-colors"
                              >
                                  Daily Forecast
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Main Form */}
      <div className={`w-full ${savedCharts.length > 0 ? 'md:w-2/3' : 'md:w-full max-w-xl mx-auto'}`}>
        <div className="bg-slate-800/60 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            {/* Background Mandala Effect */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-amber-100 mb-2">{t.formTitle}</h2>
            <p className="text-slate-400 text-sm">{t.formSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-amber-500/80 font-bold ml-1">{t.fullName}</label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={language === 'hi' ? "उदाहरण: अदिति राव" : "e.g. Aditi Rao"}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-amber-500/80 font-bold ml-1">{t.dob}</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all [color-scheme:dark]"
                    required
                />
                </div>

                <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-amber-500/80 font-bold ml-1">{t.tob}</label>
                <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all [color-scheme:dark]"
                    required
                />
                </div>
            </div>

            <div className="space-y-2 relative">
                <label className="text-xs uppercase tracking-wider text-amber-500/80 font-bold ml-1 flex justify-between">
                    {t.pob}
                    {formData.lat && <span className="text-emerald-400 text-[10px] bg-emerald-900/30 px-2 rounded-full border border-emerald-500/30">GPS Active</span>}
                </label>
                <div className="relative">
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder={t.pobPlaceholder}
                        className={`w-full bg-slate-900/50 border ${formData.lat ? 'border-emerald-500/50' : 'border-slate-600'} rounded-lg px-4 py-3 pr-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all`}
                        autoComplete="off"
                        required
                    />
                    <button
                        type="button"
                        onClick={handleDetectLocation}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-amber-400 transition-colors"
                        title="Detect precise location"
                        disabled={isDetecting}
                    >
                        {isDetecting ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </button>
                </div>
                {showSuggestions && filteredCities.length > 0 && (
                <ul className="absolute z-50 w-full bg-slate-800 border border-slate-600 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-xl">
                    {filteredCities.map((city, idx) => (
                    <li 
                        key={idx} 
                        onClick={() => selectCity(city)}
                        className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-slate-200 text-sm"
                    >
                        {city}
                    </li>
                    ))}
                </ul>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-serif font-bold py-4 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
                {isLoading ? t.loadingButton : t.submitButton}
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default KundaliForm;