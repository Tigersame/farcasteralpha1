import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ViewState, UserXP, TokenData } from './types';
import { Navigation } from './components/Navigation';
import { Radar } from './components/Radar';
import { Launchpad } from './components/Launchpad';
import { Swap } from './components/Swap';
import { Liquidity } from './components/Liquidity';
import { Portfolio } from './components/Portfolio';
import { Airdrop } from './components/Airdrop';
import { useFarcasterSDK } from './services/farcasterService';
import { Trophy, Wallet, Loader2, Sun, Moon } from 'lucide-react';

// Initial Mock Data
const INITIAL_TOKENS: TokenData[] = [
  { id: '1', name: 'Clanker', ticker: 'CLANKER', price: 12.45, change24h: 125.4, marketCap: '45M', volume: '12M', image: 'https://picsum.photos/40/40?1', twitter: 'clankertoken' },
  { id: '2', name: 'Based Blue', ticker: 'BLUE', price: 0.0034, change24h: -5.2, marketCap: '2M', volume: '500K', image: 'https://picsum.photos/40/40?2', twitter: 'basedblue' },
  { id: '3', name: 'Higher', ticker: 'HIGHER', price: 0.12, change24h: 32.1, marketCap: '120M', volume: '45M', image: 'https://picsum.photos/40/40?3' },
  { id: '4', name: 'Virtual', ticker: 'VIRTUAL', price: 4.20, change24h: 8.5, marketCap: '80M', volume: '10M', image: 'https://picsum.photos/40/40?4', twitter: 'virtualprotocol' },
  { id: '5', name: 'Degen', ticker: 'DEGEN', price: 0.02, change24h: -2.1, marketCap: '400M', volume: '15M', image: 'https://picsum.photos/40/40?12', twitter: 'degentokenbase' },
  { id: '6', name: 'Toshi', ticker: 'TOSHI', price: 0.0003, change24h: 8.4, marketCap: '100M', volume: '2M', image: 'https://picsum.photos/40/40?3', twitter: 'toshibase' },
  { id: '7', name: 'Mochi', ticker: 'MOCHI', price: 0.00002, change24h: 15.6, marketCap: '85M', volume: '3M', image: 'https://picsum.photos/40/40?5' },
];

