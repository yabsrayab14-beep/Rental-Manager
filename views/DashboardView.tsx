import React, { useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Tenant } from '../types';
import { Wallet, Users, ArrowUpRight, TrendingUp, Calendar, ChevronDown, Camera, Moon, Sun } from 'lucide-react';

interface DashboardViewProps {
  tenants: Tenant[];
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = [2023, 2024, 2025, 2026];

export const DashboardView: React.FC<DashboardViewProps> = ({ tenants, isDarkMode, toggleTheme }) => {
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<string>('All');
  const [profileImage, setProfileImage] = useState<string>('https://picsum.photos/100/100');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Profile Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate Stats based on filters
  const stats = useMemo(() => {
    let monthlyIncome: Record<string, number> = {};
    MONTHS.forEach(m => monthlyIncome[m] = 0);
    
    let totalRevenue = 0;
    let collectedRevenue = 0;
    
    tenants.forEach(tenant => {
        const rent = tenant.rentAmount || 0;
        
        // Calculate Total Potential Revenue (Annual)
        totalRevenue += rent * 12;

        // Calculate Collected Revenue based on Payments
        Object.entries(tenant.payments).forEach(([key, isPaid]) => {
            if (!isPaid) return;
            
            // Expected Key Format: "YYYY-MMM" (e.g. "2024-Jan")
            const [yearStr, monthStr] = key.split('-');
            if (parseInt(yearStr) === filterYear) {
                // If filtering by specific month, only count that month
                if (filterMonth === 'All' || filterMonth === monthStr) {
                    monthlyIncome[monthStr] = (monthlyIncome[monthStr] || 0) + rent;
                    collectedRevenue += rent;
                }
            }
        });
    });

    return {
        monthlyIncome,
        collectedRevenue,
        totalRevenue,
        activeTenants: tenants.length
    };
  }, [tenants, filterYear, filterMonth]);

  // Prepare Chart Data
  const trendData = useMemo(() => {
     return MONTHS.map(month => ({
         name: month,
         income: stats.monthlyIncome[month] || 0,
         // Dim bar if filtering by specific month and it's not the selected one
         active: filterMonth === 'All' || filterMonth === month
     }));
  }, [stats.monthlyIncome, filterMonth]);


  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs py-2 px-3 rounded-lg shadow-xl border border-slate-700 dark:border-slate-600">
          <p className="font-bold mb-1">{label} {filterYear}</p>
          <p className="font-mono text-emerald-400">
             +${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 pb-32 animate-fade-in bg-slate-50/50 dark:bg-slate-950 h-full overflow-y-auto no-scrollbar transition-colors overscroll-y-contain">
      
      {/* Header with Profile & Date Filter */}
      <header className="flex justify-between items-start mb-2">
        <div>
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <button 
                    onClick={toggleTheme} 
                    className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-105 active:scale-95 transition-all"
                >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
                {/* Year Filter */}
                <div className="relative group">
                    <select 
                        value={filterYear} 
                        onChange={(e) => setFilterYear(Number(e.target.value))}
                        className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition-colors"
                    >
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Month Filter */}
                <div className="relative group">
                    <select 
                        value={filterMonth} 
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition-colors"
                    >
                        <option value="All">All Year</option>
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>
        </div>
        
        {/* Functional Profile Image */}
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
             <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden transition-transform active:scale-95">
                 <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
             </div>
             <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <Camera size={16} className="text-white drop-shadow-md" />
             </div>
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
             />
        </div>
      </header>

      {/* Hero Revenue Card */}
      <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20 dark:shadow-black/40 relative overflow-hidden group">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500 rounded-full blur-[60px] opacity-40 -mr-10 -mt-10 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500 rounded-full blur-[50px] opacity-20 -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/5">
                    <Wallet className="w-6 h-6 text-brand-300" />
                </div>
                <div className="flex items-center space-x-1 text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                    <ArrowUpRight size={14} />
                    <span className="text-xs font-bold">
                        {filterMonth !== 'All' ? filterMonth : filterYear}
                    </span>
                </div>
            </div>
            
            <div className="space-y-1 mb-2">
                <p className="text-slate-400 text-sm font-medium">Collected Revenue</p>
                <h2 className="text-4xl font-bold tracking-tight text-white">${stats.collectedRevenue.toLocaleString()}</h2>
            </div>
            <div className="flex items-center gap-2">
                 <div className="h-1 flex-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-400 to-emerald-400 w-full animate-pulse"></div>
                 </div>
                 <span className="text-[10px] text-slate-400">Live Data</span>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Total Tenants Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                    <Users size={24} />
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeTenants}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Tenants</p>
                </div>
            </div>
             <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">
                 Occupied
             </div>
        </div>
      </div>

      {/* Visual Data Section: New Bar Chart Design */}
      <div className="grid gap-6">
          {/* Revenue Trend Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp size={18} className="text-brand-500"/>
                        Revenue Breakdown
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">{filterYear}</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6}/>
                        </linearGradient>
                        <linearGradient id="barGradientDim" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#cbd5e1" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#e2e8f0" stopOpacity={0.6}/>
                        </linearGradient>
                         <linearGradient id="barGradientDimDark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#334155" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#475569" stopOpacity={0.6}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: isDarkMode ? '#94a3b8' : '#94a3b8', fontSize: 11, fontWeight: 500}} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 11}}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}} />
                    <Bar 
                        dataKey="income" 
                        radius={[6, 6, 6, 6]}
                        barSize={24}
                        animationDuration={1000}
                    >
                         {trendData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.active ? 'url(#barGradient)' : (isDarkMode ? 'url(#barGradientDimDark)' : 'url(#barGradientDim)')} 
                            />
                         ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
      </div>
    </div>
  );
};