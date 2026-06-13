import React from 'react';
import { Wrench } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4 font-sans text-neutral-100">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
            <Wrench className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold">MechHub <span className="text-blue-500">Ops</span></h1>
          <p className="text-neutral-500 text-sm mt-2">Zone Captain Dashboard</p>
        </div>

        {/* Login Form */}
        <form className="space-y-5" action="/dashboard">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5" htmlFor="phone">
              Phone Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-neutral-700 bg-neutral-800 text-neutral-400 text-sm">
                +977
              </span>
              <input
                type="tel"
                id="phone"
                className="flex-1 block w-full rounded-none rounded-r-lg bg-neutral-950 border border-neutral-700 text-neutral-100 px-4 py-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="98XXXXXXXX"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5" htmlFor="otp">
              One-Time Password (OTP)
            </label>
            <input
              type="text"
              id="otp"
              className="block w-full rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 px-4 py-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center tracking-[0.5em]"
              placeholder="••••••"
              maxLength={6}
            />
            <p className="text-xs text-neutral-500 mt-2 text-right">
              <a href="#" className="hover:text-blue-400 transition-colors">Send OTP</a>
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-neutral-900 transition-colors"
          >
            Sign In
          </button>
        </form>

      </div>
    </div>
  );
}
