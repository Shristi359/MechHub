import Link from 'next/link';
import { ArrowRight, Wrench, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Navbar */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">MechHub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Portal Login
            </Link>
            <Link 
              href="/login"
              className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8">
          <Zap className="h-4 w-4" />
          <span>Now operating in Kathmandu Valley</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl">
          On-demand vehicle repair, <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">anywhere.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mb-10">
          MechHub connects stranded drivers with the nearest qualified mechanics instantly. Get back on the road safely and securely.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/login"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 active:scale-95"
          >
            Access Dispatch Console
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="#download"
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-4 rounded-full font-semibold transition-all"
          >
            Download Mobile App
          </a>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mt-24 text-left">
          <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
            <Shield className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Verified Mechanics</h3>
            <p className="text-neutral-400">Every professional on our network is background-checked and highly rated.</p>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
            <Zap className="h-8 w-8 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Instant Dispatch</h3>
            <p className="text-neutral-400">Our routing algorithm finds the closest available help within seconds.</p>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
            <Wrench className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Fair Pricing</h3>
            <p className="text-neutral-400">Transparent upfront quotes with no hidden roadside exploitation fees.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-800 py-8 text-center text-neutral-500 text-sm">
        <p>© 2026 MechHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
