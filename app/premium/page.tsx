'use client';

import Link from 'next/link';
import { Check, Crown, Building2 } from 'lucide-react';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PremiumPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handleSubscribe = async (tier: 'premium' | 'club') => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    setLoading(tier);

    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, email }),
    });

    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId });
    }

    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold">TheFairView</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mb-8">Get the most accurate pre-match and post-match analytics</p>
          
          {/* Email input */}
          <div className="max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* FREE */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-500">/month</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span>Basic RAI (3 top levers)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span>Basic PAI (3 top levers)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span>Last 10 matches</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span>NBA only</span>
              </li>
            </ul>
            <Link href="/" className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded-lg font-semibold">
              Current Plan
            </Link>
          </div>

          {/* PREMIUM */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl border-4 border-blue-600 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              🎁 1 MONTH FREE TRIAL
            </div>
            <div className="flex items-center mb-2">
              <Crown className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-2xl font-bold">Premium</h3>
            </div>
            <div className="text-4xl font-bold mb-6">$19<span className="text-lg text-gray-500">/month</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <span className="font-semibold">Complete RAI/PAI (all levers)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <span>Full season history</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <span>All 5 sports</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <span>Export PDF</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <span>Cancel anytime</span>
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('premium')}
              disabled={loading === 'premium'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition disabled:opacity-50"
            >
              {loading === 'premium' ? 'Loading...' : 'Start Free Trial'}
            </button>
          </div>

          {/* PREMIUM CLUB */}
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 text-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center mb-2">
              <Building2 className="w-6 h-6 mr-2" />
              <h3 className="text-2xl font-bold">Premium Club</h3>
            </div>
            <div className="text-4xl font-bold mb-6">$99<span className="text-lg opacity-80">/month</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                <span>Everything in Premium +</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                <span className="font-semibold">Upload your team data (CSV/Excel)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                <span>Custom RAI with your metrics</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                <span>API access</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                <span>Admin dashboard</span>
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('club')}
              disabled={loading === 'club'}
              className="w-full bg-yellow-400 text-purple-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {loading === 'club' ? 'Loading...' : 'Start Free Trial'}
            </button>
          </div>
        </div>

        {/* Features comparison */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-3xl font-bold mb-6">What You Get</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-xl mb-3">📊 Complete Analytics</h3>
              <p className="text-gray-600">Full RAI breakdown (20+ levers), PAI with concordance analysis, historical trends, team comparisons</p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-3">📅 Full Season Data</h3>
              <p className="text-gray-600">Access complete season history, filter by week/month/quarter, track performance evolution</p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-3">📄 Export & Share</h3>
              <p className="text-gray-600">Download reports as PDF, share with your team, create custom presentations</p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-3">🔄 Club Data Upload</h3>
              <p className="text-gray-600">Import your own metrics (injuries, training loads, custom KPIs) via CSV, Excel, or API</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
