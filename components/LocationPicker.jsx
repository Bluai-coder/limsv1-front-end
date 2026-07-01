"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2, X, MapPin, Navigation } from "lucide-react";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function LocationMarker({ position, setPosition, mapRef }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      map.flyTo([lat, lng], 18);
    },
  });

  useEffect(() => {
    if (mapRef) mapRef.current = map;
  }, [map, mapRef]);

  return position ? <Marker position={position} icon={customIcon} /> : null;
}

// Enhanced known locations
const KNOWN_LOCATIONS = {
  "Center Plaza Emaar": { lat: 30.7333, lng: 76.7794 },
  "Sector 105": { lat: 30.7315, lng: 76.7755 },
  "CPM-17": { lat: 30.7333, lng: 76.7794 },
  "Mohali": { lat: 30.7333, lng: 76.7794 },
};

export default function LocationPicker({ 
  address, 
  onLocationSelect, 
  initialLat = null, 
  initialLng = null 
}) {
  const [position, setPosition] = useState(
    initialLat && initialLng 
      ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
      : { lat: 30.7333, lng: 76.7794 }
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef(null);

  // Enhanced location extraction
  const extractKnownLocation = (addr) => {
    if (!addr) return null;
    const upperAddr = addr.toUpperCase();
    
    for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
      if (upperAddr.includes(key.toUpperCase())) {
        return { key, coords };
      }
    }
    return null;
  };

  // Improved Geocoding
  const geocodeAddress = useCallback(async () => {
    if (!address || address.trim().length < 5) {
      const defaultPos = { lat: 30.7333, lng: 76.7794 };
      setPosition(defaultPos);
      onLocationSelect(defaultPos.lat, defaultPos.lng);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check known locations first
      const known = extractKnownLocation(address);
      if (known) {
        setPosition(known.coords);
        onLocationSelect(known.coords.lat, known.coords.lng);
        mapRef.current?.flyTo([known.coords.lat, known.coords.lng], 17);
        setIsLoading(false);
        return;
      }

      // 2. Try Nominatim with better query
      const query = `${address}, India`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
        `&format=json&limit=3&addressdetails=1&countrycodes=in`,
        {
          headers: { 'User-Agent': 'BluAI-TenantApp/1.0' }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const bestResult = data[0];
        const newPos = {
          lat: parseFloat(bestResult.lat),
          lng: parseFloat(bestResult.lon)
        };

        setPosition(newPos);
        onLocationSelect(newPos.lat, newPos.lng);

        if (mapRef.current) {
          mapRef.current.flyTo([newPos.lat, newPos.lng], 17);
        }
      } else {
        // Fallback
        const fallback = { lat: 30.7333, lng: 76.7794 };
        setPosition(fallback);
        onLocationSelect(fallback.lat, fallback.lng);
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      const fallback = { lat: 30.7333, lng: 76.7794 };
      setPosition(fallback);
      onLocationSelect(fallback.lat, fallback.lng);
    } finally {
      setIsLoading(false);
    }
  }, [address, onLocationSelect]);

  // Auto-geocode when address changes
  useEffect(() => {
    const timeoutId = setTimeout(geocodeAddress, 800);
    return () => clearTimeout(timeoutId);
  }, [geocodeAddress]);

  // Update parent when position changes
  useEffect(() => {
    onLocationSelect(position.lat, position.lng);
  }, [position, onLocationSelect]);

  // Search functionality (unchanged but cleaner)
  const searchLocation = async (query) => {
    if (!query || query.length < 2) return;

    setIsLoading(true);
    try {
      const known = extractKnownLocation(query);
      if (known) {
        setSearchResults([{
          display_name: known.key,
          lat: known.coords.lat,
          lon: known.coords.lng,
        }]);
        setShowResults(true);
        setIsLoading(false);
        return;
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", India")}&format=json&limit=5&countrycodes=in`,
        { headers: { 'User-Agent': 'BluAI-TenantApp/1.0' } }
      );
      const data = await res.json();
      setSearchResults(data || []);
      setShowResults(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => searchLocation(searchQuery), 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const newPos = { lat, lng };

    setPosition(newPos);
    setSearchQuery(result.display_name || "");
    setShowResults(false);
    onLocationSelect(lat, lng);
    mapRef.current?.flyTo([lat, lng], 17);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        onLocationSelect(newPos.lat, newPos.lng);
        mapRef.current?.flyTo([newPos.lat, newPos.lng], 17);
      },
      () => alert("Could not get your location")
    );
  };

  return (
    <div className="space-y-3">
      {/* Search Box */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location or known place..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4" /></button>}
          {isLoading && <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />}
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchResults.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSelectResult(r)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b last:border-0"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Buttons */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(KNOWN_LOCATIONS).slice(0, 3).map(([label, coords]) => (
          <button
            key={label}
            onClick={() => {
              setPosition(coords);
              onLocationSelect(coords.lat, coords.lng);
              mapRef.current?.flyTo([coords.lat, coords.lng], 17);
            }}
            className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full hover:bg-blue-200"
          >
            {label}
          </button>
        ))}
        <button onClick={getCurrentLocation} className="text-xs px-3 py-1 bg-green-100 text-green-600 rounded-full flex items-center gap-1">
          <Navigation className="w-3 h-3" /> My Location
        </button>
      </div>

      {/* Map */}
      <div className="relative">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={16}
          style={{ height: "400px", width: "100%", borderRadius: "12px" }}
          whenReady={() => setMapError(false)}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} mapRef={mapRef} />
        </MapContainer>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-1.5 rounded-full">
          {isLoading ? "🔍 Finding location..." : "📍 Click map to adjust"}
        </div>
      </div>

      {/* Coordinates Display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Latitude</p>
          <p className="font-mono font-semibold">{position.lat.toFixed(6)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Longitude</p>
          <p className="font-mono font-semibold">{position.lng.toFixed(6)}</p>
        </div>
      </div>
    </div>
  );
}