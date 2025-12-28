import React, { useState, useEffect } from 'react';
import { Property, Tenant, PropertyStatus } from './types';
import { DashboardView } from './views/DashboardView';
import { TenantsView } from './views/TenantsView';
import { BottomNav } from './components/BottomNav';

// Helpers to get dynamic current dates so the dashboard always looks alive
const now = new Date();
const currentYear = now.getFullYear();
const currentMonthStr = now.toLocaleString('default', { month: 'short' });

// Initial Mock Data (Fallback for new users)
const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'p1',
    name: 'Sunset Heights 3B',
    address: '123 Sunset Blvd, CA',
    rentAmount: 2400,
    status: PropertyStatus.OCCUPIED,
    bedrooms: 2,
    bathrooms: 2,
    description: 'Modern unit with great views and updated kitchen.',
    imageUrl: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: 'p3',
    name: 'Lakeside Villa',
    address: '88 Lakeview Dr',
    rentAmount: 3200,
    status: PropertyStatus.MAINTENANCE,
    bedrooms: 3,
    bathrooms: 2.5,
    description: 'Spacious villa undergoing renovations.',
    imageUrl: 'https://picsum.photos/400/300?random=3'
  }
];

// Dynamic mock tenants with Year-Month keys
const INITIAL_TENANTS: Tenant[] = [
  {
    id: 't1',
    name: 'frvd',
    email: 'frvd@example.com',
    phone: '555-0101',
    rentAmount: 1334,
    startDate: '2023-06-01',
    photoUrl: '', 
    payments: { [`${currentYear}-Jan`]: false, [`${currentYear}-Feb`]: false },
    paymentHistory: [],
    notes: 'Prefers communication via text. Lease renewal discussion pending for next month.'
  },
  {
    id: 't2',
    name: 'Yab',
    email: 'yab@example.com',
    phone: '555-0102',
    rentAmount: 1000,
    startDate: '2024-01-15',
    photoUrl: 'https://picsum.photos/200/200?random=11',
    // Example: Paid in Jan and Jun of the current year
    payments: { [`${currentYear}-Jan`]: true, [`${currentYear}-Feb`]: false, [`${currentYear}-Jun`]: true },
    paymentHistory: [
        { date: `6/01/${currentYear}`, action: 'Marked Jun as Paid' },
        { date: `1/20/${currentYear}`, action: 'Marked Jan as Paid' }
    ]
  },
  {
    id: 't3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '555-0103',
    rentAmount: 1200,
    startDate: '2023-11-01',
    photoUrl: 'https://picsum.photos/200/200?random=12',
    // Example: Paid current month and a past month
    payments: { [`${currentYear}-${currentMonthStr}`]: true, [`${currentYear}-Jan`]: true },
    paymentHistory: [
        { date: new Date().toLocaleDateString(), action: `Marked ${currentMonthStr} as Paid` }
    ],
    notes: 'Dog owner (Golden Retriever named Max). Security deposit includes pet fee.'
  }
];

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Load Properties from LocalStorage or use Initial Mock Data
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('rentflow_properties');
      return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
    } catch (error) {
      console.error("Failed to load properites from storage", error);
      return INITIAL_PROPERTIES;
    }
  });

  // Load Tenants from LocalStorage or use Initial Mock Data
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    try {
      const saved = localStorage.getItem('rentflow_tenants');
      return saved ? JSON.parse(saved) : INITIAL_TENANTS;
    } catch (error) {
      console.error("Failed to load tenants from storage", error);
      return INITIAL_TENANTS;
    }
  });

  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);

  // Load Theme from LocalStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('rentflow_theme');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      return false;
    }
  });

  // Effect to Persist Properties changes
  useEffect(() => {
    localStorage.setItem('rentflow_properties', JSON.stringify(properties));
  }, [properties]);

  // Effect to Persist Tenants changes
  useEffect(() => {
    localStorage.setItem('rentflow_tenants', JSON.stringify(tenants));
  }, [tenants]);

  // Effect to Persist Theme & Apply Class
  useEffect(() => {
    localStorage.setItem('rentflow_theme', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleAddTenant = (newTenant: Tenant) => {
    setTenants([newTenant, ...tenants]);
  };

  const handleUpdateTenant = (updatedTenant: Tenant) => {
    setTenants(tenants.map(t => t.id === updatedTenant.id ? updatedTenant : t));
  };

  const handleDeleteTenant = (tenantId: string) => {
    setTenants(tenants.filter(t => t.id !== tenantId));
  };

  const renderView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView tenants={tenants} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
      case 'tenants':
        return <TenantsView 
          tenants={tenants} 
          properties={properties} 
          onAddTenant={handleAddTenant} 
          onUpdateTenant={handleUpdateTenant} 
          onDeleteTenant={handleDeleteTenant}
          isAddModalOpen={isTenantModalOpen}
          onOpenAddModal={() => setIsTenantModalOpen(true)}
          onCloseAddModal={() => setIsTenantModalOpen(false)}
        />;
      default:
        return <DashboardView tenants={tenants} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans overflow-hidden flex flex-col items-center transition-colors duration-300">
      <main className="w-full max-w-md h-full bg-white dark:bg-slate-950 sm:shadow-2xl sm:border-x sm:border-white/10 dark:sm:border-slate-800 relative flex flex-col">
        <div className="flex-1 overflow-hidden relative">
            {renderView()}
        </div>
        <BottomNav 
            currentTab={currentTab} 
            onTabChange={setCurrentTab} 
        />
      </main>
    </div>
  );
};

export default App;