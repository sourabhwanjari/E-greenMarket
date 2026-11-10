import React from 'react';
import VegetableCalculator from '../../components/calculator/VegetableCalculator';

export default function CalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Vegetable Weight & Price Calculator
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Calculate individual vegetable and fruit costs with high-precision gram and kilogram arithmetic. Add items to your shopping cart or transfer directly to the physical shop POS billing terminal.
        </p>
      </div>

      <VegetableCalculator />
    </div>
  );
}
