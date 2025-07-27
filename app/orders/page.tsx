"use client";
import { useEffect, useState } from "react";

interface Order {
  id: string | number;
  crop: string;
  status: string;
  buyer: string;
  date: string;
  total: number | string;
}

// Replace this with your valid Mockaroo API or test endpoint
const ORDERS_API = "https://my.api.mockaroo.com/orders.json?key=";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    fetch(ORDERS_API)
      .then((res) => {
        if (!res.ok) throw new Error(`Error fetching orders: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        // Defensive check: Sometimes data may be wrapped or not an array
        const ordersArray = Array.isArray(data) ? data : data.orders && Array.isArray(data.orders) ? data.orders : [];
        setOrders(ordersArray);
      })
      .catch((error) => {
        console.error("Failed to load orders:", error);
        setErrorMsg("Failed to load orders. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Order History</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-green-800 py-8">
          <span className="h-5 w-5 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
          Loading orders...
        </div>
      ) : errorMsg ? (
        <p className="text-red-600 text-center py-8">{errorMsg}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded bg-white shadow">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-3 py-2 border-b">Order</th>
                <th className="px-3 py-2 border-b">Product</th>
                <th className="px-3 py-2 border-b">Status</th>
                <th className="px-3 py-2 border-b">Buyer</th>
                <th className="px-3 py-2 border-b">Date</th>
                <th className="px-3 py-2 border-b">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-3 py-1 border-b">{order.id}</td>
                  <td className="px-3 py-1 border-b">{order.crop || order.product || "N/A"}</td>
                  <td className="px-3 py-1 border-b">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        order.status === "Completed" || order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-3 py-1 border-b">{order.buyer || order.customer || "—"}</td>
                  <td className="px-3 py-1 border-b">{order.date || "—"}</td>
                  <td className="px-3 py-1 border-b">₹{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
