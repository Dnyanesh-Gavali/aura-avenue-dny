import React, { useState } from 'react'
import DestDetAbout from "./DestDetAbout"
import DestDetGallery from "./DestDetGallery"
import DestDetWeather from './DestDetWeather'
import DestDetMap from "./DestDetMap"

const DestDetTabs = ({ aboutText, locationName, caption }) => {
    const [activeTab, setActiveTab] = useState("about");

    const tabs = [
        { id: "about", label: "About" },
        { id: "map", label: "Map" },
        { id: "weather", label: "Weather" },
    ];
    return (
        <div>
            {/* 1. Added bg-slate-100 to intensify the glass/neumorphic effects */}
            <section className='bg-slate-100 min-h-screen'>

                {/* 2. Glassmorphism Sticky Header */}
                <div className='sticky top-14 z-30 bg-slate-100/40 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.05)]'>
                    <div className="mx-auto flex items-center justify-center gap-6 overflow-x-auto px-4 py-5 max-w-7xl no-scrollbar">
                        {tabs.map((tab) => (

                            /* 3. Neumorphic Buttons */
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`cursor-pointer rounded-full px-8 py-2.5 font-bold tracking-wide transition-all duration-300
                            ${activeTab === tab.id
                                        ? "bg-slate-100 text-emerald-500 shadow-[inset_5px_5px_10px_#cbd5e1,inset_-5px_-5px_10px_#ffffff]" // PRESSED IN STATE
                                        : "bg-slate-100 text-slate-500 shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff] hover:shadow-[2px_2px_5px_#cbd5e1,-2px_-2px_5px_#ffffff]" // RAISED OUT STATE
                                    }
                        `}
                            >
                                {tab.label}
                            </button>

                        ))}
                    </div>
                </div>

                {/* Tab content */}
                <div className='mx-auto max-w-7xl px-6 py-10'>
                    {activeTab === "about" && <DestDetAbout aboutText={aboutText} locationName={locationName} />}
                    {activeTab === "map" && <DestDetMap locationName={locationName} caption={caption} />}
                    {activeTab === "weather" && <DestDetWeather locationName={locationName} />}
                </div>
            </section>
        </div>
    )
}

export default DestDetTabs
