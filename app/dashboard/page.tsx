// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useAuth } from "@/lib/auth-context";
// import {
//   ChartBarIcon,
//   CurrencyRupeeIcon,
//   ShoppingBagIcon,
//   UserGroupIcon,
//   PlusIcon,
//   EyeIcon,
//   ChatBubbleLeftRightIcon,
// } from "@heroicons/react/24/outline";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// interface DashboardStats {
//   totalRevenue: number;
//   totalOrders: number;
//   activeListings: number;
//   totalViews: number;
// }

// const COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#ef4444'];

// export default function DashboardPage() {
//   const { user } = useAuth();
//   const [stats, setStats] = useState<DashboardStats>({
//     totalRevenue: 0,
//     totalOrders: 0,
//     activeListings: 0,
//     totalViews: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [listingBreakdown, setListingBreakdown] = useState([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [user]);

//   const fetchDashboardData = async () => {
//     try {
//       // Simulate loading
//       setTimeout(() => {
//         setStats({
//           totalRevenue: user?.role === "farmer" ? 485000 : 125000,
//           totalOrders: user?.role === "farmer" ? 94 : 23,
//           activeListings: user?.role === "farmer" ? 18 : 0,
//           totalViews: user?.role === "farmer" ? 2847 : 156,
//         });

//         // Mock listing breakdown for farmers
//         if (user?.role === "farmer") {
//           setListingBreakdown([
//             { name: 'Crops', value: 8, color: COLORS[0] },
//             { name: 'Livestock', value: 6, color: COLORS[1] },
//             { name: 'Land', value: 4, color: COLORS[2] },
//           ]);
//         }

