import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Leaf, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-50 to-emerald-100 py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                India's Premier
                <span className="text-green-600 block">Agricultural Marketplace</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect farmers and buyers across India. Buy and sell land, crops, and agricultural products with
                transparency and trust.
              </p>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input type="text" placeholder="Search crops, land, or location..." className="pl-10 h-12" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input type="text" placeholder="Location" className="pl-10 h-12 sm:w-40" />
                </div>
                <Button size="lg" className="h-12 px-8">
                  Search
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">25K+</div>
                <div className="text-sm text-gray-600">Listings</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">₹100Cr+</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="flex-1">
                <Link href="/auth/register?role=farmer">List Your Products</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1 bg-transparent">
                <Link href="/listings">Browse Listings</Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/placeholder.svg?height=600&width=600"
                alt="Indian farmer with crops"
                width={600}
                height={600}
                className="rounded-2xl shadow-2xl"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-green-200 rounded-full opacity-20 -z-10"></div>
            <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-emerald-200 rounded-full opacity-20 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
