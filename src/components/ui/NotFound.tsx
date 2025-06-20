import React from 'react';
import Link from 'next/link';

interface NotFoundProps {
  title?: string;
  message?: string;
  actionText?: string;
  actionHref?: string;
}

export function NotFound({ 
  title = 'Not Found',
  message = 'The page you are looking for does not exist.',
  actionText = 'Go Home',
  actionHref = '/'
}: NotFoundProps) {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl text-gray-300 mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-6 py-3 bg-primary-400 text-white font-medium rounded-xl hover:bg-primary-500 transition-colors shadow-sm"
        >
          {actionText}
        </Link>
      </div>
    </div>
  );
} 