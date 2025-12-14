'use client';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-blue-600">
            <ArrowLeft className="w-5 h-5 mr-2" />Back
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">Choose Your Level</h1>
        <p className="text-xl text-gray-600 text-center mb-12">From casual to professional analytics</p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 card-shadow">
            <h2 className="text-2xl font-bold mb-2">Free</h2>
            <div className="text-4xl font-bold mb-6">$0</div>
            <ul className="space-y-3 mb-8">
              <li className="flex"><Check className="w-5 h-5 text-green-600 mr-2"/>Latest PAI</li>
              <li className="flex"><Check className="w-5 h-5 text-green-600 mr-2"/>Next RAI</li>
              <li className="flex"><Check className="w-5 h-5 text-green-600 mr-2"/>Top 3 levers</li>
            </ul>
            <Link href="/" className="block w-full text-center bg-gray-200 py-3 rounded-lg">Current Plan</Link>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl p-8 card-shadow ring-4 ring-blue-300">
            <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold inline-block mb-4">
              POPULAR
            </div>
            <h2 className="text-2xl font-bold mb-2">Premium Analyst</h2>
            <div className="text-4xl font-bold mb-6">$49<span className="text-lg">/mo</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex"><Check className="w-5 h-5 mr-2"/>Everything in Free</li>
              <li className="flex"><Check className="w-5 h-5 mr-2"/>All levers</li>
              <li className="flex"><Check className="w-5 h-5 mr-2"/>Historical data</li>
              <li className="flex"><Check className="w-5 h-5 mr-2"/>Export data</li>
            </ul>
            <a href="mailto:eytan_ellenberg@yahoo.fr?subject=Premium Analyst" 
               className="block w-full text-center bg-white text-blue-600 py-3 rounded-lg font-medium">
              Contact for Access
            </a>
          </div>

          <div className="bg-white rounded-xl p-8 card-shadow">
            <h2 className="text-2xl font-bold mb-2">Premium Club</h2>
            <div className="text-4xl font-bold mb-6">Custom</div>
            <ul className="space-y-3 mb-8">
              <li className="flex"><Check className="w-5 h-5 text-green-600 mr-2"/>Everything in Analyst</li>
              <li className="flex"><Check className="w-5 h-5 text-green-600 mr-2"/>Upload your data</li>
              <li className="flex"><Check className="w-5 h-5 text-green-600 mr-2"/>Custom analysis</li>
              <li className="flex"><Check className="w-5 h-5 text-green-600 mr-2"/>API access</li>
            </ul>
            <a href="mailto:eytan_ellenberg@yahoo.fr?subject=Premium Club" 
               className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg">
              Contact for Quote
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
