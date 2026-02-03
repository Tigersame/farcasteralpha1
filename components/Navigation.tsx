import React from 'react';
import { ViewState } from '../types';
import { Radar, Rocket, Repeat, Wallet, Droplets } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: ViewState.RADAR, icon: Radar, label: 'Radar' },
    { id: ViewState.LAUNCH, icon: Rocket, label: 'Launch' },
    { id: ViewState.SWAP, icon: Repeat, label: 'Swap' },
    { id: ViewState.LIQUIDITY, icon: Droplets, label: 'Pools' },
    { id: ViewState.PORTFOLIO, icon: Wallet, label: 'Wallet' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-radar-panel border-t border-radar-dim pb-safe pt-2 px-2 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 w-14 transition-all duration-200 ${
                isActive ? 'text-radar-green scale-110 drop-shadow-[0_0_8px_rgba(0,255,65,0.5)]' : 'text-radar-textdim hover:text-radar-text'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] uppercase font-bold tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};