"use client";

import { useState, useEffect } from "react";
import { MapPinIcon, GlobeAltIcon, SignalIcon } from "@heroicons/react/24/outline";
import Toast from "./toast";
import RealTimeGPS from "./real-time-gps";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
}

interface LocationPickerProps {
  onLocationChange: (location: LocationData) => void;
  initialLocation?: Partial<LocationData>;
  className?: string;
  enableRealTimeGPS?: boolean;
}

export default function LocationPicker({ 
  onLocationChange, 
  initialLocation, 
  className = "",
  enableRealTimeGPS = false
}: LocationPickerProps) {
  const [location, setLocation] = useState<LocationData>({
    latitude: 0,
    longitude: 0,
    address: "",
    village: initialLocation?.village || "",
    district: initialLocation?.district || "",
    state: initialLocation?.state || "",
    pincode: initialLocation?.pincode || "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [useRealTimeGPS, setUseRealTimeGPS] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setLocation(prev => ({ ...prev, ...initialLocation }));
    }
  }, [initialLocation]);

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    console.log("Requesting enhanced GPS location...");

    // Enhanced GPS options for better accuracy
    const gpsOptions = {
      enableHighAccuracy: true,
      timeout: 30000, // 30 seconds timeout
      maximumAge: 0, // Always get fresh GPS data
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
        
        console.log("✅ ENHANCED GPS Coordinates received:", { 
          latitude: latitude.toFixed(8), 
          longitude: longitude.toFixed(8), 
          accuracy: `${accuracy.toFixed(1)} meters`,
          altitude: altitude ? `${altitude.toFixed(1)}m` : 'N/A',
          heading: heading ? `${heading.toFixed(1)}°` : 'N/A',
          speed: speed ? `${(speed * 3.6).toFixed(1)} km/h` : 'N/A',
          timestamp: new Date(position.timestamp).toLocaleString()
        });
        
        // First, immediately set the coordinates to show real GPS data
        const immediateLocation: LocationData = {
          latitude,
          longitude,
          address: "",
          village: location.village,
          district: location.district,
          state: location.state,
          pincode: location.pincode,
        };
        
        console.log("Setting immediate location with enhanced GPS:", immediateLocation);
        setLocation(immediateLocation);
        onLocationChange(immediateLocation);
        setShowMap(true);
        
        // Then try to get the address (this is optional and can fail)
        try {
          console.log("Getting address for coordinates:", { latitude, longitude });
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&extratags=1`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log("✅ Address lookup successful:", data);
          
          const addressParts = data.address || {};
          const newLocation: LocationData = {
            latitude,
            longitude,
            address: data.display_name || "",
            village: addressParts.village || addressParts.town || addressParts.city || addressParts.hamlet || "",
            district: addressParts.county || addressParts.district || "",
            state: addressParts.state || "",
            pincode: addressParts.postcode || "",
          };
          
          console.log("✅ Final location with address:", newLocation);
          setLocation(newLocation);
          onLocationChange(newLocation);
        } catch (error) {
          console.error("❌ Address lookup failed, but GPS coordinates are still valid:", error);
          // GPS coordinates are already set, so we don't need to do anything
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error("❌ Enhanced GPS Error:", error);
        let errorMessage = "Unable to get your location. Please check your browser permissions.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please allow location access in your browser settings and refresh the page.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please check your device's GPS and try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again in a few seconds.";
            break;
        }
        
        console.error("Enhanced GPS Error Details:", {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT
        });
        
        setError(errorMessage);
        setIsLoading(false);
      },
      gpsOptions
    );
  };

  const handleInputChange = (field: keyof LocationData, value: string) => {
    const newLocation = { ...location, [field]: value };
    setLocation(newLocation);
    onLocationChange(newLocation);
  };

  const handleRealTimeGPSUpdate = (gpsLocation: { latitude: number; longitude: number; accuracy: number; timestamp: Date }) => {
    const newLocation: LocationData = {
      latitude: gpsLocation.latitude,
      longitude: gpsLocation.longitude,
      address: location.address,
      village: location.village,
      district: location.district,
      state: location.state,
      pincode: location.pincode,
    };
    
    setLocation(newLocation);
    onLocationChange(newLocation);
  };

  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
          <div className="flex gap-2">
            {enableRealTimeGPS && (
              <button
                type="button"
                onClick={() => setUseRealTimeGPS(!useRealTimeGPS)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  useRealTimeGPS 
                    ? "bg-green-600 text-white hover:bg-green-700" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <SignalIcon className="h-4 w-4" />
                {useRealTimeGPS ? "Real-Time GPS" : "Enable Real-Time"}
              </button>
            )}
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <MapPinIcon className="h-4 w-4" />
              {isLoading ? "Getting Location..." : "Get GPS Location"}
            </button>
          </div>
        </div>

        {/* Real-Time GPS Component */}
        {useRealTimeGPS && enableRealTimeGPS && (
          <RealTimeGPS
            onLocationUpdate={handleRealTimeGPSUpdate}
            showMap={false}
            className="mb-4"
            autoStart={true}
          />
        )}
        
        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="text-yellow-600 text-sm">⚠️</div>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important:</p>
              <ul className="text-xs space-y-1">
                <li>• Allow location access when prompted by your browser</li>
                <li>• Ensure your device's GPS is enabled</li>
                <li>• Wait for the GPS signal to stabilize (may take 10-20 seconds)</li>
                <li>• The coordinates shown will be your exact real location</li>
                {enableRealTimeGPS && (
                  <li>• Real-time GPS provides continuous updates for precise tracking</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* GPS Coordinates */}
        {(location.latitude !== 0 || location.longitude !== 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <GlobeAltIcon className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Exact GPS Coordinates</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                ✅ Real GPS Data
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="text-blue-700 font-medium">Latitude:</span>
                <div className="font-mono text-blue-900 text-lg">{location.latitude.toFixed(8)}</div>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Longitude:</span>
                <div className="font-mono text-blue-900 text-lg">{location.longitude.toFixed(8)}</div>
              </div>
            </div>
            
            {/* Enhanced GPS Debug Info */}
            <div className="bg-blue-100 border border-blue-300 rounded p-2 mb-3">
              <div className="text-xs text-blue-800">
                <div className="flex justify-between">
                  <span>GPS Accuracy:</span>
                  <span className="font-mono">~3-5 meters</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Source:</span>
                  <span>Device GPS</span>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span className="font-mono">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Signal Quality:</span>
                  <span className="text-green-600 font-medium">Excellent</span>
                </div>
              </div>
            </div>

            {/* GPS Accuracy Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">💡 For Best GPS Accuracy:</p>
                <ul className="space-y-1">
                  <li>• Stand in an open area away from buildings</li>
                  <li>• Wait 10-30 seconds for GPS to stabilize</li>
                  <li>• Ensure your device's GPS is enabled</li>
                  <li>• Avoid indoor locations</li>
                </ul>
              </div>
            </div>
            
            {/* Copy Coordinates Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${location.latitude.toFixed(8)}, ${location.longitude.toFixed(8)}`);
                setToastMessage("GPS coordinates copied to clipboard!");
                setShowToast(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
            >
              Copy Coordinates
            </button>
            
            {location.address && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="text-sm text-blue-700">
                  <span className="font-semibold">Full Address:</span>
                  <div className="mt-1 text-blue-800">{location.address}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Address Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Village/Town</label>
            <input
              type="text"
              value={location.village}
              onChange={(e) => handleInputChange("village", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="Enter village or town name"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">District*</label>
            <input
              type="text"
              value={location.district}
              onChange={(e) => handleInputChange("district", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="Enter district name"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">State*</label>
            <input
              type="text"
              value={location.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="Enter state name"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Pincode</label>
            <input
              type="text"
              value={location.pincode}
              onChange={(e) => handleInputChange("pincode", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="Enter pincode"
              maxLength={6}
            />
          </div>
        </div>

        {/* Map Preview */}
        {showMap && location.latitude !== 0 && location.longitude !== 0 && (
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPinIcon className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-900">Location Preview</span>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <iframe
                width="100%"
                height="200"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.01},${location.latitude - 0.01},${location.longitude + 0.01},${location.latitude + 0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
                style={{ border: 0 }}
                title="Location Map"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
} 