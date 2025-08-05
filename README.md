# OnlyFarmers.in - Agricultural Marketplace

A comprehensive agricultural marketplace connecting farmers and buyers across India. Built with Next.js 14+, MongoDB, and modern web technologies.

## 🚀 Features

- **Multi-role Authentication**: Farmers, Buyers, and Admin roles
- **Crop Listings**: Create, browse, and manage agricultural product listings
- **Farm Management**: Digital farm diary, analytics, and inventory tracking
- **AI Chat Assistant**: Gemini AI integration for farming advice
- **Community Forum**: Discussion boards for agricultural topics
- **Real-time Chat**: Direct messaging between farmers and buyers
- **Analytics Dashboard**: Market insights and farm performance metrics
- **Multi-language Support**: English and Hindi (i18n ready)
- **Mobile-first Design**: Responsive across all devices
- **Dark/Light Mode**: Theme switching with persistence

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+ or yarn 1.22+
- MongoDB 5.0+ (local or cloud)

## 🛠 Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd onlyfarmers-marketplace
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Environment Setup**
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. **Configure Environment Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/onlyfarmers` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-super-secret-jwt-key` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `GEMINI_API_KEY` | Google Gemini AI API key | `your-gemini-api-key` |

5. **Database Setup**
\`\`\`bash
# Start MongoDB (if running locally)
mongod

# Seed the database with sample data
npm run seed
\`\`\`

6. **Start Development Server**
\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000)

## 🚀 Production Deployment (Vercel)

1. **Install Vercel CLI**
\`\`\`bash
npm i -g vercel
\`\`\`

2. **Deploy to Vercel**
\`\`\`bash
vercel --prod
\`\`\`

3. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add all environment variables from `.env.example`
   - Redeploy if needed

4. **MongoDB Atlas Setup** (Recommended for production)
   - Create cluster at [MongoDB Atlas](https://cloud.mongodb.com)
   - Get connection string
   - Update `MONGODB_URI` in Vercel environment variables

## 📱 Screenshots

### Home Page
\`\`\`
┌─────────────────────────────────────────┐
│ 🌾 OnlyFarmers.in                      │
│ ┌─────────────────────────────────────┐ │
│ │ Hero: "Connect Farmers & Buyers"    │ │
│ │ Search bar, CTA buttons             │ │
│ └─────────────────────────────────────┘ │
│ Featured listings grid                  │
│ Statistics, testimonials                │
└─────────────────────────────────────────┘
\`\`\`

### Dashboard (Farmer)
\`\`\`
┌─────────────────────────────────────────┐
│ Dashboard | Profile | Logout             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│ │ Active  │ │Revenue  │ │ Orders  │     │
│ │   12    │ │ ₹45,000 │ │   8     │     │
│ └─────────┘ └─────────┘ └─────────┘     │
│ Recent activity, Quick actions          │
│ Charts, Analytics                       │
└─────────────────────────────────────────┘
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Format code
npm run format
\`\`\`

## 📁 Project Structure

\`\`\`
onyfarmers-marketplace/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth route group
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database connection
│   └── utils.ts          # Helper functions
├── models/               # Mongoose schemas
├── public/               # Static assets
├── scripts/              # Utility scripts
├── __tests__/            # Test files
├── types/                # TypeScript definitions
└── middleware.ts         # Next.js middleware
\`\`\`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run Jest tests
- `npm run seed` - Seed database with sample data
- `npm run type-check` - TypeScript type checking

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create new listing
- `GET /api/listings/[id]` - Get specific listing
- `PUT /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/[id]` - Update order status

### AI Chat
- `POST /api/gemini` - Send message to AI assistant

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: 50 requests per minute per IP
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configured for production
- **Helmet Security**: Security headers
- **Environment Variables**: Sensitive data protection

## 🌍 Internationalization

Supports English and Hindi with easy extension for more languages:

\`\`\`typescript
// Usage in components
import { useTranslation } from 'next-i18next'

const { t } = useTranslation('common')
return <h1>{t('welcome')}</h1>
\`\`\`

## 🎨 Theming

Custom color palette inspired by agriculture:

\`\`\`css
:root {
  --color-primary: #16a34a;     /* Green-600 */
  --color-secondary: #ca8a04;   /* Yellow-600 */
  --color-accent: #dc2626;      /* Red-600 */
  --color-earth: #92400e;       /* Amber-800 */
}
\`\`\`

## 🚧 Known Limitations

1. **File Upload**: Currently uses local storage. For production, integrate with AWS S3:
   \`\`\`typescript
   // TODO: Replace with S3 upload in /lib/upload.ts
   // Update UPLOAD_ENDPOINT in environment variables
   \`\`\`

2. **Real-time Features**: WebSocket implementation needed for live chat
   \`\`\`typescript
   // TODO: Implement Socket.io for real-time messaging
   // Add socket server in /lib/socket.ts
   \`\`\`

3. **Payment Processing**: Stripe integration is basic
   \`\`\`typescript
   // TODO: Add webhook handling for payment events
   // Implement subscription billing for premium features
   \`\`\`

## 🔄 Upgrade Points

### Immediate Improvements
- [ ] Add image optimization with Next.js Image
- [ ] Implement caching with Redis
- [ ] Add email notifications
- [ ] Mobile app with React Native

### Advanced Features
- [ ] Machine learning for crop price prediction
- [ ] IoT sensor integration
- [ ] Blockchain for supply chain tracking
- [ ] Advanced analytics with ML insights

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@onlyfarmers.in or create an issue in the repository.

---

**Post-Install Test Instructions:**

After installation, verify the setup:

1. ✅ `npm install` completes without errors
2. ✅ `npm run dev` starts server at http://localhost:3000
3. ✅ All pages load without console errors
4. ✅ Database connection successful
5. ✅ Authentication flow works (signup/login)
6. ✅ Sample data loads correctly

**Troubleshooting:**

- **MongoDB Connection Error**: Ensure MongoDB is running and URI is correct
- **JWT Error**: Check JWT_SECRET is set and has minimum 32 characters
- **Build Errors**: Run `npm run type-check` to identify TypeScript issues
- **Port 3000 in use**: Use `npm run dev -- -p 3001` for different port
