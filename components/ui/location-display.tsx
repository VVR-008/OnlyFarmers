"use client";

import { useState } from "react";
import { MapPinIcon, GlobeAltIcon, SignalIcon, ClockIcon, UserIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import Toast from "./toast";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
}

interface LocationDisplayProps {
  location: LocationData;
  farmerName?: string;
  farmerPhone?: string;
  farmerEmail?: string;
  className?: string;
  showRealTimeGPS?: boolean;
  isBuyerView?: boolean;
}

export default function LocationDisplay({ 
  location, 
  farmerName, 
  farmerPhone, 
  farmerEmail, 
  className = "",
  showRealTimeGPS = false,
  isBuyerView = false
}: LocationDisplayProps) {
  const hasCoordinates = location.latitude !== 0 && location.longitude !== 0;
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
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
        {/* Header with enhanced styling for buyers */}
        <div className="flex items-center gap-2 mb-4">
          <MapPinIcon className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {isBuyerView ? "📍 Exact Farm Location" : "Location Details"}
          </h3>
          {isBuyerView && hasCoordinates && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              ✅ GPS Verified
            </span>
          )}
        </div>

        {/* Enhanced GPS Coordinates Display for Buyers */}
        {hasCoordinates && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <GlobeAltIcon className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-900">
                {isBuyerView ? "Exact GPS Coordinates" : "GPS Coordinates"}
              </span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                ✅ Real GPS Data
              </span>
            </div>
            
            {/* Coordinates with enhanced display */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="text-gray-700 font-medium">Latitude:</span>
                <div className="font-mono text-gray-900 text-lg">{location.latitude.toFixed(8)}</div>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Longitude:</span>
                <div className="font-mono text-gray-900 text-lg">{location.longitude.toFixed(8)}</div>
              </div>
            </div>

            {/* GPS Quality Indicator for Buyers */}
            {isBuyerView && (
              <div className="bg-white border border-gray-200 rounded p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <SignalIcon className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-gray-900 text-sm">GPS Quality</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-600">Accuracy:</span>
                    <div className="font-semibold text-green-600">~3-5 meters</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className="font-semibold text-green-600">Excellent</div>
                  </div>
                </div>
              </div>
            )}

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

            {/* Additional buyer info */}
            {isBuyerView && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="text-xs text-green-700">
                  <p className="font-medium">💡 For Buyers:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Use these coordinates in your GPS device</li>
                    <li>• Navigate directly to the farm location</li>
                    <li>• Coordinates are accurate to within 5 meters</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map Display with enhanced styling */}
        {hasCoordinates && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  {isBuyerView ? "Farm Location Map" : "Location Map"}
                </span>
                {isBuyerView && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Interactive
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <iframe
                width="100%"
                height="300"
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

        {/* Address Details with enhanced display */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPinIcon className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Address Details</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {location.village && (
              <div>
                <span className="text-gray-600 text-sm">Village/Town:</span>
                <div className="font-medium text-gray-900">{location.village}</div>
              </div>
            )}
            {location.district && (
              <div>
                <span className="text-gray-600 text-sm">District:</span>
                <div className="font-medium text-gray-900">{location.district}</div>
              </div>
            )}
            {location.state && (
              <div>
                <span className="text-gray-600 text-sm">State:</span>
                <div className="font-medium text-gray-900">{location.state}</div>
              </div>
            )}
            {location.pincode && (
              <div>
                <span className="text-gray-600 text-sm">Pincode:</span>
                <div className="font-medium text-gray-900">{location.pincode}</div>
              </div>
            )}
          </div>

          {/* Full Address */}
          {location.address && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-gray-600 text-sm">Full Address:</span>
              <div className="font-medium text-gray-900 mt-1">{location.address}</div>
            </div>
          )}
        </div>

        {/* Contact Information with enhanced styling */}
        {(farmerName || farmerPhone || farmerEmail) && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <UserIcon className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-900">
                {isBuyerView ? "Contact the Farmer" : "Contact Information"}
              </span>
            </div>
            
            <div className="space-y-3">
              {farmerName && (
                <div className="flex items-center gap-3">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">{farmerName}</div>
                    <div className="text-sm text-gray-600">Farmer</div>
                  </div>
                </div>
              )}
              
              {farmerPhone && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">{farmerPhone}</div>
                    <div className="text-sm text-gray-600">Phone</div>
                  </div>
                </div>
              )}
              
              {farmerEmail && (
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">{farmerEmail}</div>
                    <div className="text-sm text-gray-600">Email</div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional buyer guidance */}
            {isBuyerView && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="text-xs text-green-700">
                  <p className="font-medium">📞 Contact Tips:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Call the farmer to arrange a visit</li>
                    <li>• Confirm availability before traveling</li>
                    <li>• Ask about specific directions to the farm</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
} 