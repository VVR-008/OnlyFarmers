import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Ramesh Singh",
    role: "Farmer, Punjab",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    content:
      "OnlyFarmers has transformed my business. I can now sell directly to buyers across India and get better prices for my crops.",
  },
  {
    name: "Anjali Sharma",
    role: "Buyer, Delhi",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    content:
      "The quality of products and the transparency in transactions is excellent. I have found reliable suppliers for my business.",
  },
  {
    name: "Suresh Patel",
    role: "Farmer, Gujarat",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    content:
      "The platform is easy to use and the support team is very helpful. My income has increased by 40% since joining.",
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600">Real stories from farmers and buyers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>

                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