function App() {
  const { isReady, shareCast, user } = useFarcasterSDK();
  const { address, isConnected, status } = useAccount();
  const { connect, connectors } = useConnect();
  
  const [view, setView] = useState<ViewState>(ViewState.RADAR);
  const [selectedTicker, setSelectedTicker] = useState<string | undefined>(undefined);
  const [tokens, setTokens] = useState<TokenData[]>(INITIAL_TOKENS);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // XP System State
  const [xpData, setXpData] = useState<UserXP>({
    current: 1250,
    level: 3,
    nextLevelAt: 2000,
    history: []
  });

  // Notification State
  const [notification, setNotification] = useState<{show: boolean, amount: number, action: string}>({
    show: false, 
    amount: 0, 
    action: ''
  });

  // Theme Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme || 'dark';
    
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAddXp = (action: string, amount: number) => {
    setXpData(prev => {
        const newTotal = prev.current + amount;
        const newLevel = Math.floor(newTotal / 1000) + 1; // Simple level logic
        return {
            ...prev,
            current: newTotal,
            level: newLevel,
            nextLevelAt: newLevel * 1000,
            history: [{ action, amount, timestamp: Date.now() }, ...prev.history]
        };
    });

    // Trigger Notification
    setNotification({ show: true, amount, action: action.replace(/_/g, ' ') });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  // Background visual effect (Scanner line)
  const Scanner = () => (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        <div className="w-full h-1 bg-radar-green/30 absolute animate-scan shadow-[0_0_10px_rgba(0,255,65,0.5)]"></div>
    </div>
  );

  const XpToast = () => {
    if (!notification.show) return null;
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
            <div className="bg-radar-panel/95 border border-radar-green text-radar-text px-6 py-3 rounded-full shadow-[0_0_30px_rgba(0,255,65,0.4)] flex items-center gap-3 backdrop-blur-md">
                <div className="bg-radar-green text-black rounded-full p-1.5">
                    {notification.amount > 0 ? <Trophy size={16} fill="currentColor" /> : <Wallet size={16} />}
                </div>
                <div>
                    <div className="text-[10px] font-bold text-radar-textdim uppercase tracking-wider leading-none mb-1">
                        {notification.amount > 0 ? "XP Gained" : "System"}
                    </div>
                    <div className="text-sm font-bold flex items-center gap-2 leading-none">
                        {notification.amount > 0 && <span className="text-radar-green">+{notification.amount}</span>}
                        <span className="capitalize">{notification.action.toLowerCase()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const TopControls = () => (
    <div className="fixed top-3 right-3 z-40 flex items-center gap-2">
         {/* Theme Toggle */}
         <button 
            onClick={toggleTheme}
            className="bg-radar-panel/80 border border-radar-dim backdrop-blur rounded-full p-2 text-radar-text hover:border-radar-green hover:text-radar-green transition-colors shadow-lg"
        >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Wallet */}
        {status === 'connecting' || status === 'reconnecting' ? (
            <div className="bg-radar-panel/80 border border-radar-dim backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-2">
                <Loader2 size={12} className="text-radar-green animate-spin" />
                <span className="text-[10px] font-mono text-radar-textdim">Connecting...</span>
            </div>
        ) : isConnected && address ? (
            <div className="bg-radar-panel/80 border border-radar-green/30 backdrop-blur rounded-full pl-3 pr-1 py-1 flex items-center gap-2 shadow-lg cursor-pointer hover:border-radar-green transition-colors" onClick={() => setView(ViewState.PORTFOLIO)}>
                 <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-radar-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-radar-green"></span>
                </span>
                <span className="text-[10px] font-mono text-radar-text">
                    {address.slice(0, 4)}...{address.slice(-4)}
                </span>
                 <div className="bg-radar-dim p-1 rounded-full">
                    <Wallet size={12} className="text-radar-green" />
                </div>
            </div>
        ) : (
            <button 
                onClick={() => connect({ connector: connectors[0] })}
                className="bg-radar-text text-radar-bg font-bold text-[10px] px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            >
                CONNECT WALLET
            </button>
        )}
    </div>
  );

  const handleLaunchSuccess = (newToken: TokenData) => {
    setTokens(prev => [newToken, ...prev]);
    setSelectedTicker(newToken.ticker);
    setView(ViewState.SWAP);
  };

  const handleTrade = (ticker: string) => {
    setSelectedTicker(ticker);
    setView(ViewState.SWAP);
  };

  if (!isReady) {
    return (
        <div className="min-h-screen bg-radar-bg flex items-center justify-center text-radar-green font-mono">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-radar-dim border-t-radar-green rounded-full animate-spin"></div>
                <div className="text-xs tracking-widest animate-pulse">ESTABLISHING LINK...</div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-radar-bg text-radar-text font-sans relative overflow-hidden selection:bg-radar-green selection:text-black">
      <Scanner />
      <XpToast />
      <TopControls />
      
      <div className="relative z-10 max-w-md mx-auto min-h-screen bg-radar-bg/20 shadow-2xl">
        {view === ViewState.RADAR && <Radar tokens={tokens} onTrade={handleTrade} />}
        {view === ViewState.LAUNCH && <Launchpad onSuccess={handleLaunchSuccess} onAction={handleAddXp} />}
        {view === ViewState.SWAP && <Swap tokens={tokens} initialTicker={selectedTicker} onAction={handleAddXp} />}
        {view === ViewState.LIQUIDITY && <Liquidity tokens={tokens} onAction={handleAddXp} />}
        {view === ViewState.AIRDROP && <Airdrop userXp={xpData.current} onAction={handleAddXp} />}
        {view === ViewState.PORTFOLIO && <Portfolio onTrade={handleTrade} userXP={xpData} walletAddress={address || null} user={user} />}
      </div>

      <Navigation currentView={view} setView={setView} />
    </div>
  );
}

export default App;