import React, { useEffect, useState } from "react";

// WMO Weather code mapper to descriptions and emojis
// A WMO weather code is a standardized numerical system created by the World Meteorological Organization 
// to report current weather conditions globally
const getWeatherInfo = (code) => {
    if (code === 0) return { label: "Clear Sky", emoji: "☀️" };
    if (code === 1 || code === 2) return { label: "Partly Cloudy", emoji: "⛅" };
    if (code === 3) return { label: "Overcast", emoji: "☁️" };
    if (code === 45 || code === 48) return { label: "Foggy", emoji: "🌫️" };
    if (code >= 51 && code <= 57) return { label: "Drizzle", emoji: "🌧️" };
    if (code >= 61 && code <= 67) return { label: "Rainy", emoji: "🌧️" };
    if (code >= 71 && code <= 77) return { label: "Snowy", emoji: "❄️" };
    if (code >= 80 && code <= 82) return { label: "Rain Showers", emoji: "🌦️" };
    if (code >= 85 && code <= 86) return { label: "Snow Showers", emoji: "🌨️" };
    if (code >= 95) return { label: "Thunderstorm", emoji: "⛈️" };
    return { label: "Moderate", emoji: "🌡️" };
};

const DestDetWeather = ({ locationName }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0 = Today

    useEffect(() => {
        const fetchWeatherData = async () => {
            if (!locationName) return;
            setLoading(true);
            setError(null);
                try {
                    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/destinations/weather?name=${encodeURIComponent(locationName)}`);
                const result = await res.json();

                if (result.success) {
                    setWeather(result.data);
                    setSelectedDayIndex(0); // Reset to Today on location change
                } else {
                    setError("Weather data unavailable for this location.");
                }
            } catch (err) {
                console.error("Failed to load weather data:", err);
                setError("Unable to connect to weather service.");
            } finally {
                setLoading(false);
            }
        };

        fetchWeatherData();
    }, [locationName]);

    if (loading) {
        return (
            <div className="my-8 rounded-3xl bg-emerald-50/60 p-8 shadow-sm text-center">
                <p className="text-lg font-semibold text-emerald-700 animate-pulse">Loading live weather data...</p>
            </div>
        );
    }

    if (error || !weather) return null;

    // Determine metrics for the currently selected day
    const isToday = selectedDayIndex === 0;
    const activeForecast = weather.forecast[selectedDayIndex];

    // UPDATED: Dynamically swap between Humidity (Live) and Rain Chance (Forecast)
    const displayInfo = isToday ? {
        title: "Live Weather Today",
        weatherCode: weather.current.weatherCode,
        tempDisplay: `${weather.current.temp}°C`,
        subTemp: `Feels like ${weather.current.feelsLike}°C`,
        metricLabel: "Humidity",
        metricValue: `${weather.current.humidity}%`,
        windSpeed: `${weather.current.windSpeed} km/h`
    } : {
        title: new Date(activeForecast.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
        weatherCode: activeForecast.weatherCode,
        tempDisplay: `${activeForecast.maxTemp}° / ${activeForecast.minTemp}°C`,
        subTemp: `High ${activeForecast.maxTemp}°C • Low ${activeForecast.minTemp}°C`,
        metricLabel: "Rain Chance",
        metricValue: `${activeForecast.rainChance}%`,
        windSpeed: `${activeForecast.windSpeed} km/h`
    };

    const activeWeather = getWeatherInfo(displayInfo.weatherCode);

    return (
        // 1. OUTER CANVAS: Very light slate background, padded to show orbs outside the card
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-400/60 shadow-xl my-10 p-6 sm:p-12 lg:p-16 isolate">
            
            {/* 2. THE ORBS: Darker colors (Indigo, Emerald, Purple) blurred softly into the light background */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-800 rounded-full mix-blend-multiply filter blur-[50px] opacity-90 -translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-[50px] opacity-70 translate-x-10 translate-y-10"></div>
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-900 rounded-full mix-blend-multiply filter blur-[90px] opacity-90 animate-pulse"></div>

            {/* 3. THE TRUE LIGHT GLASS CARD: Translucent white, strong backdrop blur, crisp dark text */}
            <section className="relative z-10 p-6 sm:p-10 bg-white/60 backdrop-blur-2xl border border-white/70 rounded-3xl text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-200/50">
                    
                    {/* Left: Location & Pill */}
                    <div className="text-center lg:text-left">
                        <span className="inline-block uppercase text-[10px] sm:text-xs tracking-widest font-bold bg-white/60 backdrop-blur-md border border-white px-4 py-1.5 rounded-full text-slate-600 shadow-sm">
                            {isToday ? "Live Weather" : "Forecast Detail"}
                        </span>
                        <h3 className="text-4xl sm:text-5xl font-extrabold mt-3 text-slate-900 tracking-tight">{weather.locationName}</h3>
                        <p className="text-slate-500 text-sm font-medium mt-2">{displayInfo.title} • {activeWeather.label}</p>
                    </div>

                    {/* Center: Main Temperature */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <span className="text-6xl sm:text-7xl transition-transform duration-500 hover:scale-110 hover:-rotate-6 drop-shadow-md">{activeWeather.emoji}</span>
                        <div className="text-left">
                            <span className="text-5xl sm:text-6xl font-black text-slate-800 tracking-tighter">{displayInfo.tempDisplay}</span>
                            <p className="text-sm text-slate-500 mt-1 font-medium">{displayInfo.subTemp}</p>
                        </div>
                    </div>

                    {/* Right: Inner Glass Metrics */}
                    <div className="flex gap-6 text-center bg-white/40 p-5 rounded-2xl backdrop-blur-sm border border-white/60 shadow-sm w-full lg:w-auto justify-center">
                        <div className="px-2">
                            <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">{displayInfo.metricLabel}</p>
                            <p className="text-xl font-extrabold text-slate-700">{displayInfo.metricValue}</p>
                        </div>
                        <div className="border-l border-slate-200/60 pl-6 pr-2">
                            <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Wind</p>
                            <p className="text-xl font-extrabold text-slate-700">{displayInfo.windSpeed}</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: 5-Day Forecast Grid */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-5">
                        <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">
                            5-Day Forecast <span className="text-slate-400 font-medium tracking-normal normal-case ml-2 hidden sm:inline-block">(Click a day to view details)</span>
                        </h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                        {weather.forecast.slice(0, 5).map((day, idx) => {
                            const dayInfo = getWeatherInfo(day.weatherCode);
                            const dayName = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
                            const isSelected = selectedDayIndex === idx;

                            return (
                                // Daily Forecast Interactive Glass Buttons
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDayIndex(idx)}
                                    className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 cursor-pointer text-center backdrop-blur-md focus:outline-none border ${
                                        isSelected
                                            ? "bg-white/80 border-white scale-105 shadow-md"
                                            : "bg-white/30 border-white/50 hover:bg-white/50 hover:border-white/80 hover:-translate-y-1 hover:shadow-sm"
                                    }`}
                                >
                                    <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? "text-slate-800" : "text-slate-500"}`}>
                                        {idx === 0 ? "Today" : dayName}
                                    </span>
                                    <span className="text-4xl my-3 drop-shadow-sm">{dayInfo.emoji}</span>
                                    <span className="text-sm font-bold text-slate-700">
                                        {day.maxTemp}° <span className="text-slate-400 font-medium">/ {day.minTemp}°</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DestDetWeather;