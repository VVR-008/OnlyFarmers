"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AnalysisPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Analysis Dashboard</h1>
          <p className="text-gray-600 mb-4">Please login to access the analysis features.</p>
          <Link 
            href="/login" 
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crop Analysis Dashboard</h1>
          <p className="text-gray-600">Analyze your farming data and get insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Market Analysis Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Analysis</h3>
            <p className="text-gray-600 mb-4">Get insights into current market trends and pricing for your crops.</p>
            <button 
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              onClick={() => setIsLoading(true)}
            >
              {isLoading ? "Analyzing..." : "Analyze Market"}
            </button>
          </div>

          {/* Crop Health Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Health Scanner</h3>
            <p className="text-gray-600 mb-4">Upload images of your crops to detect diseases and get treatment recommendations.</p>
            <Link 
              href="/dashboard/ai-assistant"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Scan Crops
            </Link>
          </div>

          {/* Performance Analytics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
            <p className="text-gray-600 mb-4">Track your farming performance and compare with previous seasons.</p>
            <button 
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
            >
              View Analytics
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Analysis</h2>
          <div className="text-gray-600">
            <p>No recent analysis available. Start by analyzing your market or scanning your crops.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
