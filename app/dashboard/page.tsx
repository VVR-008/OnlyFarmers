"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
  ChartBarIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  PlusIcon,
  EyeIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  activeListings: number
  totalViews: number
}

interface ListingBreakdown {
  name: string
  value: number
}

interface MonthlyData {
  month: string
  revenue: number
  orders: number
}

const COLORS = ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444"]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeListings: 0,
    totalViews: 0,
  })
  const [loading, setLoading] = useState(true)
  const [listingBreakdown, setListingBreakdown] = useState<ListingBreakdown[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (user?.id) {
      if (user.role === "farmer") {
        fetchDashboardData()
        fetchPendingOrders()
      } else if (user.role === "buyer") {
        fetchBuyerStats()
      }
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/dashboard/stats?farmerId=${user.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }
      const data = await response.json()
      setStats(data.stats)
      setListingBreakdown(data.listingBreakdown || [])
      setMonthlyRevenue(data.monthlyRevenue || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data")
      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        activeListings: 0,
        totalViews: 0,
      })
      setListingBreakdown([])
      setMonthlyRevenue([])
    } finally {
      setLoading(false)
    }
  }

  const fetchBuyerStats = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const response = await fetch(`/api/orders?user=${user.id}&role=buyer&limit=100`)
      const data = await response.json()
      const orders = data.orders || []
      const totalSpent = orders
        .filter((order: any) => order.status === "accepted" || order.status === "completed")
        .reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0)
      setStats({
        totalRevenue: totalSpent,
        totalOrders: orders.length,
        activeListings: 0,
        totalViews: orders.length * 5,
      })
    } catch (error) {
      console.error("Error fetching buyer stats:", error)
      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        activeListings: 0,
        totalViews: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingOrders = async () => {
    if (!user?.id || user.role !== "farmer") return
    try {
      const response = await fetch(`/api/orders?user=${user.id}&role=seller&status=pending&limit=1`)
      const data = await response.json()
      setPendingOrders(data.pagination?.total || 0)
    } catch (error) {
      console.error("Error fetching pending orders:", error)
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Refined Navbar */}
      <nav className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <span className="ml-2 text-lg font-bold text-gray-900">OnlyFarmers</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/dashboard"
                  className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/listings"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Browse
                </Link>
                {user?.role === "farmer" && (
                  <Link
                    href="/my-listings"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    My Listings
                  </Link>
                )}
                <Link
                  href="/chat"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  AI Assistant
                </Link>
              </div>
            </div>

            {/* User Menu */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-3">
                {/* Notifications */}
                {user?.role === "farmer" && pendingOrders > 0 && (
                  <Link
                    href="/order-requests"
                    className="relative p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <BellIcon className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 text-xs font-bold text-white bg-green-600 rounded-full">
                      {pendingOrders > 9 ? "9+" : pendingOrders}
                    </span>
                  </Link>
                )}

                {/* User Profile */}
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <UserCircleIcon className="h-7 w-7 text-gray-600" />
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {mobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
              <Link
                href="/dashboard"
                className="bg-green-100 text-green-700 block px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/listings"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse
              </Link>
              {user?.role === "farmer" && (
                <Link
                  href="/my-listings"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Listings
                </Link>
              )}
              <Link
                href="/chat"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-sm font-medium"
              >
                AI Assistant
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <UserCircleIcon className="h-8 w-8 text-gray-600" />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-800">{user?.name}</div>
                  <div className="text-xs font-medium text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Refined Welcome Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {user?.name}! 👋</h1>
              <p className="text-sm text-gray-600">
                {user?.role === "farmer"
                  ? "Manage your crops, livestock, and land listings"
                  : "Discover fresh produce, livestock, and land opportunities"}
              </p>
              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-xs flex items-center">
                    <span className="mr-1">⚠️</span>
                    {error}
                  </p>
                </div>
              )}
            </div>
            <div className="hidden sm:flex space-x-2">
              {user?.role === "farmer" && (
                <>
                  <Link
                    href="/listings/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Listing
                  </Link>
                  {pendingOrders > 0 && (
                    <Link
                      href="/order-requests"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors relative"
                    >
                      <BellIcon className="h-4 w-4 mr-1" />
                      Orders
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {pendingOrders > 9 ? "9+" : pendingOrders}
                      </span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Refined Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 truncate">
                      {user?.role === "farmer" ? "Total Revenue" : "Total Spent"}
                    </dt>
                    <dd className="text-lg font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-2">
              <div className="text-xs">
                <span className="text-green-600 font-medium">{stats.totalRevenue > 0 ? "+12%" : "Start selling"}</span>
                <span className="text-gray-500 ml-1">{stats.totalRevenue > 0 ? "from last month" : ""}</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 truncate">
                      {user?.role === "farmer" ? "Total Orders" : "Orders Placed"}
                    </dt>
                    <dd className="text-lg font-bold text-gray-900">{stats.totalOrders}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-2">
              <div className="text-xs">
                <span className="text-blue-600 font-medium">
                  {stats.totalOrders > 0 ? `+${Math.max(1, Math.floor(stats.totalOrders * 0.1))}` : "0"}
                </span>
                <span className="text-gray-500 ml-1">this month</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 truncate">
                      {user?.role === "farmer" ? "Active Listings" : "Saved Items"}
                    </dt>
                    <dd className="text-lg font-bold text-gray-900">{stats.activeListings}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-2">
              <div className="text-xs">
                <span className="text-yellow-600 font-medium">
                  {stats.activeListings > 0 ? Math.max(1, Math.floor(stats.activeListings * 0.2)) : 0}
                </span>
                <span className="text-gray-500 ml-1">new this week</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <EyeIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 truncate">
                      {user?.role === "farmer" ? "Profile Views" : "Items Viewed"}
                    </dt>
                    <dd className="text-lg font-bold text-gray-900">{stats.totalViews.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-2">
              <div className="text-xs">
                <span className="text-purple-600 font-medium">+24%</span>
                <span className="text-gray-500 ml-1">from last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Refined Charts Section for Farmers */}
        {user?.role === "farmer" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Listing Breakdown Chart */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Listing Breakdown</h3>
              <div className="h-64">
                {listingBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={listingBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {listingBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="font-medium mb-1 text-sm">No active listings yet</p>
                      <p className="text-xs mb-3 text-gray-400">Create your first listing to see breakdown</p>
                      <Link
                        href="/listings/create"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Create Listing
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
              <div className="h-64">
                {monthlyRevenue.length > 0 && monthlyRevenue.some((item) => item.revenue > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                      <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📈</div>
                      <p className="font-medium mb-1 text-sm">No revenue data yet</p>
                      <p className="text-xs mb-3 text-gray-400">Complete orders to see your revenue trend</p>
                      <Link
                        href="/order-requests"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        View Orders
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Refined Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600 mt-1">Frequently used features and shortcuts</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {user?.role === "farmer" ? (
                <>
                  <Link
                    href="/listings/create"
                    className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                  >
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <PlusIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Add New Listing</span>
                      <p className="text-xs text-gray-500 mt-0.5">Create a new product</p>
                    </div>
                  </Link>

                  <Link
                    href="/my-listings"
                    className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <span className="text-xl">📋</span>
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">My Listings</span>
                      <p className="text-xs text-gray-500 mt-0.5">Manage your products</p>
                    </div>
                  </Link>

                  <Link
                    href="/order-requests"
                    className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 relative"
                  >
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <ShoppingBagIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="ml-3 flex-1">
                      <span className="text-sm font-medium text-gray-900">Order Requests</span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {pendingOrders > 0 ? `${pendingOrders} pending` : "No pending requests"}
                      </p>
                    </div>
                    {pendingOrders > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                        {pendingOrders}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/listings"
                    className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <span className="text-xl">🛒</span>
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Browse Market</span>
                      <p className="text-xs text-gray-500 mt-0.5">Explore other listings</p>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/listings"
                    className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                  >
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <ShoppingBagIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Browse All</span>
                      <p className="text-xs text-gray-500 mt-0.5">Explore all products</p>
                    </div>
                  </Link>

                  <Link
                    href="/listings?type=crops"
                    className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200"
                  >
                    <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                      <span className="text-xl">🌾</span>
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Crops</span>
                      <p className="text-xs text-gray-500 mt-0.5">Fresh produce & grains</p>
                    </div>
                  </Link>

                  <Link
                    href="/listings?type=livestocks"
                    className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <span className="text-xl">🐄</span>
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Livestock</span>
                      <p className="text-xs text-gray-500 mt-0.5">Animals & dairy products</p>
                    </div>
                  </Link>

                  <Link
                    href="/orders"
                    className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <span className="text-xl">📦</span>
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">My Orders</span>
                      <p className="text-xs text-gray-500 mt-0.5">Track your purchases</p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
