const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config({ path: ".env.local" })

// Import models
const User = require("./models/User")
const Listing = require("./models/Listing")
const ForumPost = require("./models/ForumPost")
const Chat = require("./models/Chat")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/onlyfarmers"

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...")

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Listing.deleteMany({})
    await ForumPost.deleteMany({})
    await Chat.deleteMany({})
    console.log("🧹 Cleared existing data")

    // Create users
    const users = await User.create([
      {
        name: "Rajesh Kumar",
        email: "farmer1@example.com",
        password: "password123",
        role: "farmer",
        phone: "+91 9876543210",
        isVerified: true,
        address: {
          city: "Ludhiana",
          state: "Punjab",
          pincode: "141001",
          country: "India",
        },
        farmDetails: {
          farmName: "Kumar Organic Farm",
          farmSize: 25,
          cropTypes: ["Rice", "Wheat", "Sugarcane"],
          farmingExperience: 15,
        },
      },
      {
        name: "Priya Sharma",
        email: "farmer2@example.com",
        password: "password123",
        role: "farmer",
        phone: "+91 9876543211",
        isVerified: true,
        address: {
          city: "Nashik",
          state: "Maharashtra",
          pincode: "422001",
          country: "India",
        },
        farmDetails: {
          farmName: "Sharma Vegetable Farm",
          farmSize: 15,
          cropTypes: ["Tomato", "Onion", "Potato"],
          farmingExperience: 8,
        },
      },
      {
        name: "Amit Patel",
        email: "buyer1@example.com",
        password: "password123",
        role: "buyer",
        phone: "+91 9876543212",
        isVerified: true,
        address: {
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
        },
      },
    ])

    console.log("👥 Created users:", users.length)

    // Create listings
    const listings = await Listing.create([
      {
        title: "Premium Basmati Rice - Direct from Farm",
        description:
          "High-quality basmati rice grown using organic methods. Perfect for export and premium markets. Aged for 2 years for better aroma and taste.",
        category: "crops",
        subcategory: "Rice",
        price: 4500,
        priceType: "fixed",
        quantity: 1000,
        unit: "quintal",
        images: ["/placeholder-rice.jpg"],
        location: {
          address: "Village Khanna, Ludhiana",
          city: "Ludhiana",
          state: "Punjab",
          pincode: "141001",
        },
        farmer: users[0]._id,
        specifications: {
          variety: "Pusa Basmati 1121",
          harvestDate: new Date("2024-11-15"),
          organicCertified: true,
          qualityGrade: "A",
          storageConditions: "Cool and dry warehouse",
        },
        status: "active",
        featured: true,
        tags: ["organic", "premium", "export-quality", "basmati"],
      },
      {
        title: "Fresh Organic Tomatoes - Bulk Supply",
        description:
          "Fresh, juicy tomatoes grown without pesticides. Perfect for restaurants, hotels, and bulk buyers. Available for immediate delivery.",
        category: "crops",
        subcategory: "Vegetables",
        price: 3000,
        priceType: "negotiable",
        quantity: 500,
        unit: "quintal",
        images: ["/placeholder-tomato.jpg"],
        location: {
          address: "Nashik Road, Nashik",
          city: "Nashik",
          state: "Maharashtra",
          pincode: "422001",
        },
        farmer: users[1]._id,
        specifications: {
          variety: "Hybrid Tomato",
          harvestDate: new Date("2024-12-01"),
          organicCertified: true,
          qualityGrade: "Premium",
          storageConditions: "Cold storage available",
        },
        status: "active",
        featured: true,
        tags: ["organic", "fresh", "bulk", "restaurant-supply"],
      },
    ])

    console.log("📦 Created listings:", listings.length)

    // Create forum posts
    const forumPosts = await ForumPost.create([
      {
        title: "Best practices for organic farming in Punjab",
        content:
          "I have been practicing organic farming for the last 5 years. Here are some tips that have worked well for me: 1. Use compost made from farm waste, 2. Rotate crops every season, 3. Use neem oil for pest control...",
        author: users[0]._id,
        category: "crops",
        tags: ["organic", "punjab", "tips", "best-practices"],
        upvotes: 15,
        downvotes: 2,
        views: 234,
        replies: [
          {
            author: users[1]._id,
            content:
              "Great tips! I have been following similar practices in Maharashtra. Adding vermicompost has also helped improve soil quality.",
            upvotes: 8,
            downvotes: 0,
            createdAt: new Date(),
          },
        ],
      },
      {
        title: "Market prices for tomatoes - December 2024",
        content:
          "Current market rates for tomatoes in major cities: Mumbai: ₹30-35/kg, Delhi: ₹25-30/kg, Bangalore: ₹28-32/kg. Prices are expected to rise due to winter demand.",
        author: users[1]._id,
        category: "market",
        tags: ["tomato", "prices", "market-update", "december"],
        upvotes: 23,
        downvotes: 1,
        views: 456,
        isPinned: true,
      },
    ])

    console.log("💬 Created forum posts:", forumPosts.length)

    // Create sample chat messages
    const chatMessages = await Chat.create([
      {
        user: users[0]._id,
        message: "What is the best time to plant wheat in Punjab?",
        response:
          "The best time to plant wheat in Punjab is from mid-October to mid-November. This timing ensures optimal growth conditions with cooler temperatures and adequate moisture from winter rains.",
        isAI: true,
        context: "farming_advice",
        metadata: {
          model: "gemini-pro",
          tokens: 45,
          responseTime: 1200,
        },
      },
      {
        user: users[1]._id,
        message: "How can I control pests in tomato crops organically?",
        response:
          "For organic pest control in tomatoes, you can use: 1. Neem oil spray (2-3ml per liter), 2. Companion planting with basil and marigold, 3. Beneficial insects like ladybugs, 4. Soap solution for aphids, 5. Regular inspection and manual removal of pests.",
        isAI: true,
        context: "pest_control",
        metadata: {
          model: "gemini-pro",
          tokens: 78,
          responseTime: 1500,
        },
      },
    ])

    console.log("🤖 Created chat messages:", chatMessages.length)

    console.log("🎉 Database seeding completed successfully!")
    console.log("\n📊 Summary:")
    console.log(`- Users: ${users.length} (2 farmers, 1 buyer)`)
    console.log(`- Listings: ${listings.length}`)
    console.log(`- Forum Posts: ${forumPosts.length}`)
    console.log(`- Chat Messages: ${chatMessages.length}`)

    console.log("\n🔐 Test Credentials:")
    console.log("Farmer 1: farmer1@example.com / password123")
    console.log("Farmer 2: farmer2@example.com / password123")
    console.log("Buyer: buyer1@example.com / password123")
  } catch (error) {
    console.error("❌ Seeding error:", error)
  } finally {
    await mongoose.connection.close()
    console.log("🔌 Database connection closed")
    process.exit(0)
  }
}

// Run the seeding function
seedDatabase()
