import { Card, CardContent } from "@/components/ui/card"
import { Users, MapPin, TrendingUp, Shield } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Active Users",
    description: "Farmers and buyers across India",
  },
  {
    icon: MapPin,
    value: "500+",
    label: "Cities Covered",
    description: "Pan-India presence",
  },
  {
    icon: TrendingUp,
    value: "₹100Cr+",
    label: "Transactions",
    description: "Total value traded",
  },
  {
    icon: Shield,
    value: "99.9%",
    label: "Success Rate",
    description: "Secure transactions",
  },
]

export default function StatsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Thousands Across India</h2>
          <p className="text-xl text-gray-600">Building the future of agricultural commerce</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <stat.icon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-lg font-medium text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
