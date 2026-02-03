import React, { useState } from 'react';
import { Droplets, Plus, TrendingUp, Info, ChevronRight, Loader2, X, AlertTriangle } from 'lucide-react';
import { TokenData } from '../types';

interface LiquidityProps {
  onAction: (action: string, amount: number) => void;
  tokens: TokenData[];
}

export const Liquidity: React.FC<LiquidityProps> = ({ onAction, tokens }) => {
  const [activeTab, setActiveTab] = useState<'POOLS' | 'POSITIONS'>('POSITIONS');
  const [depositModal, setDepositModal] = useState<string | null>(null); // Stores Pool ID
  const [depositAmount, setDepositAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock User Positions
  const positions = [
    { id: 1, pair: 'ETH/CLANKER', apr: 124.5, value: 2450.00, feeEarned: 12.40, share: 0.05 },
    { id: 2, pair: 'ETH/DEGEN', apr: 45.2, value: 500.00, feeEarned: 1.20, share: 0.01 },
  ];

  // Mock Top Pools
  const pools = [
    { id: 'p1', t1: tokens[0], t2: tokens[1], tvl: '2.4M', vol: '500K', apr: 124.5 },
    { id: 'p2', t1: tokens[0], t2: tokens[2], tvl: '8.1M', vol: '1.2M', apr: 85.2 },
    { id: 'p3', t1: tokens[0], t2: tokens[3], tvl: '1.2M', vol: '300K', apr: 240.1 },
  ];

  const handleDepositConfirm = () => {
    if (!depositModal) return;
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        setDepositModal(null);
        setDepositAmount('');
        onAction('ADD_LIQUIDITY', 150); // XP
    }, 2000);
  };

  const DepositModal = () => {
    const pool = pools.find(p => p.id === depositModal);
    if (!pool) return null;

    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
            <div className="w-full sm:max-w-sm bg-radar-panel border border-radar-dim rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-radar-text">Add Liquidity</h3>
                    <button onClick={() => setDepositModal(null)}><X size={24} className="text-radar-textdim" /></button>
                </div>
                
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="text-center">
                        <img src={pool.t1.image} className="w-12 h-12 rounded-full mx-auto mb-2 bg-black" />
                        <div className="font-bold text-radar-text">{pool.t1.ticker}</div>
                    </div>
                    <Plus className="text-radar-textdim" />
                    <div className="text-center">
                        <img src={pool.t2?.image || 'https://picsum.photos/40/40'} className="w-12 h-12 rounded-full mx-auto mb-2 bg-black" />
                        <div className="font-bold text-radar-text">{pool.t2?.ticker || 'ETH'}</div>
                    </div>
                </div>

                <div className="bg-radar-input rounded-xl p-4 mb-4 border border-radar-dim">
                     <label className="text-xs text-radar-textdim font-bold uppercase block mb-2">Deposit Amount (USD)</label>
                     <div className="flex items-center gap-2">
                        <span className="text-radar-green font-mono">$</span>
                        <input 
                            type="number" 
                            autoFocus
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="bg-transparent text-2xl font-mono text-radar-text outline-none w-full"
                            placeholder="0.00"
                        />
                     </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2 mb-6">
                    <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-200/80">
                        Funds will be deposited into the V3 pool. You will receive an NFT representing your position.
                    </p>
                </div>

                <button 
                    onClick={handleDepositConfirm}
                    disabled={!depositAmount || isProcessing}
                    className="w-full bg-radar-green text-black font-bold text-lg py-4 rounded-lg hover:bg-radar-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : 'CONFIRM DEPOSIT'}
                </button>
            </div>
        </div>
    );
  };

  return (
    <div className="pb-24 pt-4 px-4 animate-fade-in h-full flex flex-col relative">
        {depositModal && <DepositModal />}
        
        <div className="mb-6 flex justify-between items-end">
            <div>
                <h2 className="text-2xl font-bold text-radar-text tracking-tighter flex items-center gap-2">
                    <Droplets className="text-blue-500" /> LIQUIDITY
                </h2>
                <p className="text-radar-textdim text-sm">Earn fees by providing liquidity.</p>
            </div>
            <button className="bg-radar-green text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-radar-accent transition-colors shadow-[0_0_10px_rgba(0,255,65,0.3)]">
                <Plus size={14} /> Create
            </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-radar-panel border border-radar-dim rounded-lg mb-6">
            <button 
                onClick={() => setActiveTab('POSITIONS')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'POSITIONS' ? 'bg-radar-input text-radar-text shadow-sm' : 'text-radar-textdim hover:text-radar-text'}`}
            >
                My Positions
            </button>
            <button 
                onClick={() => setActiveTab('POOLS')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'POOLS' ? 'bg-radar-input text-radar-text shadow-sm' : 'text-radar-textdim hover:text-radar-text'}`}
            >
                Top Pools
            </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
            {activeTab === 'POSITIONS' && (
                <div className="space-y-4">
                    {positions.length > 0 ? (
                        positions.map((pos) => (
                            <div key={pos.id} className="bg-radar-panel border border-radar-dim rounded-xl p-4 hover:border-blue-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-radar-panel flex items-center justify-center text-[8px] font-bold">ETH</div>
                                            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-radar-panel flex items-center justify-center text-[8px] font-bold">TOK</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-radar-text text-sm">{pos.pair}</div>
                                            <div className="text-[10px] text-radar-green bg-radar-green/10 px-1.5 rounded inline-block">
                                                Range: Full
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-radar-text font-mono font-bold">${pos.value.toFixed(2)}</div>
                                        <div className="text-xs text-radar-textdim">APR {pos.apr}%</div>
                                    </div>
                                </div>
                                
                                <div className="bg-radar-input rounded-lg p-3 flex justify-between items-center mb-3">
                                    <div className="text-xs">
                                        <span className="text-radar-textdim block">Unclaimed Fees</span>
                                        <span className="text-radar-green font-mono">${pos.feeEarned.toFixed(2)}</span>
                                    </div>
                                    <button className="text-[10px] font-bold bg-radar-dim hover:bg-radar-green hover:text-black px-3 py-1.5 rounded transition-colors border border-radar-dim/50 hover:border-radar-green">
                                        Claim
                                    </button>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-radar-dim/50 hover:bg-radar-dim text-radar-textdim text-xs font-bold py-2 rounded transition-colors">
                                        Withdraw
                                    </button>
                                    <button className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold py-2 rounded border border-blue-500/20 transition-colors">
                                        Increase
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-radar-textdim border border-dashed border-radar-dim rounded-xl bg-radar-panel/50">
                            <Droplets size={32} className="mx-auto mb-2 opacity-30" />
                            <p>No active liquidity positions.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'POOLS' && (
                <div className="space-y-3">
                    {pools.map((pool) => (
                        <div key={pool.id} className="bg-radar-panel border border-radar-dim rounded-xl p-4 flex items-center justify-between hover:border-radar-dim/80 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src={pool.t1.image} className="w-9 h-9 rounded-full bg-gray-800 object-cover" />
                                    <img src={pool.t2?.image || 'https://picsum.photos/40/40'} className="w-5 h-5 rounded-full absolute -bottom-1 -right-1 border-2 border-radar-panel bg-gray-700 object-cover" />
                                </div>
                                <div>
                                    <div className="font-bold text-radar-text text-sm flex items-center gap-1">
                                        {pool.t1.ticker}/{pool.t2?.ticker || 'ETH'}
                                        <span className="bg-radar-dim text-[8px] px-1 rounded text-radar-textdim">0.3%</span>
                                    </div>
                                    <div className="text-[10px] text-radar-textdim flex items-center gap-2">
                                        <span className="text-radar-green font-bold flex items-center gap-0.5"><TrendingUp size={8}/> {pool.apr}%</span>
                                        <span className="w-1 h-1 bg-radar-dim rounded-full"></span>
                                        <span>TVL {pool.tvl}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setDepositModal(pool.id)}
                                className="bg-radar-input hover:bg-radar-green hover:text-black border border-radar-dim hover:border-radar-green text-radar-text text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                            >
                                <Plus size={14} />
                                Add
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-200/70">
                    <span className="font-bold text-blue-400 block mb-1">Concentrated Liquidity</span>
                    Providing liquidity allows you to earn 0.3% fees on all trades. Impermanent loss risk applies.
                </div>
            </div>
        </div>
    </div>
  );
};