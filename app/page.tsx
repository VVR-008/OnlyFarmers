"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// Optional: navbar can show user avatar if you pass one down (see NOTE below)
const demoUser = null; // or {name: "Priya Singh", avatar: "https://randomuser.me/api/portraits/women/44.jpg"}

const heroImages = [
  "https://plus.unsplash.com/premium_photo-1663945779301-2c51b59c911e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1682092047778-a5ebda1804e8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDV8fEluZGlhbiUyMEZhcm0lMjBsYW5kc3xlbnwwfHwwfHx8MA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1664303828953-3e8ef4ac44e2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTN8fEluZGlhbiUyMEZhcm0lMjBsYW5kc3xlbnwwfHwwfHx8MA%3D%3D"
];

const testimonials = [
  {
    name: "Sunil Sharma",
    feedback: "OnlyFarmers.in helped me sell my wheat crop directly to buyers at a fair price—payment was super fast!",
    avatar: "https://randomuser.me/api/portraits/men/29.jpg",
  },
  {
    name: "Priya Patel",
    feedback: "I found the best organic tomatoes just down the road. Loved the easy chat & ordering.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Ravi Kumar",
    feedback: "Finally, a platform where small farmers can compete and grow big. Community is very helpful.",
    avatar: "https://randomuser.me/api/portraits/men/54.jpg",
  },
];

const howItWorks = [
  {
    icon: "🧑‍🌾",
    title: "Sign Up Free",
    desc: "Farmers & buyers join with just a phone number.",
  },
  {
    icon: "🌱",
    title: "List or Browse Crops",
    desc: "Add your produce or discover what’s on offer around you.",
  },
  {
    icon: "🤝",
    title: "Chat & Transact Safely",
    desc: "Negotiate, order, and pay securely. We verify everyone.",
  },
];

// Optionally animate numbers
function useAnimatedNumber(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    if (target === 0) return setValue(0);
    const step = Math.ceil(target / (duration / 18));
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(interval);
        return;
      }
      setValue(start);
    }, 18);
    return () => clearInterval(interval);
  }, [target]);
  return value.toLocaleString();
}

// Navbar links for scroll
const NAV_LINKS = [
  { label: "Listings", href: "/listings" },
  { label: "Analytics", href: "/analytics" },
  { label: "Community", href: "/community" },
];

