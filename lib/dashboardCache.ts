// Dashboard data caching utilities
export interface DashboardCacheData {
  criticalData: {
    projectCount: string;
    clientCount: string;
    pendingAmount: string;
    revenue: string;
    revenueChange: string;
    projectChange: string;
    clientChange: string;
    pendingChange: string;
  };
  chartsData: {
    monthlyData: {month: string; clients: number; projects: number}[];
    projectStatusData: {name: string; value: number; color: string}[];
    paymentMethodsData: {method: string; count: number; percentage: string}[];
    clientSourcesData: {name: string; percentage: number}[];
    recentActivity: {type: string; title: string; date: string; amount?: string}[];
  };
  timestamp: number;
}

const CACHE_KEY = 'dashboard_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const getCachedDashboardData = (): DashboardCacheData | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: DashboardCacheData = JSON.parse(cached);
    return data; // Always return cached data if it exists, regardless of expiry
  } catch (error) {
    console.error('Error reading cached dashboard data:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

export const isCacheExpired = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return true;
    
    const data: DashboardCacheData = JSON.parse(cached);
    const now = Date.now();
    
    return now - data.timestamp > CACHE_EXPIRY;
  } catch (error) {
    console.error('Error checking cache expiry:', error);
    return true;
  }
};

export const setCachedDashboardData = (data: Omit<DashboardCacheData, 'timestamp'>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheData: DashboardCacheData = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching dashboard data:', error);
  }
};

export const clearDashboardCache = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
};

// Helper function to compare data and detect changes
export const hasDataChanged = (
  oldData: DashboardCacheData | null,
  newData: Omit<DashboardCacheData, 'timestamp'>
): boolean => {
  if (!oldData) return true;
  
  // Compare critical data
  const criticalChanged = Object.keys(newData.criticalData).some(
    key => oldData.criticalData[key as keyof typeof oldData.criticalData] !== 
           newData.criticalData[key as keyof typeof newData.criticalData]
  );
  
  if (criticalChanged) return true;
  
  // Compare charts data
  const chartsChanged = 
    JSON.stringify(oldData.chartsData.monthlyData) !== JSON.stringify(newData.chartsData.monthlyData) ||
    JSON.stringify(oldData.chartsData.projectStatusData) !== JSON.stringify(newData.chartsData.projectStatusData) ||
    JSON.stringify(oldData.chartsData.paymentMethodsData) !== JSON.stringify(newData.chartsData.paymentMethodsData) ||
    JSON.stringify(oldData.chartsData.clientSourcesData) !== JSON.stringify(newData.chartsData.clientSourcesData) ||
    JSON.stringify(oldData.chartsData.recentActivity) !== JSON.stringify(newData.chartsData.recentActivity);
  
  return chartsChanged;
};
