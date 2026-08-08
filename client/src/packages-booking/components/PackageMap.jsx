import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Import custom marker and Leaflet shadow
import icon from "../../components/location.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const customIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [45, 40],
    iconAnchor: [22, 40],
    popupAnchor: [0, -40]
});

// List of common country names to ignore as standalone marker locations
const COMMON_COUNTRIES = new Set([
    "india", "thailand", "indonesia", "switzerland", "uae", "maldives", 
    "france", "united kingdom", "uk", "greece", "turkey", "australia", 
    "united states", "usa", "japan", "vietnam", "malaysia", "sri lanka", 
    "canada", "peru", "brazil", "italy", "spain", "germany", "south africa", 
    "egypt", "morocco", "jordan", "iceland", "new zealand"
]);

const PackageMap = ({ locationString, country }) => {
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoordinates = async () => {
            if (!locationString) return;
            setLoading(true);

            // 1. Split location string into individual place names
            const rawPlaces = locationString
                .split(/[-&,]| and /i)
                .map(l => l.trim())
                .filter(Boolean);

            // 2. Filter out generic country names so we don't plot a pin for "India", "Thailand", etc.
            const targetCountryLower = country ? country.toLowerCase().trim() : "";
            const specificPlaces = rawPlaces.filter(place => {
                const lower = place.toLowerCase();
                if (targetCountryLower && lower === targetCountryLower) return false;
                if (COMMON_COUNTRIES.has(lower)) return false;
                return true;
            });

            // If string was ONLY a country name (e.g. "Maldives"), keep it as fallback
            const placesToQuery = specificPlaces.length > 0 ? specificPlaces : rawPlaces;

            const fetchedMarkers = [];

            // 3. Query Photon API using "Place, Country" for precise geocoding
            for (const place of placesToQuery) {
                try {
                    const searchQuery = country && !place.toLowerCase().includes(country.toLowerCase())
                        ? `${place}, ${country}`
                        : place;

                    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`);
                    const data = await res.json();
                    
                    if (data.features && data.features.length > 0) {
                        const [lon, lat] = data.features[0].geometry.coordinates;
                        fetchedMarkers.push({ name: place, coords: [lat, lon] });
                    }
                } catch (error) {
                    console.error(`Geocoding error for ${place}:`, error);
                }
            }

            setMarkers(fetchedMarkers);
            setLoading(false);
        };

        fetchCoordinates();
    }, [locationString, country]);

    if (loading) {
        return (
            <div className="flex h-full w-full min-h-[400px] items-center justify-center rounded-[24px] bg-slate-100 animate-pulse">
                <h2 className="text-xl font-bold text-gray-400">Loading Map...</h2>
            </div>
        );
    }

    if (markers.length === 0) {
        return (
            <div className="flex h-full w-full min-h-[400px] items-center justify-center rounded-[24px] bg-slate-100">
                <h2 className="text-xl font-bold text-red-400">Map Data Unavailable</h2>
            </div>
        );
    }

    const center = markers[0].coords;
    const zoomLevel = markers.length > 1 ? 6 : 9;

    return (
        <div className="h-full w-full min-h-[400px] rounded-[24px] overflow-hidden relative z-0 shadow-inner border border-gray-200">
            <MapContainer center={center} zoom={zoomLevel} scrollWheelZoom={true} className="h-full w-full min-h-[400px]">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {markers.map((marker, index) => (
                    <Marker key={index} position={marker.coords} icon={customIcon}>
                        <Popup>
                            <div className="text-center font-bold text-emerald-800 text-lg leading-tight">
                                {marker.name}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default PackageMap;