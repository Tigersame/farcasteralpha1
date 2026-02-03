import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDownUp, Settings, ChevronDown, Loader2, X, Info, CheckCircle2, Wallet, Trophy, Zap, Clock, TrendingUp, BarChart2, RefreshCcw, AlertTriangle } from 'lucide-react';
import { TokenData } from '../types';

type GasSpeed = 'SLOW' | 'AVERAGE' | 'FAST';
type TimeRange = '1H' | '1D' | '1W' | '1M';

interface SwapProps {
  initialTicker?: string;
  onAction: (action: string, amount: number) => void;
  tokens: TokenData[];
}

const ZapIcon = () => <Zap size={12} className="text-yellow-500 fill-yellow-500" />;

export const Swap: React.FC<SwapProps> = ({ initialTicker, onAction, tokens }) => {
  // Ensure we have ETH for input, otherwise fallback to first token
  const defaultInput = tokens.find(t => t.ticker === 'ETH') || tokens[0];
  
  // --- STATE ---
  const [inputToken, setInputToken] = useState<TokenData>(defaultInput);
  const [outputToken, setOutputToken] = useState<TokenData>(
    initialTicker ? tokens.find(t => t.ticker === initialTicker) || tokens[1] : tokens[1]
  );
  
  const [inputAmount, setInputAmount] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<string>('');
  const [isQuoting, setIsQuoting] = useState(false);
  
  // UI States
  const [selectorType, setSelectorType] = useState<'input' | 'output' | null>(null);
  const [swapState, setSwapState] = useState<'idle' | 'review' | 'processing' | 'success'>('idle');
  const [gasSpeed, setGasSpeed] = useState<GasSpeed>('AVERAGE');
  const [showSettings, setShowSettings] = useState(false);
  const [showChart, setShowChart] = useState(false);
  
  // Advanced Settings State
  const [slippage, setSlippage] = useState(0.5); // %
  const [customSlippage, setCustomSlippage] = useState('');
  const [deadline, setDeadline] = useState(20); // minutes
  
  // Chart State
  const [chartRange, setChartRange] = useState<TimeRange>('1D');
  const [earnedXP, setEarnedXP] = useState(0);

  // Mock Quote Data
  const [quoteDetails, setQuoteDetails] = useState({
    rate: 0,
    baseGasUsd: 0.01,
    priceImpact: 0,
    estimatedSlippage: 0,
    provider: 'Uniswap V3'
  });

  // Mock Balances
  const getBalance = (ticker: string) => {
    // Simple mock balance logic for demo
    if (ticker === 'ETH') return 2.45;
    if (ticker === 'USDC') return 1250.00;
    // For newly launched tokens, maybe give some balance?
    return 0;
  };

  const handlePercentage = (percent: number) => {
    const bal = getBalance(inputToken.ticker);
    if (bal > 0) {
        // If ETH, reserve 0.01 for gas
        const gasBuffer = inputToken.ticker === 'ETH' ? 0.01 : 0;
        const available = Math.max(0, bal - gasBuffer);
        
        const val = parseFloat((available * (percent / 100)).toFixed(6));
        setInputAmount(val.toString());
    }
  };

  // --- HELPER: Gas Calculation ---
  const getGasConfig = (speed: GasSpeed) => {
    switch (speed) {
      case 'SLOW': return { multiplier: 0.8, label: 'Slow', time: '~3 min' };
      case 'FAST': return { multiplier: 1.5, label: 'Fast', time: '~15 sec' };
      default: return { multiplier: 1.0, label: 'Avg', time: '~45 sec' };
    }
  };

  const currentGasCost = quoteDetails.baseGasUsd * getGasConfig(gasSpeed).multiplier;

  // --- EFFECTS ---
  
  // Reset review state if amounts change
  useEffect(() => {
    if (swapState === 'review') {
        setSwapState('idle');
    }
  }, [inputAmount, outputAmount, inputToken, outputToken]);

  // Update output token if initialTicker changes (e.g. from Launchpad redirect)
  useEffect(() => {
    if (initialTicker) {
        const found = tokens.find(t => t.ticker === initialTicker);
        if (found) setOutputToken(found);
    }
  }, [initialTicker, tokens]);

  // Quote Simulation
  useEffect(() => {
    if (!inputAmount || parseFloat(inputAmount) === 0) {
        setOutputAmount('');
        return;
    }

    const fetchQuote = async () => {
        setIsQuoting(true);
        // Simulate network delay
        await new Promise(r => setTimeout(r, 600));
        
        // Handle case where price might be 0 for new tokens
        const inPrice = inputToken.price || 0.0001;
        const outPrice = outputToken.price || 0.0001;
        
        const rate = inPrice / outPrice;
        const estimatedOut = parseFloat(inputAmount) * rate;
        
        // Simulate slippage/impact
        const impact = parseFloat(inputAmount) > 1000 ? 0.05 : 0.01;
        const estSlippage = Math.max(0.001, impact * 0.5 + (Math.random() * 0.01));
        const finalAmount = estimatedOut * (1 - impact/100);
        
        setOutputAmount(finalAmount.toFixed(6));
        setQuoteDetails({
            rate,
            baseGasUsd: 0.01 + (Math.random() * 0.04), // Base costs are typically $0.01 - $0.05
            priceImpact: impact,
            estimatedSlippage: estSlippage,
            provider: Math.random() > 0.5 ? 'Uniswap V3' : 'Aerodrome'
        });
        setIsQuoting(false);
    };

    const timer = setTimeout(fetchQuote, 500); // Debounce
    return () => clearTimeout(timer);
  }, [inputAmount, inputToken, outputToken]);


  // --- HANDLERS ---

  const handleSwitch = () => {
    const tempT = inputToken;
    const tempA = inputAmount;
    setInputToken(outputToken);
    setOutputToken(tempT);
    setInputAmount(outputAmount); 
  };

  const handleSelectToken = (token: TokenData) => {
    if (selectorType === 'input') {
        if (token.id === outputToken.id) setOutputToken(inputToken);
        setInputToken(token);
    } else {
        if (token.id === inputToken.id) setInputToken(outputToken);
        setOutputToken(token);
    }
    setSelectorType(null);
  };

  const handleExecuteSwap = () => {
    setSwapState('processing');
    
    // Calculate value for XP
    const usdValue = parseFloat(inputAmount) * inputToken.price;
    // Formula: 25 Base XP + 1 XP per $1 value
    const xp = Math.floor(usdValue) + 25;
    setEarnedXP(xp);

    setTimeout(() => {
        setSwapState('success');
        onAction('SWAP', xp); // Award calculated XP
    }, 2500);
  };

  const resetSwap = () => {
    setInputAmount('');
    setOutputAmount('');
    setSwapState('idle');
  };

  // --- SUB-COMPONENTS ---

  const PriceChart = () => {
    // Generate simple mock SVG path based on time range
    const points = useMemo(() => {
        const count = 50;
        let data = [];
        let y = 50;
        for (let i = 0; i < count; i++) {
            y += (Math.random() - 0.45) * 10; 
            data.push(y);
        }
        // Normalize to 0-100 height
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;
        
        return data.map((val, i) => {
            const x = (i / (count - 1)) * 100;
            const normalizedY = 100 - ((val - min) / range) * 80 - 10; // keep padding
            return `${x},${normalizedY}`;
        }).join(' ');
    }, [chartRange, inputToken]);

    const isPositive = inputToken.change24h >= 0;
    const color = isPositive ? '#00ff41' : '#ef4444';

    return (
        <div className="bg-radar-panel border border-radar-dim rounded-xl p-4 mb-4 animate-fade-in shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <img src={inputToken.image} className="w-6 h-6 rounded-full object-cover" />
                    <img src={outputToken.image} className="w-6 h-6 rounded-full -ml-3 border border-radar-textdim/50 object-cover" />
                    <span className="font-bold text-radar-text text-sm">{inputToken.ticker}/{outputToken.ticker}</span>
                </div>
                <div className="flex bg-radar-dim/50 rounded-lg p-0.5">
                    {(['1H', '1D', '1W', '1M'] as TimeRange[]).map(r => (
                        <button 
                            key={r}
                            onClick={() => setChartRange(r)}
                            className={`text-[10px] px-2 py-1 rounded transition-all ${chartRange === r ? 'bg-radar-green text-black font-bold' : 'text-radar-textdim hover:text-radar-text'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="h-40 w-full relative">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                     <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={`M0,100 L${points} L100,100 Z`} fill="url(#chartGradient)" />
                    <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>
            </div>
            <div className="flex justify-between text-[10px] text-radar-textdim mt-2 font-mono border-t border-radar-dim/30 pt-2">
                <span>{new Date().toLocaleDateString()}</span>
                <span className={isPositive ? 'text-radar-green' : 'text-red-500'}>
                    {inputToken.change24h > 0 ? '+' : ''}{inputToken.change24h}% (24h)
                </span>
            </div>
        </div>
    );
  };

  const SettingsModal = () => (
    <div className="absolute top-14 right-4 z-30 w-64 bg-radar-panel border border-radar-dim rounded-xl shadow-2xl p-4 animate-fade-in ring-1 ring-radar-green/20">
        <h4 className="text-xs text-radar-textdim font-bold uppercase mb-3 flex items-center gap-1">
            <Settings size={12} /> Transaction Settings
        </h4>
        
        <div className="mb-4">
            <div className="text-[10px] text-radar-textdim mb-1">Slippage Tolerance</div>
            <div className="flex gap-2 mb-2">
                {[0.1, 0.5, 1.0].map(val => (
                    <button
                        key={val}
                        onClick={() => { setSlippage(val); setCustomSlippage(''); }}
                        className={`flex-1 py-1.5 rounded text-xs font-bold border transition-colors ${slippage === val && !customSlippage ? 'bg-radar-green text-black border-radar-green' : 'bg-radar-input text-radar-textdim border-radar-dim hover:border-radar-textdim'}`}
                    >
                        {val}%
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    placeholder="Custom"
                    value={customSlippage}
                    onChange={(e) => { setCustomSlippage(e.target.value); setSlippage(parseFloat(e.target.value) || 0); }}
                    className="w-full bg-radar-input border border-radar-dim rounded p-2 text-right text-xs text-radar-text outline-none focus:border-radar-green transition-colors"
                />
                <span className="text-xs text-radar-textdim">%</span>
            </div>
        </div>

        <div>
            <div className="text-[10px] text-radar-textdim mb-1">Transaction Deadline</div>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    value={deadline}
                    onChange={(e) => setDeadline(parseInt(e.target.value))}
                    className="w-16 bg-radar-input border border-radar-dim rounded p-2 text-right text-xs text-radar-text outline-none focus:border-radar-green transition-colors"
                />
                <span className="text-xs text-radar-textdim">minutes</span>
            </div>
        </div>
    </div>
  );

  const TokenSelectorModal = () => (
    <div className="absolute inset-0 z-50 bg-radar-bg flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-radar-dim bg-radar-panel">
            <h3 className="font-bold text-lg text-radar-text">Select Token</h3>
            <button onClick={() => setSelectorType(null)} className="p-2 hover:bg-radar-dim rounded-full transition-colors">
                <X size={24} className="text-radar-textdim hover:text-radar-text" />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
            {tokens.map(token => (
                <button 
                    key={token.id}
                    onClick={() => handleSelectToken(token)}
                    className="w-full flex items-center justify-between p-3 hover:bg-radar-panel hover:border hover:border-radar-green/30 rounded-lg transition-all group mb-2 border border-transparent"
                >
                    <div className="flex items-center gap-3">
                        <img src={token.image} className="w-8 h-8 rounded-full bg-gray-800 object-cover" alt={token.name}/>
                        <div className="text-left">
                            <div className="font-bold text-radar-text group-hover:text-radar-green transition-colors">{token.ticker}</div>
                            <div className="text-xs text-radar-textdim">{token.name}</div>
                        </div>
                    </div>
                    <div className="text-right">
                         <div className="text-sm text-radar-textdim font-mono">${token.price.toFixed(4)}</div>
                         {getBalance(token.ticker) > 0 && (
                             <div className="text-xs text-radar-green font-bold">Bal: {getBalance(token.ticker)}</div>
                         )}
                    </div>
                </button>
            ))}
        </div>
    </div>
  );

  const ReviewModal = () => (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end animate-fade-in">
        <div className="w-full bg-radar-panel border-t border-radar-green/30 rounded-t-2xl p-6 shadow-[0_-5px_30px_rgba(0,255,65,0.1)] h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-radar-text">Review Swap</h3>
                <button onClick={() => setSwapState('idle')}><X size={24} className="text-radar-textdim hover:text-radar-text" /></button>
            </div>
            
            {/* Main Swap Review Card */}
            <div className="bg-radar-input rounded-lg p-4 mb-4 border border-radar-dim space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={inputToken.image} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                             <div className="text-lg font-bold text-radar-text">{inputAmount} {inputToken.ticker}</div>
                             <div className="text-xs text-radar-textdim">${(parseFloat(inputAmount) * inputToken.price).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
                
                <div className="relative h-px bg-radar-dim my-2">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-radar-input p-1 rounded-full border border-radar-dim">
                        <ArrowDownUp size={14} className="text-radar-textdim" />
                    </div>
                </div>

                <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <img src={outputToken.image} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                             <div className="text-lg font-bold text-radar-green">{outputAmount} {outputToken.ticker}</div>
                             <div className="text-xs text-radar-textdim">${(parseFloat(outputAmount || '0') * outputToken.price).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gas Speed Selector */}
            <div className="mb-6">
                <label className="text-xs text-radar-textdim font-bold uppercase mb-2 block flex items-center gap-1">
                    <Zap size={12} /> Gas Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {(['SLOW', 'AVERAGE', 'FAST'] as GasSpeed[]).map((speed) => {
                        const config = getGasConfig(speed);
                        const cost = quoteDetails.baseGasUsd * config.multiplier;
                        const isSelected = gasSpeed === speed;
                        
                        return (
                            <button
                                key={speed}
                                onClick={() => setGasSpeed(speed)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                                    isSelected 
                                    ? 'bg-radar-green/20 border-radar-green text-radar-text' 
                                    : 'bg-radar-input border-radar-dim text-radar-textdim hover:border-radar-textdim'
                                }`}
                            >
                                <div className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? 'text-radar-green' : 'text-radar-textdim'}`}>
                                    {config.label}
                                </div>
                                <div className="text-sm font-mono font-bold">${cost.toFixed(3)}</div>
                                <div className="text-[9px] opacity-70 mt-1 flex items-center gap-1">
                                    <Clock size={8} /> {config.time}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2 text-sm text-radar-textdim mb-6 flex-1 border-t border-radar-dim pt-4">
                <div className="flex justify-between py-1">
                    <span>Rate</span>
                    <span className="font-mono text-radar-text">1 {inputToken.ticker} = {quoteDetails.rate.toFixed(6)} {outputToken.ticker}</span>
                </div>
                <div className="flex justify-between py-1">
                    <span>Price Impact</span>
                    <span className={`font-mono ${quoteDetails.priceImpact > 2 ? 'text-red-500' : 'text-green-500'}`}>
                        {quoteDetails.priceImpact.toFixed(2)}%
                    </span>
                </div>
                <div className="flex justify-between py-1">
                    <span>Max Slippage</span>
                    <span className="font-mono text-radar-text">{slippage}%</span>
                </div>
                <div className="flex justify-between py-1">
                    <span>Network Cost</span>
                    <span className="font-mono text-radar-text flex items-center gap-1"><ZapIcon /> ${currentGasCost.toFixed(3)}</span>
                </div>
                <div className="flex justify-between py-1">
                    <span>Route</span>
                    <span className="text-radar-green flex items-center gap-1"><TrendingUp size={12}/> {quoteDetails.provider}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-radar-dim mt-2 pt-2 text-radar-textdim">
                    <span className="font-bold">Min. Received</span>
                    <span className="font-mono text-radar-text font-bold">
                        {((parseFloat(outputAmount) || 0) * (1 - slippage/100)).toFixed(6)} {outputToken.ticker}
                    </span>
                </div>
            </div>

            <button 
                onClick={handleExecuteSwap}
                className="w-full bg-radar-green text-black font-bold text-lg py-4 rounded-lg hover:bg-radar-accent transition-all flex items-center justify-center gap-2 mt-auto shadow-[0_0_20px_rgba(0,255,65,0.2)]"
            >
                CONFIRM SWAP
            </button>
        </div>
    </div>
  );

  const SuccessView = () => (
     <div className="absolute inset-0 z-50 bg-radar-bg flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-24 h-24 bg-radar-green/10 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 border-4 border-radar-green rounded-full animate-ping opacity-20"></div>
            <CheckCircle2 size={48} className="text-radar-green" />
        </div>
        <h2 className="text-2xl font-bold text-radar-text mb-2">Swap Submitted</h2>
        <p className="text-radar-textdim text-center mb-6">
            Swapped {inputAmount} {inputToken.ticker} for {outputAmount} {outputToken.ticker}
        </p>
        
        <div className="bg-radar-panel p-3 rounded-lg border border-radar-dim mb-8 flex items-center gap-3">
             <Trophy className="text-yellow-400" />
             <div className="text-left">
                <div className="text-xs text-radar-textdim">XP Earned</div>
                <div className="font-bold text-radar-text">+{earnedXP} XP</div>
             </div>
        </div>

        <div className="flex items-center gap-2 text-radar-green bg-radar-green/10 px-4 py-2 rounded-full text-sm font-mono mb-4">
            View on Blockscout <Wallet size={14}/>
        </div>
        <button 
            onClick={resetSwap}
            className="w-full bg-radar-text/10 text-radar-text font-bold py-3 rounded-lg hover:bg-radar-text/20 transition-colors"
        >
            Close
        </button>
     </div>
  );

  // --- MAIN RENDER ---
  const currentBalance = getBalance(inputToken.ticker);
  const isInsufficientBalance = parseFloat(inputAmount) > currentBalance;
  
  return (
    <div className="h-full flex flex-col px-4 pt-4 pb-24 relative overflow-hidden">
        {/* Modals */}
        {selectorType && <TokenSelectorModal />}
        {swapState === 'review' && <ReviewModal />}
        {swapState === 'processing' && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
                <Loader2 size={48} className="text-radar-green animate-spin mb-4" />
                <span className="text-radar-green font-mono animate-pulse">CONFIRMING TRANSACTION...</span>
            </div>
        )}
        {swapState === 'success' && <SuccessView />}

        {/* Header */}
        <div className="flex justify-between items-center mb-6 z-20 relative">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-radar-text tracking-tight">SWAP</h2>
                <button 
                    onClick={() => setShowChart(!showChart)}
                    className={`p-2 rounded-full border transition-all ${showChart ? 'bg-radar-green text-black border-radar-green' : 'bg-radar-panel text-radar-textdim border-radar-dim'}`}
                >
                    <BarChart2 size={18} />
                </button>
            </div>
            
            <div className="relative">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-full border transition-all ${showSettings ? 'text-radar-green border-radar-green bg-radar-green/10' : 'text-radar-textdim bg-radar-panel border-radar-dim hover:text-radar-text'}`}
                >
                    <Settings size={20} />
                </button>
                {showSettings && <SettingsModal />}
            </div>
        </div>
        
        {/* Backdrop for Settings */}
        {showSettings && <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)} />}

        <div className="flex-1 flex flex-col justify-start max-w-lg mx-auto w-full overflow-y-auto pb-4 scrollbar-hide">
            
            {showChart && <PriceChart />}

            {/* Input Section */}
            <div className={`bg-radar-panel border rounded-2xl p-4 relative group transition-colors ${isInsufficientBalance ? 'border-red-500/50' : 'border-radar-dim hover:border-radar-dim/80'}`}>
                <div className="flex justify-between mb-2">
                    <label className="text-xs text-radar-textdim font-bold uppercase tracking-wider">Pay</label>
                    <span className={`text-xs font-mono cursor-pointer ${isInsufficientBalance ? 'text-red-500 font-bold' : 'text-radar-textdim'}`} onClick={() => handlePercentage(100)}>
                        Bal: {currentBalance.toFixed(4)}
                    </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <input 
                        type="number" 
                        placeholder="0.0"
                        value={inputAmount}
                        onChange={(e) => setInputAmount(e.target.value)}
                        className={`bg-transparent text-3xl font-mono outline-none w-full placeholder-radar-textdim/50 ${isInsufficientBalance ? 'text-red-500' : 'text-radar-text'}`}
                    />
                    <button 
                        onClick={() => setSelectorType('input')}
                        className="flex items-center gap-2 bg-radar-input hover:bg-radar-dim px-3 py-1.5 rounded-full border border-radar-dim hover:border-radar-green/50 transition-all shrink-0"
                    >
                        <img src={inputToken.image} className="w-6 h-6 rounded-full object-cover" alt="icon"/>
                        <span className="font-bold text-sm text-radar-text">{inputToken.ticker}</span>
                        <ChevronDown size={14} className="text-radar-textdim"/>
                    </button>
                </div>
                
                {/* Percentage Buttons & USD Value */}
                <div className="flex justify-between items-center mt-2">
                     <div className="text-xs text-radar-textdim/80 font-mono">
                        ${inputAmount ? (parseFloat(inputAmount) * inputToken.price).toFixed(2) : '0.00'}
                    </div>
                    <div className="flex gap-1.5">
                        {[25, 50, 75, 100].map((pct) => (
                             <button
                                key={pct}
                                onClick={() => handlePercentage(pct)}
                                className="text-[10px] bg-radar-text/5 hover:bg-radar-green/20 hover:text-radar-green text-radar-textdim px-2 py-0.5 rounded border border-radar-text/5 hover:border-radar-green/30 transition-all"
                             >
                                {pct === 100 ? 'MAX' : `${pct}%`}
                             </button>
                        ))}
                    </div>
                </div>

                {/* Token Stats */}
                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-radar-dim/50">
                    <div className="text-[10px] text-radar-textdim font-mono flex items-center gap-1" title="Market Cap">
                        <span className="opacity-50 uppercase">MCap</span>
                        <span className="text-radar-text/80">{inputToken.marketCap}</span>
                    </div>
                    <div className="text-[10px] text-radar-textdim font-mono flex items-center gap-1" title="24h Volume">
                        <span className="opacity-50 uppercase">Vol</span>
                        <span className="text-radar-text/80">{inputToken.volume}</span>
                    </div>
                     <div className={`text-[10px] font-mono ml-auto flex items-center gap-1 ${inputToken.change24h >= 0 ? 'text-radar-green' : 'text-red-500'}`}>
                        {inputToken.change24h > 0 ? '+' : ''}{inputToken.change24h}%
                        <TrendingUp size={10} className={inputToken.change24h < 0 ? 'rotate-180' : ''} />
                    </div>
                </div>
            </div>

            {/* Switcher & Live Rate */}
            <div className="relative h-10 z-10 my-[-10px] flex items-center justify-center">
                 <div className="bg-radar-bg p-1 rounded-full flex items-center gap-2 shadow-xl border border-radar-panel">
                    <button 
                        onClick={handleSwitch}
                        className="bg-radar-dim p-2 rounded-full border border-radar-dim hover:border-radar-green hover:scale-105 transition-all cursor-pointer group"
                    >
                        <ArrowDownUp size={16} className="text-radar-textdim group-hover:text-radar-green" />
                    </button>
                    
                    {quoteDetails.rate > 0 && (
                        <div className="px-3 py-1 bg-radar-panel rounded-full text-[10px] font-mono text-radar-textdim border border-radar-dim flex items-center gap-1 cursor-pointer hover:text-radar-text" onClick={() => {}}>
                            <span>1 {inputToken.ticker} = {quoteDetails.rate.toFixed(5)} {outputToken.ticker}</span>
                            <RefreshCcw size={10} />
                        </div>
                    )}
                 </div>
            </div>

            {/* Output Section */}
            <div className="bg-radar-panel border border-radar-dim rounded-2xl p-4 pt-6 group hover:border-radar-dim/80 transition-colors">
                <div className="flex justify-between mb-2">
                    <label className="text-xs text-radar-textdim font-bold uppercase tracking-wider">Receive</label>
                    <span className="text-xs text-radar-textdim font-mono">Bal: 0.00</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                    {isQuoting ? (
                        <div className="h-9 w-32 bg-radar-dim/50 rounded animate-pulse"/>
                    ) : (
                        <input 
                            type="text" 
                            readOnly
                            value={outputAmount}
                            placeholder="0.0"
                            className="bg-transparent text-3xl font-mono text-radar-green outline-none w-full placeholder-radar-textdim/50"
                        />
                    )}
                    
                    <button 
                         onClick={() => setSelectorType('output')}
                         className="flex items-center gap-2 bg-radar-input hover:bg-radar-dim px-3 py-1.5 rounded-full border border-radar-dim hover:border-radar-green/50 transition-all shrink-0"
                    >
                        <img src={outputToken.image} className="w-6 h-6 rounded-full object-cover" alt="icon"/>
                        <span className="font-bold text-sm text-radar-text">{outputToken.ticker}</span>
                        <ChevronDown size={14} className="text-radar-textdim"/>
                    </button>
                </div>
                <div className="text-xs text-radar-textdim mt-1 font-mono">
                    ${outputAmount ? (parseFloat(outputAmount) * outputToken.price).toFixed(2) : '0.00'}
                </div>

                {/* Token Stats */}
                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-radar-dim/50">
                    <div className="text-[10px] text-radar-textdim font-mono flex items-center gap-1" title="Market Cap">
                        <span className="opacity-50 uppercase">MCap</span>
                        <span className="text-radar-text/80">{outputToken.marketCap}</span>
                    </div>
                    <div className="text-[10px] text-radar-textdim font-mono flex items-center gap-1" title="24h Volume">
                        <span className="opacity-50 uppercase">Vol</span>
                        <span className="text-radar-text/80">{outputToken.volume}</span>
                    </div>
                     <div className={`text-[10px] font-mono ml-auto flex items-center gap-1 ${outputToken.change24h >= 0 ? 'text-radar-green' : 'text-red-500'}`}>
                        {outputToken.change24h > 0 ? '+' : ''}{outputToken.change24h}%
                        <TrendingUp size={10} className={outputToken.change24h < 0 ? 'rotate-180' : ''} />
                    </div>
                </div>
            </div>

            {/* Quote Info */}
            {inputAmount && outputAmount && !isQuoting && (
                 <div className="mt-4 px-2 space-y-2">
                    <div className="flex justify-between text-xs text-radar-textdim bg-radar-panel/50 p-2 rounded border border-radar-dim/50">
                        <span className="flex items-center gap-1"><Info size={12}/> Best price via {quoteDetails.provider}</span>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Settings size={10} /> {slippage}%</span>
                            <span className="text-radar-green flex items-center gap-1"><ZapIcon /> ${currentGasCost.toFixed(3)}</span>
                        </div>
                    </div>
                 </div>
            )}

            {/* Action Button */}
            <button 
                onClick={() => setSwapState('review')}
                disabled={!inputAmount || !outputAmount || isQuoting || isInsufficientBalance}
                className={`w-full mt-6 font-bold text-lg py-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2
                    ${(!inputAmount || !outputAmount || isQuoting || isInsufficientBalance) 
                        ? 'bg-radar-dim text-radar-textdim cursor-not-allowed opacity-50' 
                        : 'bg-radar-green text-black hover:bg-radar-accent shadow-[0_0_20px_rgba(0,255,65,0.2)]'}`}
            >
                {isQuoting ? <Loader2 className="animate-spin" /> : isInsufficientBalance ? `INSUFFICIENT ${inputToken.ticker}` : 'REVIEW SWAP'}
            </button>
        </div>
    </div>
  );
};