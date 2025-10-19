// components/CurrencyProvider.tsx
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import CurrencySelector from '../CurrencySelector';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  refreshCurrency: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: '',
  setCurrency: () => {},
  refreshCurrency: async () => {},
});

export const useCurrency = () => useContext(CurrencyContext);

export default function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<string>('');
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrency = async () => {
    try {
      const response = await fetch('/api/currency', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Ensure fresh data
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.currency) {
          setCurrency(data.currency);
          setShowCurrencySelector(false);
        } else {
          // Currency not set, show selector
          setShowCurrencySelector(true);
        }
      } else if (response.status === 401) {
        // User not authenticated, don't show selector
        console.log('User not authenticated');
      } else {
        // Other error, show selector
        setShowCurrencySelector(true);
      }
    } catch (error) {
      console.error('Failed to fetch currency:', error);
      setShowCurrencySelector(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrency();
  }, []);

  const handleCurrencySelect = async (selectedCurrency: string) => {
    try {
      // Make the API POST request
      const response = await fetch('/api/currency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency: selectedCurrency }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the currency in state
        setCurrency(data.currency || selectedCurrency);
        // Hide the selector
        setShowCurrencySelector(false);
      } else {
        const error = await response.json();
        console.error('Failed to save currency:', error);
        alert('Failed to save currency. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save currency:', error);
      alert('Failed to save currency. Please try again.');
    }
  };

  const refreshCurrency = async () => {
    setIsLoading(true);
    await fetchCurrency();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, refreshCurrency }}>
      {showCurrencySelector && (
        <CurrencySelector onSelect={handleCurrencySelect} />
      )}
      {children}
    </CurrencyContext.Provider>
  );
}