//         setLoading(false);
//       }, 1000);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="h-10 w-10 border-b-2 border-green-600 rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-6">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
//               <p className="text-gray-600">
//                 {user?.role === "farmer"
//                   ? "Manage your crops, livestock, and land listings"
//                   : user?.role === "land_man"
//                   ? "Manage your land and property listings"
//                   : "Discover fresh produce, livestock, and land opportunities"}
//               </p>
//             </div>
//             <div className="flex space-x-3">
//               {(user?.role === "farmer" || user?.role === "land_man") && (
//                 <Link
//                   href="/listings/create"
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
//                 >
//                   <PlusIcon className="h-4 w-4 mr-2" />
//                   Add Listing
//                 </Link>
//               )}
//               <Link
//                 href="/chat"
//                 className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
//               >
//                 <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
//                 AI Assistant
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <CurrencyRupeeIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       {user?.role === "farmer" || user?.role === "land_man" ? "Total Revenue" : "Total Spent"}
//                     </dt>
//                     <dd className="text-lg font-medium text-gray-900">₹{stats.totalRevenue.toLocaleString()}</dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-5 py-3">
//               <div className="text-sm">
//                 <span className="text-green-600 font-medium">+12%</span>
//                 <span className="text-gray-500"> from last month</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <ShoppingBagIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       {user?.role === "farmer" ? "Total Orders" : "Orders Placed"}
//                     </dt>
//                     <dd className="text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-5 py-3">
//               <div className="text-sm">
//                 <span className="text-green-600 font-medium">+8</span>
//                 <span className="text-gray-500"> this month</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <ChartBarIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       {user?.role === "farmer"  ? "Active Listings" : "Saved Items"}
//                     </dt>
//                     <dd className="text-lg font-medium text-gray-900">{stats.activeListings || 5}</dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-5 py-3">
//               <div className="text-sm">
//                 <span className="text-blue-600 font-medium">3</span>
//                 <span className="text-gray-500"> new this week</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <EyeIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       {user?.role === "farmer"  ? "Profile Views" : "Items Viewed"}
//                     </dt>
//                     <dd className="text-lg font-medium text-gray-900">{stats.totalViews.toLocaleString()}</dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-5 py-3">
//               <div className="text-sm">
//                 <span className="text-green-600 font-medium">+24%</span>
//                 <span className="text-gray-500"> from last week</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Charts Section for Farmers/Land Men */}
//         {(user?.role === "farmer" ) && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//             {/* Listing Breakdown Chart */}
//             <div className="bg-white p-6 rounded-lg shadow">
//               <h3 className="text-lg font-medium text-gray-900 mb-4">Listing Breakdown</h3>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={listingBreakdown}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, value }) => `${name}: ${value}`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {listingBreakdown.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             {/* Revenue Chart */}
//             <div className="bg-white p-6 rounded-lg shadow">
//               <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={[
//                     { month: "Jan", revenue: 45000 },
//                     { month: "Feb", revenue: 52000 },
//                     { month: "Mar", revenue: 48000 },
//                     { month: "Apr", revenue: 61000 },
//                     { month: "May", revenue: 55000 },
//                     { month: "Jun", revenue: 67000 },
//                   ]}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="month" />
//                     <YAxis />
//                     <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]} />
//                     <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Quick Actions */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
//           </div>
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {user?.role === "farmer" ? (
//                 <>
//                   <Link href="/listings/create" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <PlusIcon className="h-6 w-6 text-green-600 mr-3" />
//                     <span className="text-sm font-medium">Add New Listing</span>
//                   </Link>
//                   <Link href="/listings?type=crop" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <span className="text-2xl mr-3">🌾</span>
//                     <span className="text-sm font-medium">Manage Crops</span>
//                   </Link>
//                   <Link href="/listings?type=livestock" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <span className="text-2xl mr-3">🐄</span>
//                     <span className="text-sm font-medium">Manage Livestock</span>
//                   </Link>
//                   <Link href="/orders" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <ShoppingBagIcon className="h-6 w-6 text-orange-600 mr-3" />
//                     <span className="text-sm font-medium">View Orders</span>
//                   </Link>
//                 </>
//               ) : user?.role === "land_man" ? (
//                 <>
//                   <Link href="/listings/create" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <PlusIcon className="h-6 w-6 text-green-600 mr-3" />
//                     <span className="text-sm font-medium">Add Land Listing</span>
//                   </Link>
//                   <Link href="/listings?type=land" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <span className="text-2xl mr-3">🏞️</span>
//                     <span className="text-sm font-medium">Manage Properties</span>
//                   </Link>
//                   <Link href="/analytics" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <ChartBarIcon className="h-6 w-6 text-purple-600 mr-3" />
//                     <span className="text-sm font-medium">View Analytics</span>
//                   </Link>
//                   <Link href="/orders" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <ShoppingBagIcon className="h-6 w-6 text-orange-600 mr-3" />
//                     <span className="text-sm font-medium">Enquiries</span>
//                   </Link>
//                 </>
//               ) : (
//                 <>
//                   <Link href="/listings" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <ShoppingBagIcon className="h-6 w-6 text-green-600 mr-3" />
//                     <span className="text-sm font-medium">Browse All</span>
//                   </Link>
//                   <Link href="/listings?type=crop" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <span className="text-2xl mr-3">🌾</span>
//                     <span className="text-sm font-medium">Crops</span>
//                   </Link>
//                   <Link href="/listings?type=livestock" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <span className="text-2xl mr-3">🐄</span>
//                     <span className="text-sm font-medium">Livestock</span>
//                   </Link>
//                   <Link href="/listings?type=land" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <span className="text-2xl mr-3">🏞️</span>
//                     <span className="text-sm font-medium">Land</span>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  ChartBarIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { LeafIcon } from "lucide-react";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeListings: number;
  totalViews: number;
}

interface ListingBreakdown {
  name: string;
  value: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

const COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeListings: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [listingBreakdown, setListingBreakdown] = useState<ListingBreakdown[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && user?.role === "farmer") {
      fetchDashboardData();
    } else if (user?.role === "buyer") {
      // For buyers, set mock data
      setStats({
        totalRevenue: 0,
        totalOrders: 5,
        activeListings: 0,
        totalViews: 156,
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dashboard/stats?farmerId=${user.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      
      setStats(data.stats);
      setListingBreakdown(data.listingBreakdown || []);
      setMonthlyRevenue(data.monthlyRevenue || []);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
      
      // Fallback to mock data
      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        activeListings: 0,
        totalViews: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-b-2 border-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
              <p className="text-gray-600">
                {user?.role === "farmer"
                  ? "Manage your crops, livestock, and land listings"
                  : "Discover fresh produce, livestock, and land opportunities"}
              </p>
              {error && (
                <p className="text-red-600 text-sm mt-1">{error}</p>
              )}
            </div>
            <div className="flex space-x-3">
              {user?.role === "farmer" && (
                <Link
                  href="/listings/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                 <PlusIcon className="h-4 w-4 mr-2" />
                  Add Listing
                </Link>
              )}
                <Link
                href="/my-listings"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                  <LeafIcon className="h-4 w-4 mr-2" />
                Show My Listings
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                AI Assistant
              </Link>
              
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <CurrencyRupeeIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {user?.role === "farmer" ? "Total Revenue" : "Total Spent"}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">₹{stats.totalRevenue.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">
                  {stats.totalRevenue > 0 ? "+12%" : "No sales yet"}
                </span>
                <span className="text-gray-500"> 
                  {stats.totalRevenue > 0 ? " from last month" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <ShoppingBagIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {user?.role === "farmer" ? "Total Orders" : "Orders Placed"}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">
                  {stats.totalOrders > 0 ? `+${Math.floor(stats.totalOrders * 0.1)}` : "0"}
                </span>
                <span className="text-gray-500"> this month</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <ChartBarIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {user?.role === "farmer" ? "Active Listings" : "Saved Items"}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeListings}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-blue-600 font-medium">
                  {stats.activeListings > 0 ? Math.floor(stats.activeListings * 0.2) : 0}
                </span>
                <span className="text-gray-500"> new this week</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <EyeIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {user?.role === "farmer" ? "Profile Views" : "Items Viewed"}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalViews.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">+24%</span>
                <span className="text-gray-500"> from last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section for Farmers */}
        {user?.role === "farmer" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Listing Breakdown Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Listing Breakdown</h3>
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
                      <p>No active listings yet</p>
                      <Link 
                        href="/listings/create" 
                        className="text-green-600 hover:underline text-sm"
                      >
                        Create your first listing
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
              <div className="h-64">
                {monthlyRevenue.some(item => item.revenue > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                      <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📈</div>
                      <p>No revenue data yet</p>
                      <p className="text-sm">Complete some orders to see your revenue trend</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {user?.role === "farmer" ? (
                <>
                  <Link href="/listings/create" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <PlusIcon className="h-6 w-6 text-green-600 mr-3" />
                    <span className="text-sm font-medium">Add New Listing</span>
                  </Link>
                  <Link href="/listings?type=crops" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl mr-3">🌾</span>
                    <span className="text-sm font-medium">Manage Crops</span>
                  </Link>
                  <Link href="/listings?type=livestocks" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl mr-3">🐄</span>
                    <span className="text-sm font-medium">Manage Livestock</span>
                  </Link>
                  <Link href="/listings?type=lands" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl mr-3">🏞️</span>
                    <span className="text-sm font-medium">Manage Land</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/listings" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <ShoppingBagIcon className="h-6 w-6 text-green-600 mr-3" />
                    <span className="text-sm font-medium">Browse All</span>
                  </Link>
                  <Link href="/listings?type=crops" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl mr-3">🌾</span>
                    <span className="text-sm font-medium">Crops</span>
                  </Link>
                  <Link href="/listings?type=livestock" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl mr-3">🐄</span>
                    <span className="text-sm font-medium">Livestock</span>
                  </Link>
                  <Link href="/listings?type=land" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl mr-3">🏞️</span>
                    <span className="text-sm font-medium">Land</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