export default function LandingPage() {
  // Pick hero img on render (remains fixed)
  const [img, setImg] = useState(heroImages[0]);
  useEffect(() => {
    setImg(heroImages[Math.floor(Math.random() * heroImages.length)]);
  }, []);

  // Animated metrics
  const liveProducts = useAnimatedNumber(2345);
  const regFarmers = useAnimatedNumber(10104);
  const tonsTraded = useAnimatedNumber(43200);

  // Cycling testimonials
  const [testIdx, setTestIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTestIdx(i => (i + 1) % testimonials.length), 4200);
    return () => clearInterval(interval);
  }, []);

  // Mobile nav (optional)
  const [navOpen, setNavOpen] = useState(false);

  // NOTE: Replace demoUser with hooked auth user if you have one!
  const user = demoUser;

  return (
    <>
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-green-50/90 backdrop-blur border-b border-green-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2 lg:py-3">
          {/* Left/brand */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 select-none">
              <img src="/logo.svg" alt="OnlyFarmers.in Logo" className="h-8 w-8 object-contain" onError={e=>{(e.target as any).style.display='none'}} />
                <span className="font-extrabold text-lg md:text-xl text-green-700 tracking-tight drop-shadow">OnlyFarmers.in</span>
            </Link>
          </div>
          {/* Nav (desktop) */}
          <div className="hidden md:flex gap-6 items-center">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="font-medium text-green-800 hover:text-green-600 hover:underline transition">{link.label}</Link>
            ))}
            <Link href="/chat" className="text-green-700 hover:underline font-medium">AI Assistant</Link>
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1 focus:outline-none">
                  <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full border object-cover" />
                  <span className="font-semibold">{user.name.split(" ")[0]}</span>
                </button>
                <div className="hidden group-hover:flex flex-col absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow z-30">
                  <Link href="/dashboard" className="px-4 py-2 hover:bg-green-100 text-green-700">Dashboard</Link>
                  <button className="px-4 py-2 text-left hover:bg-red-50 text-red-600">Logout</button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="bg-white border border-green-600 text-green-700 font-semibold rounded-lg px-4 py-1.5 hover:bg-green-50 transition">Log In</Link>
                <Link href="/signup" className="bg-green-600 text-white rounded-lg px-4 py-1.5 font-bold shadow hover:bg-green-700 transition">Sign Up Free</Link>
              </>
            )}
          </div>
          {/* Mobile nav */}
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="md:hidden p-2 rounded text-green-700 border outline-none border-green-200 bg-white"
            aria-label="Menu"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="6" width="16" height="2" rx="1" fill="currentColor"/>
              <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
              <rect x="4" y="16" width="16" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>
        </div>
        {/* Mobile Nav Popup */}
        {navOpen && (
          <div className="md:hidden absolute top-14 left-0 w-full bg-white border-t border-green-200 shadow-lg z-40 flex flex-col py-4 gap-2 text-center">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="py-2 font-medium text-green-800 hover:text-green-600" onClick={()=>setNavOpen(false)}>{link.label}</Link>
            ))}
            <Link href="/chat" className="py-2 font-medium text-green-700 hover:underline" onClick={()=>setNavOpen(false)}>AI Assistant</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="py-2 text-green-700" onClick={()=>setNavOpen(false)}>Dashboard</Link>
                <button className="py-2 text-red-600" onClick={()=>setNavOpen(false)}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="py-2 text-green-700" onClick={()=>setNavOpen(false)}>Log In</Link>
                <Link href="/signup" className="py-2 font-bold text-white bg-green-600 rounded" onClick={()=>setNavOpen(false)}>Sign Up Free</Link>
              </>
            )}
          </div>
        )}
      </nav>
      {/* ---- Landing Main ---- */}
      <main className="bg-gradient-to-br from-green-50 via-white to-green-100 min-h-screen">

        {/* Hero Section */}
        <section className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-7 pt-16 md:pt-24 pb-14 gap-10">
          {/* Animated green shape */}
          <svg
            className="absolute top-2 -left-36 md:top-0 md:left-[-200px] opacity-20 animate-[wiggle_8s_ease-in-out_infinite]"
            height="420"
            width="420"
            viewBox="0 0 480 480"
            aria-hidden
          >
            <ellipse cx="240" cy="220" rx="230" ry="130" fill="#a7f3d0" />
          </svg>
          {/* Info and CTA */}
          <div className="max-w-xl z-10 flex flex-col items-start relative">
            <span className="mb-4 px-3 py-1 bg-green-100 text-green-700 font-bold rounded-lg text-xs tracking-wider uppercase shadow">
              Bharat’s #1 Agri Marketplace
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-green-800 mb-4 leading-tight drop-shadow animate-in fade-in">
              Empowering Farmers.<br/>
              <span className="bg-gradient-to-r from-green-700 via-lime-600 to-yellow-400 bg-clip-text text-transparent">
                Connecting India.
              </span>
            </h1>
            <p className="text-lg text-gray-700 mb-7">
              The fastest way to buy & sell crops, seeds, produce and more.<br />
              Trusted by <span className="font-bold text-green-700">10,000+</span> users nationwide.
            </p>
            <div className="flex gap-4">
              <Link
                href="/signup"
                className="motion-safe:animate-bounce focus:animate-none bg-green-600 text-white px-7 py-3 rounded-xl font-extrabold text-lg shadow-lg hover:bg-green-700 hover:scale-105 transition-all focus:ring-4 focus:ring-green-200"
              >
                Sign Up Free
              </Link>
              <Link
                href="/login"
                className="bg-white border-2 border-green-500 text-green-700 px-7 py-3 rounded-xl font-semibold hover:bg-green-50 hover:scale-105 transition-all"
              >
                Log In
              </Link>
            </div>
            <div className="flex gap-2 mt-3 text-sm text-gray-400 items-center">
              <svg className="h-4 w-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 1.25a1 1 0 01.99.858l.857 5.146a1 1 0 00.732.765l4.69 1.363a1 1 0 01.554 1.47l-3.055 4.742a1 1 0 00.182 1.241l3.907 3.513a1 1 0 01-1.269 1.569l-4.972-2.59a1 1 0 00-.968 0l-4.972 2.59a1 1 0 01-1.269-1.569l3.907-3.513a1 1 0 00.182-1.241l-3.055-4.742a1 1 0 01.554-1.47l4.69-1.363a1 1 0 00.732-.765l.857-5.146A1 1 0 0110 1.25z"/></svg>
            </div>
            <p className="text-xs text-gray-400 mt-1">Absolutely free for farmers & buyers. No card required.</p>
          </div>
          {/* Hero Image + credit */}
          <div className="rounded-3xl overflow-hidden shadow-2xl w-full md:w-[480px] md:aspect-[3/2] relative">
            <img
              src={img}
              alt="Farming in India"
              className="object-cover w-full h-full scale-105 motion-safe:animate-fade-in"
              loading="lazy"
              width={480}
              height={320}
            />
            <span className="absolute right-2 bottom-2 text-[11px] text-white bg-black/30 px-2 py-0.5 rounded">
              Photo by <a href="https://unsplash.com/s/photos/india-farm" className="underline" target="_blank" rel="noopener">Unsplash</a>
            </span>
          </div>
        </section>

        {/* How it works */}
        <section className="py-7 px-2 max-w-3xl mx-auto">
          <ol className="relative border-l-2 border-green-300">
            {howItWorks.map((step, i) => (
              <li key={step.title} className="mb-8 ml-6 flex items-start">
                <span className="absolute -left-5 flex items-center justify-center w-10 h-10 bg-green-200 rounded-full text-2xl border-2 border-white shadow">
                  {step.icon}
                </span>
                <div>
                  <div className="font-extrabold text-green-700">{step.title}</div>
                  <div className="text-gray-500 text-sm">{step.desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section className="bg-white border-t py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <Feature icon="💰" title="Fair Pricing" desc="Direct farm-to-market. No unfair commissions." />
            <Feature icon="🔒" title="Fast & Secure" desc="100% verified users, secure payments, instant chat." />
            <Feature icon="🌎" title="All India Coverage" desc="From Punjab to Tamil Nadu—pan-India connections." />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 flex flex-col items-center gap-8">
          <div className="flex flex-wrap justify-center gap-8">
            <StatCard label="Live Products" value={liveProducts} />
            <StatCard label="Farmers Registered" value={regFarmers} />
            <StatCard label="Tons Traded" value={tonsTraded} />
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link href="/listings" className="text-green-700 font-bold hover:underline">
              Browse all listings&nbsp;↗
            </Link>
            <Link href="/community" className="text-green-700 font-bold hover:underline">
              Join Community Forum
            </Link>
            <Link href="/analytics" className="text-green-700 font-bold hover:underline">
              See Crop Market Analytics
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-7 bg-gradient-to-r from-green-100 to-green-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img
                src={testimonials[testIdx].avatar}
                alt={testimonials[testIdx].name}
                className="w-9 h-9 rounded-full border-2 border-green-400 object-cover"
              />
              <div className="font-bold text-green-900">{testimonials[testIdx].name}</div>
            </div>
            <blockquote className="italic text-green-800 animate-fadein">
              {'"'+testimonials[testIdx].feedback+'"'}
            </blockquote>
          </div>
          <style>
            {`
            .animate-fadein { animation: fadein 0.7s; }
            @keyframes fadein { from { opacity:0; transform:translateY(18px);} to { opacity:1; transform:none; } }
            `}
          </style>
        </section>
        {/* Footer */}
        <footer className="border-t bg-white py-4 text-center text-gray-400 text-xs">
          &copy; {new Date().getFullYear()} OnlyFarmers.in. Made with <span className="text-green-600 font-bold">♥</span> in India.
        </footer>
      </main>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-green-50 border border-green-100 rounded-lg p-6 min-w-[140px] text-center hover:scale-105 shadow hover:shadow-lg cursor-pointer transition-all duration-200">
      <div className="text-2xl font-black text-green-800">{value}</div>
      <div className="text-gray-500 text-sm mt-1">{label}</div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-green-50 border border-green-100 p-5 flex flex-col items-start shadow hover:-translate-y-1 transition-all">
      <div className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-green-200 to-green-100 text-3xl mb-3">{icon}</div>
      <div className="font-extrabold text-green-700 text-lg">{title}</div>
      <div className="text-gray-500 text-sm">{desc}</div>
    </div>
  );
}
