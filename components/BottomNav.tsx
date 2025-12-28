import React from 'react';
import { Home, Users } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'tenants', icon: Users, label: 'Tenants' },
  ];

  return (
    <>
      <div className="h-24"></div> {/* Spacer */}
      <div className="fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-slate-900/90 backdrop-blur-lg text-white rounded-2xl shadow-2xl p-2 flex justify-around items-center px-6 h-16 border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={20} strokeWidth={2.5} />
                {isActive && <span className="text-xs font-bold tracking-wide">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};