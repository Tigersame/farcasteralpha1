import React, { useState } from 'react';
import { Users, Filter, Send, Loader2, CheckCircle2, Trophy, AlertTriangle, Rocket, Coins, MessageSquare, Crown, Zap } from 'lucide-react';
import { useFarcasterSDK } from '../services/farcasterService';

interface AirdropProps {
  userXp: number; // Passed to show user credibility or used for logic
  onAction: (action: string, amount: number) => void;
}

type FilterType = 'ALL' | 'XP' | 'WHALES' | 'HOLDERS' | 'POSTERS';

export const Airdrop: React.FC<AirdropProps> = ({ userXp, onAction }) => {
  const { shareCast } = useFarcasterSDK();
  const [step, setStep] = useState<'CONFIG' | 'SCANNING' | 'CONFIRM' | 'SENDING' | 'DONE'>('CONFIG');
  const [selectedToken, setSelectedToken] = useState('MYTOKEN');
  const [amountPerUser, setAmountPerUser] = useState(100);
  const [targetType, setTargetType] = useState<FilterType>('ALL');
  const [eligibleCount, setEligibleCount] = useState(0);
  const [holderTicker, setHolderTicker] = useState('DEGEN');

  // Simulation logic
  const handleScan = () => {
    setStep('SCANNING');
    setTimeout(() => {
      // Mock logic based on selection
      const baseCount = 1250; // Mock total followers
      let count = baseCount;
      
      switch (targetType) {
        case 'XP':
            count = Math.floor(baseCount * 0.35); // 35% High XP
            break;
        case 'WHALES':
            count = Math.floor(baseCount * 0.05); // 5% Whales
            break;
        case 'HOLDERS':
            count = Math.floor(baseCount * 0.15); // 15% hold specific token
            break;
        case 'POSTERS':
            count = Math.floor(baseCount * 0.22); // 22% are active posters
            break;
        default:
            count = baseCount;
      }

      setEligibleCount(count);
      setStep('CONFIRM');
    }, 2000);
  };

  const handleExecute = () => {
    setStep('SENDING');
    setTimeout(() => {
      setStep('DONE');
      onAction('AIRDROP_DISTRIBUTED', 500); // Award XP to the sender for community building
      
      setTimeout(() => {
          let criteriaText = "all followers";
          if (targetType === 'XP') criteriaText = "high XP users";
          if (targetType === 'WHALES') criteriaText = "top whales";
          if (targetType === 'HOLDERS') criteriaText = `$${holderTicker} holders`;
          if (targetType === 'POSTERS') criteriaText = "active casters";

          shareCast(`🪂 Just dropped ${amountPerUser} $${selectedToken} to ${eligibleCount} ${criteriaText} on @AlphaRadar! \n\nChecked on-chain activity & Farcaster engagement. 🫡\n\n#Base #Airdrop #AlphaRadar`);
      }, 1000);
    }, 3000);
  };

  if (step === 'SCANNING') {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center animate-fade-in">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-radar-green/20 blur-xl rounded-full animate-pulse"></div>
                <Users size={64} className="text-radar-green relative z-10 animate-bounce" />
            </div>
            <h2 className="text-xl font-bold text-radar-text mb-2">Scanning Followers...</h2>
            <p className="text-radar-textdim font-mono text-xs">Analyzing on-chain activity & XP scores</p>
            <div className="w-full max-w-xs h-1 bg-radar-dim mt-6 rounded-full overflow-hidden">
                <div className="h-full bg-radar-green animate-[width_2s_ease-in-out_infinite] w-1/2"></div>
            </div>
        </div>
    );
  }

  if (step === 'SENDING') {
     return (
        <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center animate-fade-in">
            <Loader2 size={64} className="text-radar-green animate-spin mb-6" />
            <h2 className="text-xl font-bold text-radar-text mb-2">Distributing Tokens</h2>
            <p className="text-radar-textdim font-mono text-xs">Batching transactions... ({eligibleCount} wallets)</p>
        </div>
    );
  }

  if (step === 'DONE') {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center animate-fade-in">
            <CheckCircle2 size={64} className="text-radar-green mb-6" />
            <h2 className="text-2xl font-bold text-radar-text mb-2">Airdrop Complete!</h2>
            <p className="text-radar-textdim mb-6">Successfully sent {(amountPerUser * eligibleCount).toLocaleString()} {selectedToken}.</p>
            <div className="bg-radar-panel p-4 rounded-lg border border-radar-dim mb-6 flex items-center gap-3">
                <Trophy className="text-yellow-400" />
                <div className="text-left">
                    <div className="text-xs text-radar-textdim">XP Earned</div>
                    <div className="font-bold text-radar-text">+500 XP</div>
                </div>
            </div>
            <button onClick={() => setStep('CONFIG')} className="text-radar-green hover:underline">Start New Campaign</button>
        </div>
      );
  }

  const FilterButton = ({ type, icon: Icon, label }: { type: FilterType, icon: any, label: string }) => (
    <button 
        onClick={() => setTargetType(type)}
        className={`p-3 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-2 ${targetType === type ? 'bg-radar-green text-black border-radar-green shadow-[0_0_10px_rgba(0,255,65,0.3)]' : 'bg-radar-input text-radar-textdim border-radar-dim hover:border-radar-textdim'}`}
    >
        <Icon size={18} />
        <span>{label}</span>
    </button>
  );

  return (
    <div className="pb-24 pt-4 px-4 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-radar-text tracking-tighter flex items-center gap-2">
            <Send className="text-radar-green" /> AIRDROP
        </h2>
        <p className="text-radar-textdim text-sm">Reward your loyal Farcaster community.</p>
      </div>

      <div className="space-y-6">
        {/* Token Selection */}
        <div className="bg-radar-panel p-4 rounded-xl border border-radar-dim">
            <label className="text-xs text-radar-green font-bold uppercase tracking-wider mb-2 block">Select Asset</label>
            <select 
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="w-full bg-radar-input text-radar-text p-3 rounded-lg border border-radar-dim outline-none focus:border-radar-green"
            >
                <option value="MYTOKEN">MYTOKEN (Created by you)</option>
                <option value="CLANKER">CLANKER</option>
                <option value="DEGEN">DEGEN</option>
            </select>
            <div className="text-right text-xs text-radar-textdim mt-1">Balance: 1,000,000 {selectedToken}</div>
        </div>

        {/* Criteria / XP Filter */}
        <div className="bg-radar-panel p-4 rounded-xl border border-radar-dim">
            <div className="flex items-center gap-2 mb-3">
                <Filter size={16} className="text-radar-green" />
                <label className="text-xs text-radar-text font-bold uppercase tracking-wider">Target Audience</label>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <FilterButton type="ALL" icon={Users} label="All" />
                <FilterButton type="XP" icon={Zap} label="High XP" />
                <FilterButton type="WHALES" icon={Crown} label="Whales" />
                <FilterButton type="HOLDERS" icon={Coins} label="Holders" />
                <FilterButton type="POSTERS" icon={MessageSquare} label="Active" />
            </div>

            {targetType === 'HOLDERS' && (
                <div className="mt-3 animate-fade-in">
                    <label className="text-[10px] text-radar-textdim uppercase font-bold mb-1 block">Required Token Holding</label>
                    <input 
                        type="text" 
                        value={holderTicker}
                        onChange={(e) => setHolderTicker(e.target.value.toUpperCase())}
                        placeholder="e.g. DEGEN"
                        className="w-full bg-radar-input/50 border border-radar-dim rounded p-2 text-radar-text text-sm focus:border-radar-green outline-none"
                    />
                </div>
            )}
            
            <div className="mt-4 text-xs text-radar-textdim bg-radar-dim/20 p-3 rounded border border-radar-dim/50 flex items-start gap-2">
                <Trophy size={14} className="shrink-0 mt-0.5 text-yellow-500" />
                <p className="leading-snug">
                    {targetType === 'ALL' && "Distributing to all followers regardless of wallet activity."}
                    {targetType === 'XP' && "Filtering for followers with > 500 Alpha Radar XP. Ensures tokens go to active traders, not bots."}
                    {targetType === 'WHALES' && "Targeting wallets holding > 1 ETH worth of assets on Base."}
                    {targetType === 'HOLDERS' && `Targeting followers who hold $${holderTicker} in their connected wallet.`}
                    {targetType === 'POSTERS' && "Targeting followers who have casted at least 5 times in the last week."}
                </p>
            </div>
        </div>

        {/* Amount */}
        <div className="bg-radar-panel p-4 rounded-xl border border-radar-dim">
            <label className="text-xs text-radar-green font-bold uppercase tracking-wider mb-2 block">Amount Per User</label>
            <div className="flex items-center gap-2">
                <input 
                    type="number"
                    value={amountPerUser}
                    onChange={(e) => setAmountPerUser(parseInt(e.target.value))}
                    className="flex-1 bg-radar-input text-radar-text p-3 rounded-lg border border-radar-dim outline-none focus:border-radar-green font-mono text-lg"
                />
                <span className="font-bold text-radar-textdim">{selectedToken}</span>
            </div>
        </div>

        {/* Confirmation State */}
        {step === 'CONFIRM' && (
            <div className="bg-radar-green/10 border border-radar-green/50 p-4 rounded-xl animate-fade-in">
                <h3 className="font-bold text-radar-text mb-2 flex items-center gap-2"><CheckCircle2 size={16} className="text-radar-green"/> Ready to Launch</h3>
                <div className="space-y-1 text-sm font-mono text-radar-textdim">
                    <div className="flex justify-between"><span>Recipients:</span> <span className="text-radar-text">{eligibleCount}</span></div>
                    <div className="flex justify-between"><span>Per User:</span> <span className="text-radar-text">{amountPerUser} {selectedToken}</span></div>
                    <div className="border-t border-radar-dim my-2 pt-2 flex justify-between font-bold text-radar-green">
                        <span>Total:</span> 
                        <span>{(eligibleCount * amountPerUser).toLocaleString()} {selectedToken}</span>
                    </div>
                </div>
            </div>
        )}

        {/* Action Button */}
        {step === 'CONFIG' ? (
            <button 
                onClick={handleScan}
                className="w-full bg-radar-input text-radar-text font-bold py-4 rounded-lg hover:bg-radar-dim transition-all border border-radar-dim flex items-center justify-center gap-2"
            >
                <Users size={18} /> SCAN ELIGIBLE WALLETS
            </button>
        ) : (
             <button 
                onClick={handleExecute}
                className="w-full bg-radar-green text-black font-bold py-4 rounded-lg hover:bg-radar-accent transition-all shadow-[0_0_20px_rgba(0,255,65,0.3)] flex items-center justify-center gap-2"
            >
                <Rocket size={18} className="animate-pulse" /> DEPLOY AIRDROP
            </button>
        )}
        
        <div className="flex items-center justify-center gap-2 text-[10px] text-radar-textdim">
            <AlertTriangle size={12} />
            <span>Gas fees sponsored by Base for high XP users</span>
        </div>

      </div>
    </div>
  );
};