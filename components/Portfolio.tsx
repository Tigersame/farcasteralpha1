import React from 'react';
import { PortfolioItem, UserXP, FarcasterUser } from '../types';
import { PieChart, ExternalLink, Lock, ArrowRightLeft, ShieldCheck, Trophy, Zap, Activity, Copy, LogOut, User } from 'lucide-react';

interface PortfolioProps {
  onTrade: (ticker: string) => void;
  userXP?: UserXP; 
  walletAddress: string | null;
  user?: FarcasterUser;
}

const MOCK_HOLDINGS: PortfolioItem[] = [
    { 
        token: 'CLANKER', 
        balance: '1,200', 
        value: '$14,940', 
        vesting: { total: '5,000', unlockDate: 'Aug 15, 2024', percentage: 45 } 
    },
    { 
        token: 'BRETT', 
        balance: '50,000', 
        value: '$4,200' 
    },
    { 
        token: 'MYTOKEN', 
        balance: '1,000,000', 
        value: '$5,000',
        isCreated: true,
        vesting: { total: '10,000,000', unlockDate: 'Dec 01, 2024', percentage: 10 }
    },
    { 
        token: 'DEGEN', 
        balance: '12,500', 
        value: '$1,100' 
    },
];

export const Portfolio: React.FC<PortfolioProps> = ({ onTrade, userXP, walletAddress, user }) => {
  return (
    <div className="pb-24 pt-4 px-4 animate-fade-in">
       {/* User Profile Header */}
       {user && (
         <div className="flex items-center gap-4 mb-6 bg-radar-panel border border-radar-dim p-4 rounded-xl shadow-[0_0_20px_rgba(0,255,65,0.05)]">
            <div className="relative">
                <img 
                    src={user.pfpUrl} 
                    alt={user.username} 
                    className="w-16 h-16 rounded-full border-2 border-radar-green p-0.5" 
                />
                <div className="absolute bottom-0 right-0 bg-black border border-radar-dim p-1 rounded-full">
                    <div className="w-3 h-3 bg-radar-green rounded-full animate-pulse"></div>
                </div>
            </div>
            <div className="flex-1">
                <h2 className="text-xl font-bold text-radar-text tracking-tight flex items-center gap-2">
                    {user.displayName}
                    <span className="text-[10px] bg-radar-input text-radar-textdim px-1.5 py-0.5 rounded flex items-center gap-1 font-normal border border-radar-dim">
                        <User size={10} /> {user.fid}
                    </span>
                </h2>
                <div className="text-sm text-radar-green font-mono">@{user.username}</div>
            </div>
         </div>
       )}

       <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold text-radar-text tracking-tighter">PORTFOLIO</h2>
       </div>

       {/* Wallet Card */}
       <div className="bg-gradient-to-r from-radar-panel to-radar-dim/30 border border-radar-dim rounded-xl p-4 mb-6 relative group">
           <div className="flex justify-between items-start">
               <div>
                   <div className="text-xs text-radar-textdim font-bold uppercase tracking-wider mb-1">Connected Wallet</div>
                   {walletAddress ? (
                       <div className="flex items-center gap-2">
                           <span className="font-mono text-radar-text text-sm bg-radar-input px-2 py-1 rounded border border-radar-dim">
                               {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
                           </span>
                           <button className="text-radar-textdim hover:text-radar-green transition-colors" onClick={() => navigator.clipboard.writeText(walletAddress)}>
                               <Copy size={14} />
                           </button>
                       </div>
                   ) : (
                       <div className="text-sm text-yellow-500 flex items-center gap-1 font-bold animate-pulse">
                           Not Connected
                       </div>
                   )}
               </div>
               <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30">
                   <img src="https://avatars.githubusercontent.com/u/108554348?s=200&v=4" className="w-6 h-6 rounded-full" alt="Base" />
               </div>
           </div>
       </div>

       {/* XP / Level Card */}
       {userXP && (
           <div className="bg-radar-panel border border-radar-dim rounded-xl p-4 mb-6 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-radar-dim flex items-center justify-center border border-radar-green/30 relative">
                        <Trophy size={24} className="text-yellow-400" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <div className="text-xs text-radar-textdim font-bold uppercase">Alpha Radar Level</div>
                        <div className="text-xl font-bold text-radar-text flex items-center gap-2">
                             LEVEL {userXP.level}
                             <span className="text-xs text-radar-green bg-radar-green/10 px-2 py-0.5 rounded-full font-mono border border-radar-green/20">{userXP.current} XP</span>
                        </div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-radar-input h-2 rounded-full overflow-hidden relative">
                    <div 
                        className="h-full bg-gradient-to-r from-radar-green to-yellow-400 shadow-[0_0_10px_rgba(0,255,65,0.5)]" 
                        style={{ width: `${(userXP.current / userXP.nextLevelAt) * 100}%` }}
                    ></div>
                </div>
                <div className="text-right text-[10px] text-radar-textdim mt-1 font-mono flex justify-between">
                    <span>Current Rank: Scout</span>
                    <span>Next Level: {userXP.nextLevelAt} XP</span>
                </div>
           </div>
       )}
       
       {/* Total Value */}
       <div className="bg-radar-panel border border-radar-dim p-6 rounded-xl mb-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <PieChart size={64} className="text-radar-green" />
            </div>
            <label className="text-xs text-radar-textdim uppercase tracking-wider font-bold">Net Worth</label>
            <div className="text-3xl font-mono text-radar-text font-bold mt-1 tracking-tight">$25,240.00</div>
            <div className="text-xs text-radar-green mt-2 flex items-center gap-1">
                <span className="bg-radar-green/10 px-1.5 py-0.5 rounded text-[10px]">+12.5%</span>
                <span className="text-radar-textdim">past 24h</span>
            </div>
       </div>

       {/* Holdings */}
       <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-radar-textdim uppercase tracking-widest">Assets</h3>
            <span className="text-xs text-radar-textdim font-mono">4 TOKENS</span>
       </div>
       
       <div className="space-y-4 mb-8">
        {MOCK_HOLDINGS.map((item, i) => (
            <div key={i} className="bg-radar-panel border border-radar-dim p-4 rounded-xl hover:border-radar-green/30 transition-all">
                {/* Header: Token Info */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold border border-gray-700 text-white">
                            {item.token[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-radar-text">{item.token}</span>
                                {item.isCreated && (
                                    <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/30 flex items-center gap-0.5">
                                        <ShieldCheck size={10} /> CREATOR
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-radar-textdim">{item.balance} {item.token}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-radar-text font-mono font-bold">{item.value}</div>
                    </div>
                </div>
                
                {/* Vesting Indicator */}
                {item.vesting && (
                    <div className="mt-3 bg-radar-input rounded-lg p-3 border border-radar-dim">
                        <div className="flex justify-between items-center text-[10px] text-radar-textdim mb-1.5">
                            <span className="flex items-center gap-1 text-yellow-500 font-bold"><Lock size={10} /> VESTING</span>
                            <span>{item.vesting.percentage}% Unlocked</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-radar-dim h-1.5 rounded-full mb-2 overflow-hidden">
                            <div 
                                className="bg-yellow-500 h-full rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" 
                                style={{ width: `${item.vesting.percentage}%` }}
                            ></div>
                        </div>
                        
                        <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-radar-textdim">Total: <span className="text-radar-text">{item.vesting.total}</span></span>
                            <span className="text-radar-textdim">Unlocks: <span className="text-radar-text">{item.vesting.unlockDate}</span></span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-radar-dim/50">
                    <button 
                        onClick={() => onTrade(item.token)}
                        className="flex-1 bg-radar-dim/30 hover:bg-radar-dim text-radar-text text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors"
                    >
                        <ArrowRightLeft size={14} /> Trade
                    </button>
                    {(item.vesting || item.isCreated) && (
                        <button className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs font-bold py-2 rounded flex items-center justify-center gap-2 border border-yellow-500/20 transition-colors">
                            <Lock size={14} /> Manage Lock
                        </button>
                    )}
                </div>
            </div>
        ))}
       </div>

       {/* XP History Section */}
       {userXP && userXP.history.length > 0 && (
            <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={16} className="text-radar-green" />
                    <h3 className="text-sm font-bold text-radar-textdim uppercase tracking-widest">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                    {userXP.history.map((h, i) => (
                        <div key={i} className="flex justify-between items-center bg-radar-panel border border-radar-dim p-3 rounded-lg hover:border-radar-green/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-radar-dim p-2 rounded-full border border-radar-green/20">
                                    <Zap size={14} className="text-radar-green" />
                                </div>
                                <div>
                                    <div className="text-sm text-radar-text font-bold capitalize">{h.action.toLowerCase().replace(/_/g, ' ')}</div>
                                    <div className="text-[10px] text-radar-textdim font-mono">
                                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-yellow-400 font-mono font-bold text-sm">+{h.amount} XP</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
       )}

       <button className="w-full mt-8 mb-4 text-center text-xs text-radar-textdim flex items-center justify-center gap-1 hover:text-radar-green transition-colors font-mono">
            View full history on Basescan <ExternalLink size={10} />
       </button>
       
       <button className="w-full mb-8 flex items-center justify-center gap-2 text-red-500/50 hover:text-red-500 text-xs font-bold transition-colors">
           <LogOut size={12} /> Disconnect Wallet
       </button>
    </div>
  );
};