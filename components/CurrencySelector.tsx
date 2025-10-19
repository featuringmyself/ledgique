'use client';

import { useState } from 'react';

interface CurrencySelectorProps {
  onSelect: (currency: string) => void;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
];

export default function CurrencySelector({ onSelect }: CurrencySelectorProps) {
  const [selected, setSelected] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  // Filter currencies based on search query
  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-2">Select Your Currency</h2>
        <p className="text-gray-600 mb-4">
          Please select your preferred currency for displaying financial data.
        </p>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by currency code or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
          {filteredCurrencies.length > 0 ? (
            filteredCurrencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => setSelected(currency.symbol)}
                className={`w-full text-left p-3 rounded border transition-colors ${
                  selected === currency.symbol
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold text-lg">{currency.symbol}</span>
                <span className="ml-2 text-gray-700">{currency.name}</span>
                <span className="ml-2 text-gray-500 text-sm">({currency.code})</span>
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-center">No currencies found.</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Save Currency
        </button>
      </div>
    </div>
  );
}