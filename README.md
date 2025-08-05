# OnlyFarmers.in - Agricultural Marketplace

A comprehensive agricultural marketplace connecting farmers and buyers across India. Built with Next.js 14+, MongoDB, and modern web technologies, OnlyFarmers.in aims to empower the agricultural community with digital tools for crop management, sales, analytics, and communication.

---

## 🚀 Features

- **Multi-role Authentication**: Secure login and access for Farmers, Buyers, and Admins  
- **Crop Listings**: Create, browse, and manage agricultural product listings  
- **Farm Management**: Maintain a digital farm diary with analytics and inventory tracking  
- **AI Chat Assistant**: Integrated Google Gemini AI for farming advice and support  
- **Community Forum**: Discussion boards for agricultural topics and peer support  
- **Real-time Chat**: Direct messaging between farmers and buyers  
- **Analytics Dashboard**: Market insights and farm performance metrics for better decisions  
- **Multi-language Support**: English and Hindi with i18n-friendly design  
- **Mobile-first & Responsive**: Accessible across all devices seamlessly  
- **Dark/Light Mode**: User preference with persistent theming  

---

## 📋 Prerequisites

- Node.js 18 or higher  
- npm 8 or higher (or yarn 1.22+)  
- MongoDB 5.0 or higher (local or cloud instance)  

---

## 🛠 Installation

1. **Clone the repository**

git clone https://github.com/VVR-008/OnlyFarmers.git
cd OnlyFarmers

text

2. **Install dependencies**

npm install

text

3. **Configure environment variables**

Copy the example env file and update the variables:

cp .env.example .env.local

text

Update `.env.local` with your values:

| Variable               | Description                     | Example                               |
|------------------------|---------------------------------|-------------------------------------|
| `MONGODB_URI`          | MongoDB connection string        | `mongodb://localhost:27017/onlyfarmers` |
| `JWT_SECRET`           | JWT signing secret (32+ chars)   | `your-super-secret-jwt-key`         |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key              | `pk_test_...`                       |
| `STRIPE_SECRET_KEY`    | Stripe secret key                | `sk_test_...`                       |
| `GEMINI_API_KEY`       | Google Gemini AI API key         | `your-gemini-api-key`               |

4. **Start MongoDB** (if running locally)

mongod

text

5. **Seed the database with sample data**

npm run seed

text

6. **Start the development server**

npm run dev

text

7. **Access the application**

Open your browser at [http://localhost:3000](http://localhost:3000)

---

## 🚀 Production Deployment (Vercel)

1. Install the Vercel CLI

npm i -g vercel

text

2. Deploy to Vercel

vercel --prod

text

3. Set all required environment variables in the Vercel dashboard based on `.env.example`

4. Redeploy the project if needed

5. (Optional) Use MongoDB Atlas for production database

- Create a cluster on MongoDB Atlas
- Update `MONGODB_URI` accordingly in Vercel environment variables

---

## 📁 Project Structure

```text
onlyfarmers-marketplace/
├── app/              # Next.js App Router files and routes
│   ├── (auth)/       # Authentication routes
│   ├── api/          # API route handlers
│   ├── dashboard/    # Dashboard pages for users
│   └── globals.css   # Global styles
├── components/       # Reusable UI and form components
├── lib/              # Utilities and configuration (Auth, DB, helpers)
├── models/           # Mongoose schemas for MongoDB collections
├── public/           # Static assets and images
├── scripts/          # Utility scripts (e.g., database seeding)
├── tests/            # Unit and integration tests
├── types/            # TypeScript type definitions
└── middleware.ts     # Next.js middleware for request handling

---

## 🧪 Testing

- Run all tests:

npm test

text

- Run tests in watch mode:

npm run test:watch

text

- Run linting:

npm run lint

text

- Format code with Prettier:

npm run format

text

---

## 🌐 API Endpoints

- **Authentication**

- `POST /api/auth/register` - User registration  
- `POST /api/auth/login` - User login  
- `POST /api/auth/logout` - User logout  
- `GET /api/auth/me` - Get current user info  

- **Listings**

- `GET /api/listings` - Get all crop listings  
- `POST /api/listings` - Create new listing  
- `GET /api/listings/[id]` - Get a specific listing  
- `PUT /api/listings/[id]` - Update listing  
- `DELETE /api/listings/[id]` - Delete listing  

- **Orders**

- `GET /api/orders` - Get user orders  
- `POST /api/orders` - Create new order  
- `PUT /api/orders/[id]` - Update order status  

- **AI Chat**

- `POST /api/gemini` - Send message to AI farming assistant  

---

## 🔒 Security Features

- Password hashing with bcrypt (salt rounds)  
- JWT token-based authentication  
- Rate limiting (50 requests/minute per IP)  
- Input validation via Zod schemas  
- CORS configured for production environments  
- Secure HTTP headers with Helmet  
- Environment variables keep sensitive data safe  

---

## 🌍 Internationalization

Supports English and Hindi languages with easy extensibility via i18n:

import { useTranslation } from 'next-i18next';

const { t } = useTranslation('common');
return <p>{t('welcome')}</p>;

text

---

## 🎨 Theming

Agriculture-inspired color palette with dark/light mode support:

:root {
--color-primary: #16a34a; /* Green-600 /
--color-secondary: #ca8a04; / Yellow-600 /
--color-accent: #dc2626; / Red-600 /
--color-earth: #92400e; / Amber-800 */
}

text

---

## 🚧 Known Limitations & TODOs

- File uploads currently save to local storage; S3 integration planned for production  
- WebSocket-based real-time chat not yet implemented  
- Basic Stripe integration, subscription billing & webhook handling planned  
- Image optimization and caching improvements planned  

---

## 🔄 Future Improvements

- Add Next.js Image component for optimized images  
- Caching with Redis for performance  
- Email notifications & alerts  
- Mobile app with React Native  
- AI/ML-powered crop price prediction & analytics  
- IoT sensor integrations for farm data  
- Blockchain-based supply chain traceability  

---

## 🤝 Contributing

- Fork the repository  
- Create a feature branch (`git checkout -b feature/your-feature`)  
- Commit changes (`git commit -m 'Add your feature'`)  
- Push to the branch (`git push origin feature/your-feature`)  
- Open a Pull Request  

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


---

## Post-Install Checklist

- [x] `npm install` completes successfully  
- [x] `npm run dev` starts the server at [http://localhost:3000](http://localhost:3000)  
- [x] All pages load without console errors  
- [x] MongoDB connection is successful  
- [x] Authentication flows work (Signup/Login)  
- [x] Sample data loads correctly  

---

Thank you for using OnlyFarmers.in — empowering India's farmers one click at a time!