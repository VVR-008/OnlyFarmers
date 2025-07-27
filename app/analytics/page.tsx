"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartBarIcon, CurrencyRupeeIcon, ArrowTrendingUpIcon, UsersIcon } from "@heroicons/react/24/outline"

// Mock data for analytics
const cropProductionData = [
  { month: "Jan", rice: 400, wheat: 240, vegetables: 180 },
  { month: "Feb", rice: 300, wheat: 139, vegetables: 220 },
  { month: "Mar", rice: 200, wheat: 980, vegetables: 290 },
  { month: "Apr", rice: 278, wheat: 390, vegetables: 200 },
  { month: "May", rice: 189, wheat: 480, vegetables: 181 },
  { month: "Jun", rice: 239, wheat: 380, vegetables: 250 },
]

const landSalesData = [
  { month: "Jan", sales: 12, revenue: 2400000 },
  { month: "Feb", sales: 8, revenue: 1800000 },
  { month: "Mar", sales: 15, revenue: 3200000 },
  { month: "Apr", sales: 10, revenue: 2100000 },
  { month: "May", sales: 18, revenue: 3800000 },
  { month: "Jun", sales: 22, revenue: 4500000 },
]

const cropDistribution = [
  { name: "Rice", value: 35, color: "#10b981" },
  { name: "Wheat", value: 25, color: "#f59e0b" },
  { name: "Vegetables", value: 20, color: "#ef4444" },
  { name: "Pulses", value: 12, color: "#8b5cf6" },
  { name: "Others", value: 8, color: "#6b7280" },
]

const weatherData = [
  { day: "Mon", temperature: 28, humidity: 65, rainfall: 0 },
  { day: "Tue", temperature: 30, humidity: 70, rainfall: 2 },
  { day: "Wed", temperature: 32, humidity: 68, rainfall: 0 },
  { day: "Thu", temperature: 29, humidity: 72, rainfall: 5 },
  { day: "Fri", temperature: 27, humidity: 75, rainfall: 8 },
  { day: "Sat", temperature: 26, humidity: 80, rainfall: 12 },
  { day: "Sun", temperature: 28, humidity: 70, rainfall: 3 },
]

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"crops" | "land">("crops")
  const [weatherInfo, setWeatherInfo] = useState<any>(null)

  useEffect(() => {
    // Fetch weather data from Open-Meteo API
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FKolkata",
        )
        const data = await response.json()
        setWeatherInfo(data)
      } catch (error) {
        console.error("Error fetching weather data:", error)
      }
    }

    fetchWeather()
  }, [])

  const stats = {
    crops: {
      totalProduction: "2,450 Quintal",
      revenue: "₹12,45,000",
      activeListings: 24,
      orders: 156,
    },
    land: {
      totalSales: "85 Plots",
      revenue: "₹18,50,00,000",
      activeListings: 12,
      enquiries: 89,
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Track your agricultural business performance and market trends</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("crops")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "crops"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Crop Analytics
            </button>
            <button
              onClick={() => setActiveTab("land")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "land"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Land Analytics
            </button>
          </nav>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {activeTab === "crops" ? "Total Production" : "Total Sales"}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {activeTab === "crops" ? stats.crops.totalProduction : stats.land.totalSales}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyRupeeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {activeTab === "crops" ? stats.crops.revenue : stats.land.revenue}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Listings</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {activeTab === "crops" ? stats.crops.activeListings : stats.land.activeListings}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {activeTab === "crops" ? "Orders" : "Enquiries"}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {activeTab === "crops" ? stats.crops.orders : stats.land.enquiries}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Main Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {activeTab === "crops" ? "Crop Production Trends" : "Land Sales Trends"}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === "crops" ? (
                  <LineChart data={cropProductionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rice" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="wheat" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="vegetables" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                ) : (
                  <BarChart data={landSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "revenue" ? `₹${value.toLocaleString()}` : value,
                        name === "revenue" ? "Revenue" : "Sales",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="#10b981" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {activeTab === "crops" ? "Crop Distribution" : "Land Type Distribution"}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : "0"}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cropDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weather Forecast</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">7-Day Weather Trend</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Temperature (°C)"
                    />
                    <Line type="monotone" dataKey="rainfall" stroke="#3b82f6" strokeWidth={2} name="Rainfall (mm)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Current Weather</h4>
              {weatherInfo ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Temperature</p>
                      <p className="text-2xl font-bold text-blue-600">{weatherInfo.current_weather?.temperature}°C</p>
                    </div>
                    <div className="text-4xl">{weatherInfo.current_weather?.weathercode < 3 ? "☀️" : "☁️"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Wind Speed</p>
                      <p className="text-lg font-semibold">{weatherInfo.current_weather?.windspeed} km/h</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Wind Direction</p>
                      <p className="text-lg font-semibold">{weatherInfo.current_weather?.winddirection}°</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
