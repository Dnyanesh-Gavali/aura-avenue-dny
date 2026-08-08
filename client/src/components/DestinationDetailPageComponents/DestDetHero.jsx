import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const getWeatherEmoji = (code) => {
    if (code === 0) return "☀️";
    if (code === 1 || code === 2) return "⛅";
    if (code === 3) return "☁️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 95) return "🌩️";
    return "🌤️";
};

const DestDetHero = ({
    heroImage,
    name,
    country,
    caption,
    rating,
}) => {

    const navigate = useNavigate();
    const [weather, setWeather] = useState(null);

    // Fetch live weather widget data for Hero
    useEffect(() => {
        if (!name) return;
        fetch(`${import.meta.env.VITE_SERVER_URL}/api/destinations/weather?name=${encodeURIComponent(name)}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setWeather(data.data.current);
            })
            .catch((err) => console.error("Hero weather error:", err));
    }, [name]);

    return (
        <section
            className="relative h-[80vh] min-h-[520px] w-full bg-cover bg-center overflow-hidden transition-all duration-500"
            style={{ backgroundImage: `url(${heroImage})` }}
        >
            {/* Dark gradient mask at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />

            {/* Top Navigation / Back Button */}
            <div className="absolute top-20 left-6 sm:left-12 z-20">
                <button
                    onClick={() => navigate('/destinations')}
                    className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur-md border border-white/20 hover:bg-black/60 transition cursor-pointer"
                >
                    ← Back to Destinations
                </button>
            </div>

            {/* Bottom Floating Container */}
            <div className="absolute bottom-10 left-0 right-0 z-10 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">

                {/* BOTTOM LEFT: City Name, Country & Tourism Caption */}
                <div className="max-w-2xl text-left text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="inline-block rounded-full bg-emerald-500/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md border border-emerald-400/30">
                            📍 {country || 'Global Destination'}
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-lg">
                        {name}
                    </h1>

                    <p className="mt-3 text-base sm:text-lg text-slate-200 line-clamp-2 leading-relaxed font-normal drop-shadow">
                        {caption || `Discover ${name} — a gorgeous destination offering rich culture, vibrant sights, and incredible travel experiences.`}
                    </p>
                </div>

                {/* BOTTOM RIGHT: Weather Badge */}
                {weather && (
                    <div className="self-start md:self-end">
                        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-xl border border-white/30 p-3.5 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-full text-white shadow-2xl hover:bg-white/25 transition-all duration-300">
                            <span className="text-3xl sm:text-4xl drop-shadow">
                                {getWeatherEmoji(weather.weatherCode)}
                            </span>
                            <div className="text-left pr-1">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl sm:text-3xl font-black">{weather.temp}°C</span>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                    Feels like {weather.feelsLike}° • {weather.humidity}% Hum
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default DestDetHero
