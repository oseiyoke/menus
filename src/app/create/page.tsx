'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';

export default function CreateMenuPage() {
  const router = useRouter();
  const [step, setStep] = useState<'period' | 'details'>('period');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [menuName, setMenuName] = useState('');
  const [menuDescription, setMenuDescription] = useState('');

  const { createMenuAsync, isCreating } = useMenu();

  const periodOptions = [
    { weeks: 1, label: '1 Week', description: 'Perfect for trying new recipes' },
    { weeks: 2, label: '2 Weeks', description: 'Great for balanced planning' },
    { weeks: 3, label: '3 Weeks', description: 'Comprehensive meal variety' },
    { weeks: 4, label: '4 Weeks', description: 'Full monthly meal plan' },
  ];

  const handleContinue = async () => {
    if (step === 'period') {
      setStep('details');
      return;
    }

    try {
      const newMenu = await createMenuAsync({
        name: menuName || `${selectedPeriod} Week Menu`,
        description: menuDescription,
        period_weeks: selectedPeriod as 1 | 2 | 3 | 4,
        start_date: new Date(),
      });

      if (newMenu) {
        router.push(`/create/success/${newMenu.id}`);
      }
    } catch (error) {
      console.error('Failed to create menu:', error);
    }
  };

  const handleBackToPeriod = () => {
    setStep('period');
  };

  const getStepTitle = () => {
    switch (step) {
      case 'period': return 'Select Period';
      case 'details': return 'Menu Details';
      default: return 'Create Menu';
    }
  };

  const canContinue = step === 'period' ? selectedPeriod > 0 : menuName.trim().length > 0;

  return (
    <div className="h-[100dvh] bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-5 border-b border-primary-100">
        <button 
          onClick={step === 'period' ? () => router.push('/') : handleBackToPeriod}
          className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center hover:bg-surface-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">{getStepTitle()}</h1>
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full transition-colors ${
              step === 'period' ? 'bg-primary-400' : 'bg-gray-300'
            }`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${
              step === 'details' ? 'bg-primary-400' : 'bg-gray-300'
            }`} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 flex justify-center overflow-y-auto">
        <div className="w-full max-w-md">
          {step === 'period' && (
            <div className="space-y-3 animate-in slide-in-from-right-5 duration-300">
              <div className="mb-6">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Choose how long you'd like your menu to span. You can always create additional menus later.
                </p>
              </div>
              {periodOptions.map((option) => (
                <div
                  key={option.weeks}
                  onClick={() => setSelectedPeriod(option.weeks)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPeriod === option.weeks
                      ? 'border-primary-400 bg-primary-50 shadow-sm'
                      : 'border-primary-200 bg-surface-100 hover:bg-primary-50 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {option.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedPeriod === option.weeks
                        ? 'border-primary-400'
                        : 'border-gray-300'
                    }`}>
                      {selectedPeriod === option.weeks && (
                        <div className="w-2 h-2 bg-primary-400 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
              <div className="mb-6">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Give your menu a name and description to help you remember what makes it special.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="menuName" className="block text-sm font-medium text-gray-700 mb-2">
                    Menu Name *
                  </label>
                  <input
                    id="menuName"
                    type="text"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    placeholder="e.g., Family Favorites, Quick & Easy, Holiday Meals"
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="menuDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    id="menuDescription"
                    value={menuDescription}
                    onChange={(e) => setMenuDescription(e.target.value)}
                    placeholder="What makes this menu special? Any dietary preferences or themes?"
                    rows={3}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Menu Preview</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Name:</strong> {menuName || 'Untitled Menu'}</p>
                  <p><strong>Duration:</strong> {selectedPeriod} week{selectedPeriod !== 1 ? 's' : ''} ({selectedPeriod * 7} days)</p>
                  {menuDescription && <p><strong>Description:</strong> {menuDescription}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-primary-100 flex justify-center">
        <div className="w-full max-w-md">
          <button
            onClick={handleContinue}
            disabled={!canContinue || isCreating}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              canContinue
                ? 'bg-primary-400 text-white hover:bg-primary-500 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === 'period' ? 'Continue' : 'Create Menu'}
          </button>
        </div>
      </div>
    </div>
  );
} 