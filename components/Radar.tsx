import React, { useState, useMemo } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { TokenData } from '../types';
import { TrendingUp, Activity, Search, X, Twitter } from 'lucide-react';

interface RadarProps {
  onTrade: (ticker: string) => void;
  tokens: TokenData[];
}

type FilterOption = 'ALL' | 'GAINERS' | 'VOLUME' | 'MCAP';
type TimeRange = '1H' | '1D' | '1W' | '1M';

export const Radar: React.FC<RadarProps> = ({ onTrade, tokens }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('ALL');
  const [showSearch, setShowSearch] = useState(false);
  const [chartRange, setChartRange] = useState<TimeRange>('1D');

  // Helper to parse "1.2M", "400K" strings into numbers for sorting
  const parseScale = (val: string) => {
    if (!val) return 0;
    const num = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (val.toUpperCase().includes('B')) return num * 1e9;
    if (val.toUpperCase().includes('M')) return num * 1e6;
    if (val.toUpperCase().includes('K')) return num * 1e3;
    return num;
  };

  const processedData = useMemo(() => {
    let data = [...tokens];

    // 1. Search Filter
    if (searchQuery) {
      data = data.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.ticker.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Sorting based on Filter
    switch (activeFilter) {
      case 'GAINERS':
        data.sort((a, b) => b.change24h - a.change24h);
        break;
      case 'VOLUME':
        data.sort((a, b) => parseScale(b.volume) - parseScale(a.volume));
        break;
      case 'MCAP':
        data.sort((a, b) => parseScale(b.marketCap) - parseScale(a.marketCap));
        break;
      default:
        // Default order (usually ID or random)
        break;
    }

    return data;
  }, [searchQuery, activeFilter, tokens]);

  const handleOpenTwitter = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    try {
        sdk.actions.openUrl(`https://x.com/${handle}`);
    } catch (err) {
        console.error("Failed to open URL", err);
    }
  };

  const PriceChart = ({ token }: { token: TokenData }) => {
    const points = useMemo(() => {
        const count = 40;
        let data = [];
        let y = 50;
        // Generate pseudo-random chart data based on range
        const volatility = chartRange === '1H' ? 2 : chartRange === '1M' ? 10 : 5;
        
        for (let i = 0; i < count; i++) {
            y += (Math.random() - 0.45) * volatility;
            // Keep within bounds roughly
            if (y < 10) y = 10;
            if (y > 90) y = 90;
            data.push(y);
        }
        
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        
        return data.map((val, i) => {
            const x = (i / (count - 1)) * 100;
            const normalizedY = 100 - ((val - min) / range) * 70 - 15; 
            return `${x},${normalizedY}`;
        }).join(' ');
    }, [token.id, chartRange]);

    const isPositive = token.change24h >= 0;
    const color = isPositive ? '#00ff41' : '#ef4444';

    return (
        <div className="w-full h-32 mt-2 mb-2 relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id={`grad-${token.id}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M0,100 L${points} L100,100 Z`} fill={`url(#grad-${token.id})`} />
                <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            
            {/* Range Filters */}
            <div className="absolute top-0 right-0 flex gap-1 bg-black/40 p-1 rounded-lg backdrop-blur-sm">
                {(['1H', '1D', '1W', '1M'] as TimeRange[]).map((r) => (
                    <button 
                        key={r}
                        onClick={(e) => { e.stopPropagation(); setChartRange(r); }}
                        className={`text-[9px] px-2 py-0.5 rounded transition-all font-mono ${
                            chartRange === r 
                            ? 'bg-radar-green text-black font-bold' 
                            : 'text-radar-textdim hover:text-white'
                        }`}
                    >
                        {r}
                    </button>
                ))}
            </div>
        </div>
    );
  };

  return (
    <div className="pb-24 pt-4 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 h-10">
        {!showSearch ? (
            <>
                <div>
                  <h1 className="text-2xl font-bold text-radar-text flex items-center gap-2">
                    <Activity className="text-radar-green animate-pulse-fast" />
                    ALPHA RADAR
                  </h1>
                  <p className="text-xs text-radar-textdim font-mono tracking-wider">LIVE FEED :: BASE MAINNET</p>
                </div>
                <button 
                    onClick={() => setShowSearch(true)}
                    className="bg-radar-panel p-2 rounded-full border border-radar-dim hover:border-radar-green/50 transition-colors"
                >
                    <Search size={20} className="text-radar-textdim" />
                </button>
            </>
        ) : (
            <div className="flex items-center gap-2 w-full animate-fade-in">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-radar-textdim" />
                    <input 
                        autoFocus
                        type="text"
                        placeholder="Search ticker or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-radar-panel border border-radar-green/50 rounded-full py-2 pl-9 pr-4 text-radar-text text-sm outline-none placeholder-radar-textdim focus:border-radar-green focus:shadow-[0_0_10px_rgba(0,255,65,0.2)] transition-all"
                    />
                </div>
                <button 
                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                    className="p-2 text-radar-textdim hover:text-radar-text"
                >
                    <X size={20} />
                </button>
            </div>
        )}
      </div>

      {/* Featured Card - Only show if no search query & All filter */}
      {!searchQuery && activeFilter === 'ALL' && tokens.length > 0 && (
          <div className="bg-gradient-to-br from-radar-dim to-radar-panel border border-radar-green/30 rounded-xl p-5 mb-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-radar-green/50 shadow-[0_0_10px_#00ff41]"></div>
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-radar-green/10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-bold bg-radar-green text-black px-2 py-0.5 rounded-sm">TOP GAINER</span>
                    <div className="flex items-center gap-2 mt-2">
                        <h3 className="text-xl font-bold text-radar-text">{tokens[0].ticker}</h3>
                        {tokens[0].twitter && (
                            <button 
                                onClick={(e) => handleOpenTwitter(e, tokens[0].twitter!)}
                                className="text-radar-textdim hover:text-radar-green transition-colors p-1"
                            >
                                <Twitter size={14} />
                            </button>
                        )}
                    </div>
                    <span className="text-sm text-radar-textdim">${tokens[0].price}</span>
                </div>
                <div className="text-right">
                    <div className="text-radar-green font-mono text-xl font-bold flex items-center justify-end gap-1">
                        <TrendingUp size={18} />
                        +{tokens[0].change24h}%
                    </div>
                    <div className="text-xs text-radar-textdim mt-1">Vol: {tokens[0].volume}</div>
                </div>
            </div>
            
            <PriceChart token={tokens[0]} />

            <button 
                onClick={() => onTrade(tokens[0].ticker)}
                className="w-full bg-radar-text/5 hover:bg-radar-text/10 border border-radar-text/10 text-radar-text font-medium py-2 rounded transition-colors"
            >
                Trade Now
            </button>
          </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {[
            { id: 'ALL', label: 'All' },
            { id: 'GAINERS', label: 'Top Gainers' },
            { id: 'VOLUME', label: 'Volume' },
            { id: 'MCAP', label: 'Market Cap' }
        ].map((filter) => (
            <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as FilterOption)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    activeFilter === filter.id 
                    ? 'bg-radar-green text-black border-radar-green shadow-[0_0_10px_rgba(0,255,65,0.2)]' 
                    : 'bg-radar-panel text-radar-textdim border-radar-dim hover:border-radar-textdim/50'
                }`}
            >
                {filter.label}
            </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {processedData.length > 0 ? (
            processedData.map((token) => (
                <div 
                    key={token.id}
                    onClick={() => onTrade(token.ticker)}
                    className="flex items-center justify-between bg-radar-panel border border-radar-dim p-4 rounded-lg hover:border-radar-green/50 transition-all cursor-pointer active:scale-[0.98] group"
                >
                    <div className="flex items-center gap-3">
                        <img src={token.image} alt={token.name} className="w-10 h-10 rounded-full bg-gray-800 object-cover" />
                        <div>
                            <div className="font-bold text-radar-text group-hover:text-radar-green transition-colors flex items-center gap-2">
                                {token.ticker}
                                {token.twitter && (
                                    <button 
                                        onClick={(e) => handleOpenTwitter(e, token.twitter!)}
                                        className="text-radar-textdim hover:text-blue-400 transition-colors z-10"
                                    >
                                        <Twitter size={12} />
                                    </button>
                                )}
                            </div>
                            <div className="text-xs text-radar-textdim">{token.name}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-radar-text font-mono">${token.price < 0.01 ? token.price.toFixed(6) : token.price.toFixed(2)}</div>
                        <div className={`text-xs font-bold ${token.change24h >= 0 ? 'text-radar-green' : 'text-red-500'}`}>
                            {token.change24h > 0 ? '+' : ''}{token.change24h}%
                        </div>
                        <div className="text-[10px] text-radar-textdim mt-1 font-mono opacity-80">
                            MC {token.marketCap} / Vol {token.volume}
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-10 text-radar-textdim">
                <Search size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tokens found matching "{searchQuery}"</p>
            </div>
        )}
      </div>
    </div>
  );
};