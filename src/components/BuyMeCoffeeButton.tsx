
import React from 'react';
import { Coffee } from 'lucide-react';

interface BuyMeCoffeeButtonProps {
  darkMode: boolean;
}

export default function BuyMeCoffeeButton({ darkMode }: BuyMeCoffeeButtonProps) {
  return (
    <div className="mt-6 pt-4 border-t border-opacity-20">
      <a
        href="https://buymeacoffee.com/michaelaglen"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 ${
          darkMode 
            ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
        } shadow-lg`}
      >
        <Coffee size={18} />
        <span className="text-sm font-medium">Buy me a coffee</span>
      </a>
    </div>
  );
}
