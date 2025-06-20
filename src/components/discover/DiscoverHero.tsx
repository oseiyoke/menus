'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Sparkles } from 'lucide-react';

export function DiscoverHero() {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-accent-50 border-b border-primary-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Hero content */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-500" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Discover Amazing Menus
          </h1>
          
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Explore meal plans created by our community. Get inspired by what others are cooking 
            and find your next favorite menu.
          </p>

        </div>
      </div>
    </div>
  );
} 