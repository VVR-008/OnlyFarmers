"use client";

import { useState, useEffect, useRef } from "react";
import { MapPinIcon, GlobeAltIcon, SignalIcon, ClockIcon } from "@heroicons/react/24/outline";
import Toast from "./toast";

interface RealTimeGPSProps {
  onLocationUpdate?: (location: { latitude: number; longitude: number; accuracy: number; timestamp: Date }) => void;
  showMap?: boolean;
  className?: string;
  autoStart?: boolean;
  updateInterval?: number; // in milliseconds
}

interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}

export default function RealTimeGPS({ 
  onLocationUpdate, 
  showMap = true, 
  className = "",
  autoStart = false,
  updateInterval = 10000 // 10 seconds default
}: RealTimeGPSProps) {
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [totalUpdates, setTotalUpdates] = useState(0);
  const watchIdRef = useRef<number | null>(null);

  // Start real-time GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsTracking(true);
    setError(null);
    setTotalUpdates(0);

    console.log("🚀 Starting real-time GPS tracking with enhanced accuracy...");

    // Enhanced GPS options for better accuracy
    const gpsOptions = {
      enableHighAccuracy: true,
      timeout: 30000, // 30 seconds timeout
      maximumAge: 0, // Always get fresh GPS data
    };

    // Use watchPosition for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
        const timestamp = new Date(position.timestamp);
        
        console.log("📍 Enhanced GPS update:", {
          latitude: latitude.toFixed(8),
          longitude: longitude.toFixed(8),
          accuracy: `${accuracy.toFixed(1)} meters`,
          altitude: altitude ? `${altitude.toFixed(1)}m` : 'N/A',
          heading: heading ? `${heading.toFixed(1)}°` : 'N/A',
          speed: speed ? `${(speed * 3.6).toFixed(1)} km/h` : 'N/A',
          timestamp: timestamp.toLocaleTimeString(),
          updateCount: totalUpdates + 1
        });

        const newLocation: GPSLocation = {
          latitude,
          longitude,
          accuracy,
          timestamp,
        };

        setCurrentLocation(newLocation);
        setLastUpdate(timestamp);
        setTotalUpdates(prev => prev + 1);

        // Try to get address for the first time or if accuracy improved
        if (!newLocation.address || accuracy < 10) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              newLocation.address = data.display_name || "";
              setCurrentLocation(newLocation);
            }
          } catch (error) {
            console.log("Address lookup failed, but GPS tracking continues");
          }
        }

        // Call the callback if provided
        if (onLocationUpdate) {
          onLocationUpdate(newLocation);
        }
      },
      (error) => {
        console.error("❌ Enhanced GPS Error:", error);
        let errorMessage = "GPS tracking failed. Please check your device settings.";
        
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
        setIsTracking(false);
      },
      gpsOptions
    );
  };

  // Stop real-time GPS tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    console.log("🛑 Stopped real-time GPS tracking");
  };

  // Auto-start tracking if enabled
  useEffect(() => {
    if (autoStart) {
      startTracking();
    }

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [autoStart]);

  const copyCoordinates = () => {
    if (currentLocation) {
      navigator.clipboard.writeText(
        `${currentLocation.latitude.toFixed(8)}, ${currentLocation.longitude.toFixed(8)}`
      );
      setToastMessage("GPS coordinates copied to clipboard!");
      setShowToast(true);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 5) return "text-green-600";
    if (accuracy <= 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getAccuracyText = (accuracy: number) => {
    if (accuracy <= 5) return "Excellent";
    if (accuracy <= 10) return "Good";
    if (accuracy <= 20) return "Fair";
    return "Poor";
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SignalIcon className={`h-5 w-5 ${isTracking ? 'text-green-600 animate-pulse' : 'text-gray-400'}`} />
            <h3 className="text-lg font-semibold text-gray-900">
              Real-Time GPS Tracking
            </h3>
            {isTracking && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                LIVE
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            {!isTracking ? (
              <button
                onClick={startTracking}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <MapPinIcon className="h-4 w-4" />
                Start Tracking
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <MapPinIcon className="h-4 w-4" />
                Stop Tracking
              </button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="text-blue-600 text-sm">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Real-Time GPS Features:</p>
              <ul className="text-xs space-y-1">
                <li>• Continuous location updates every few seconds</li>
                <li>• High-accuracy GPS positioning</li>
                <li>• Live accuracy monitoring</li>
                <li>• Automatic address lookup</li>
                <li>• Perfect for buyers to see exact farm locations</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* Live GPS Data */}
        {currentLocation && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <GlobeAltIcon className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-900">Live GPS Coordinates</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                ✅ Real-Time Data
              </span>
            </div>

            {/* Coordinates with enhanced display */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="text-gray-700 font-medium">Latitude:</span>
                <div className="font-mono text-gray-900 text-lg">{currentLocation.latitude.toFixed(8)}</div>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Longitude:</span>
                <div className="font-mono text-gray-900 text-lg">{currentLocation.longitude.toFixed(8)}</div>
              </div>
            </div>

            {/* Enhanced GPS Stats */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="bg-white border border-gray-200 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <SignalIcon className={`h-3 w-3 ${getAccuracyColor(currentLocation.accuracy)}`} />
                  <span className="text-xs text-gray-600">Accuracy</span>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {currentLocation.accuracy.toFixed(1)}m
                </div>
                <div className={`text-xs ${getAccuracyColor(currentLocation.accuracy)}`}>
                  {getAccuracyText(currentLocation.accuracy)}
                </div>
                {/* GPS Quality Indicator */}
                <div className="mt-1">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      currentLocation.accuracy <= 5 ? 'bg-green-500' :
                      currentLocation.accuracy <= 10 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-gray-500">
                      {currentLocation.accuracy <= 5 ? 'Excellent Signal' :
                       currentLocation.accuracy <= 10 ? 'Good Signal' :
                       'Poor Signal - Move to open area'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <ClockIcon className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-gray-600">Last Update</span>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {lastUpdate?.toLocaleTimeString() || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  {totalUpdates} updates
                </div>
                {/* Update Frequency */}
                <div className="mt-1">
                  <span className="text-xs text-green-600 font-medium">
                    Live Updates Active
                  </span>
                </div>
              </div>
            </div>

            {/* GPS Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">GPS Tips for Better Accuracy:</p>
                <ul className="space-y-1">
                  <li>• Move to an open area away from buildings</li>
                  <li>• Wait 10-30 seconds for GPS to stabilize</li>
                  <li>• Ensure your device's GPS is enabled</li>
                  <li>• Avoid indoor locations for best accuracy</li>
                </ul>
              </div>
            </div>

            {/* Address */}
            {currentLocation.address && (
              <div className="bg-white border border-gray-200 rounded p-2 mb-3">
                <div className="text-xs text-gray-600 mb-1">Address:</div>
                <div className="text-sm text-gray-900">{currentLocation.address}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={copyCoordinates}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                Copy Coordinates
              </button>
              {onLocationUpdate && (
                <button
                  onClick={() => onLocationUpdate(currentLocation)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                >
                  Use This Location
                </button>
              )}
            </div>
          </div>
        )}

        {/* Map Display */}
        {showMap && currentLocation && (
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPinIcon className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-900">Live Location Map</span>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <iframe
                width="100%"
                height="300"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.longitude - 0.01},${currentLocation.latitude - 0.01},${currentLocation.longitude + 0.01},${currentLocation.latitude + 0.01}&layer=mapnik&marker=${currentLocation.latitude},${currentLocation.longitude}`}
                style={{ border: 0 }}
                title="Live Location Map"
              />
            </div>
          </div>
        )}

        {/* Status */}
        {isTracking && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-800 font-medium">
                GPS tracking active - Updates every few seconds
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 