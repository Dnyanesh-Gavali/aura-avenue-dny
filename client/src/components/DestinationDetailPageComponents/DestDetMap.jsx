import React from "react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in React
import icon from "../location.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";


let deafualtIcons = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [45, 40],
    iconAnchor: [12, 40]
})

L.Marker.prototype.options.icon = deafualtIcons

const DestDetMap = ({ locationName, caption }) => {

    const [coordinates, setCoordinates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchCoords = async () => {
            if (!locationName) return;
            setLoading(true)

            try {
                // Using Photon by Komoot (Free, No API Key)
                const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(locationName)}&limit=1`)
                const data = await res.json();


                if (data.features && data.features.length > 0) {
                    // Photon returns GeoJSON: [longitude, latitude]
                    const [lon, lat] = data.features[0].geometry.coordinates;
                    setCoordinates([lat, lon]);
                }

                else {
                    setError("Coordinates not found for this location.");
                }
            }

            catch (error) {
                console.error("Geocoding error:", error);
                setError("Failed to load map data.");
            }

            finally {
                setLoading(false);
            }
        }

        fetchCoords();
    }, [locationName])

    if (loading) {
        return (
            <div className="flex h-[450px] items-center justify-center rounded-2xl bg-gray-100 shadow">
                <h2 className="text-xl font-bold text-gray-500 animate-pulse">Loading Map...</h2>
            </div>
        );
    }

    if (error || !coordinates) {
        return (
            <div className="flex h-[450px] items-center justify-center rounded-2xl bg-gray-100 shadow">
                <h2 className="text-xl font-bold text-red-400">{error || "Map Unavailable"}</h2>
            </div>
        );
    }

    return (
        <div className="h-[450px] w-full overflow-hidden rounded-2xl shadow-lg relative z-0">
            <MapContainer center={coordinates} zoom={12} scrollWheelZoom={true} touchZoom={true} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coordinates}>
                    <Popup>
                        <div className="max-w-[250px] p-1 text-center">
                            <h3 className="mb-0 text-2xl font-bold text-gray-800 leading-tight">
                                {locationName}
                            </h3>
                            {caption && (
                                <p className="text-lg font-medium text-gray-600 italic">
                                    {caption}
                                </p>
                            )}
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

        </div>
    );
};

export default DestDetMap;