import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock data - in real app, this would come from API
const featuredListings = [
  {
    id: "1",
    title: "Premium Basmati Rice - 1000 Quintal",
    type: "crop",
    price: "₹45,000",
    location: "Punjab, India",
    farmer: "Rajesh Kumar",
    image: "/placeholder.svg?height=300&width=400",
    category: "Grains",
    harvestDate: "2024-03-15",
    verified: true,
  },
  {
    id: "2",
    title: "50 Acre Agricultural Land for Sale",
    type: "land",
    price: "₹2.5 Crore",
    location: "Haryana, India",
    farmer: "Suresh Singh",
    image: "/placeholder.svg?height=300&width=400",
    category: "Land",
    soilType: "Alluvial",
    verified: true,
  },
  {
    id: "3",
    title: "Fresh Organic Tomatoes - 500 Quintal",
    type: "crop",
    price: "₹15,000",
    location: "Maharashtra, India",
    farmer: "Priya Patel",
    image: "/placeholder.svg?height=300&width=400",
    category: "Vegetables",
    harvestDate: "2024-02-20",
    verified: true,
  },
  {
    id: "4",
    title: "Premium Wheat - 2000 Quintal",
    type: "crop",
    price: "₹38,000",
    location: "Uttar Pradesh, India",
    farmer: "Amit Sharma",
    image: "/placeholder.svg?height=300&width=400",
    category: "Grains",
    harvestDate: "2024-04-10",
    verified: true,
  },
]

export default function FeaturedListings() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Listings</h2>
          <p className="text-xl text-gray-600">Discover the best agricultural products and land deals</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {featuredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={listing.image || "/placeholder.svg"}
                  alt={listing.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant={listing.type === "crop" ? "default" : "secondary"}>{listing.category}</Badge>
                </div>
                {listing.verified && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-white">
                      ✓ Verified
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                <div className="text-2xl font-bold text-green-600">{listing.price}</div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {listing.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  {listing.farmer}
                </div>
                {listing.harvestDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    Harvest: {new Date(listing.harvestDate).toLocaleDateString()}
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/listings/${listing.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/listings">View All Listings</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
