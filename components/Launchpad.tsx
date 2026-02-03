import React, { useState, useEffect } from 'react';
import { TokenForm, ViewState, TokenData } from '../types';
import { useFarcasterSDK } from '../services/farcasterService';
import { Upload, Zap, Lock, Info, CheckCircle2, Loader2, Rocket, Droplets, Trophy, Percent, Shield, Image as ImageIcon } from 'lucide-react';

interface LaunchpadProps {
  onSuccess: (token: TokenData) => void;
  onAction: (action: string, amount: number) => void;
}

export const Launchpad: React.FC<LaunchpadProps> = ({ onSuccess, onAction }) => {
  const { shareCast } = useFarcasterSDK();
  const [step, setStep] = useState<'FORM' | 'DEPLOYING' | 'LP' | 'DONE'>('FORM');
  const [formData, setFormData] = useState<TokenForm>({
    name: '',
    ticker: '',
    supply: 1000000000,
    tax: 1,
    image: null,
    description: '',
    bondingCurve: true,
    lockDuration: 180,
    teamAllocation: 5,
    enableVesting: false
  });
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  const handleDeploy = async () => {
    if (!formData.name || !formData.ticker) return;

    setStep('DEPLOYING');
    addLog(`Initializing deployment for $${formData.ticker}...`);
    
    // Simulate Contract Deploy
    setTimeout(() => {
      addLog("Contract deployed at 0x7a...4b2");
      if (formData.tax > 0) addLog(`Setting buy/sell tax to ${formData.tax}%...`);
      addLog("Verifying source code...");
      
      setStep('LP');
      
      if (formData.bondingCurve) {
          addLog("Initializing Bonding Curve mechanism...");
          addLog("Setting curve parameters (Linear y=mx)...");
      } else {
          addLog("Creating Uniswap V3 Pool...");
          addLog("Seeding standard liquidity pool...");
      }
      
      // Simulate LP Creation & Vesting
      setTimeout(() => {
        if (formData.enableVesting && formData.teamAllocation > 0) {
            addLog(`Vesting Contract: Locking ${formData.teamAllocation}% supply...`);
            addLog(`Vesting Schedule: 1 year linear.`);
        }

        if (formData.bondingCurve) {
            addLog("Bonding curve active. Trading enabled.");
        } else {
            addLog(`Liquidity locked for ${formData.lockDuration} days.`);
            addLog("Trading enabled.");
        }
        
        setStep('DONE');
        onAction('TOKEN_LAUNCH', 1000); // Award XP
        
        // Create the new TokenData object to pass back to App
        // In a real app, the image would be uploaded to IPFS/S3. Here we use the object URL for the session.
        const finalImage = previewUrl || 'https://picsum.photos/40/40';

        const newToken: TokenData = {
            id: Date.now().toString(),
            name: formData.name,
            ticker: formData.ticker,
            price: 0.00001, // Starting price
            change24h: 0,
            marketCap: '10K',
            volume: '0',
            image: finalImage
        };

        // Auto Cast
        setTimeout(() => {
            const type = formData.bondingCurve ? "Bonding Curve" : "Standard Pool";
            const castText = `🚀 Just launched $${formData.ticker} on Alpha Radar via ${type}!\n\nName: ${formData.name}\nSupply: ${formData.supply.toLocaleString()}\nTax: ${formData.tax}%\n\nTrade now on Base! #Base #AlphaRadar`;
            shareCast(castText);
            onSuccess(newToken);
        }, 1500);

      }, 2500);
    }, 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  if (step !== 'FORM') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 space-y-6 font-mono">
        <div className="w-full max-w-sm bg-radar-panel border border-radar-green/30 p-4 rounded-lg shadow-[0_0_20px_rgba(0,255,65,0.1)]">
            <div className="flex items-center space-x-3 mb-4 border-b border-radar-dim pb-2">
                {step === 'DONE' ? <CheckCircle2 className="text-radar-green" /> : <Loader2 className="animate-spin text-radar-green" />}
                <span className="text-radar-green font-bold uppercase tracking-widest">
                    {step === 'DONE' ? 'LAUNCH COMPLETE' : 'SYSTEM PROCESSING'}
                </span>
            </div>
            {/* Show final token preview in logs area if done */}
            {step === 'DONE' && (
                <div className="flex items-center gap-3 mb-4 bg-radar-dim/20 p-2 rounded border border-radar-dim">
                     <img src={previewUrl || 'https://picsum.photos/40/40'} className="w-10 h-10 rounded-full object-cover" />
                     <div>
                        <div className="font-bold text-radar-text">{formData.name}</div>
                        <div className="text-xs text-radar-green">${formData.ticker}</div>
                     </div>
                </div>
            )}
            <div className="space-y-2 h-48 overflow-y-auto text-xs text-radar-text opacity-80 font-mono">
                {logs.map((log, i) => (
                    <div key={i} className="animate-pulse">{log}</div>
                ))}
            </div>
            {step === 'DONE' && (
                <div className="mt-4 pt-2 border-t border-radar-dim flex items-center gap-2 text-yellow-400 animate-pulse">
                    <Trophy size={16} />
                    <span className="font-bold">+1000 XP Earned</span>
                </div>
            )}
        </div>
        {step === 'DONE' && (
             <p className="text-center text-sm text-radar-textdim">Opening compose window...</p>
        )}
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-radar-text tracking-tighter">INITIATE LAUNCH</h2>
        <p className="text-radar-textdim text-sm">Deploy token to Base. Auto-LP. Auto-Lock.</p>
      </div>

      <div className="space-y-5">
        
        {/* Token Preview / Identity Section */}
        <div className="bg-radar-panel p-4 rounded-lg border border-radar-dim flex items-center gap-4">
             <div className="relative w-16 h-16 shrink-0">
                <div className={`w-full h-full rounded-full border-2 ${previewUrl ? 'border-radar-green' : 'border-radar-dim border-dashed'} bg-radar-input overflow-hidden flex items-center justify-center group`}>
                     {previewUrl ? (
                         <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                     ) : (
                         <ImageIcon className="text-radar-textdim" size={24} />
                     )}
                     <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                    />
                     {!previewUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Upload size={12} className="text-white" />
                        </div>
                     )}
                </div>
                {previewUrl && (
                    <div className="absolute -bottom-1 -right-1 bg-radar-panel rounded-full p-1 border border-radar-dim z-10">
                        <CheckCircle2 size={12} className="text-radar-green" />
                    </div>
                )}
             </div>
             
             <div className="flex-1 space-y-2">
                 <input
                    type="text"
                    className="w-full bg-transparent border-b border-radar-dim focus:border-radar-green text-radar-text text-lg font-bold placeholder-radar-textdim outline-none transition-colors"
                    placeholder="Token Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 />
                 <input
                    type="text"
                    className="w-full bg-transparent border-b border-radar-dim focus:border-radar-green text-radar-green font-mono text-sm placeholder-radar-textdim outline-none transition-colors uppercase"
                    placeholder="$TICKER"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                 />
             </div>
        </div>

        {/* Live Preview Card */}
        <div className="mb-2">
            <label className="text-xs text-radar-textdim font-bold uppercase tracking-wider mb-2 block">Radar Feed Preview</label>
            <div className="flex items-center justify-between bg-radar-panel border border-radar-dim p-4 rounded-lg opacity-80">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-radar-dim overflow-hidden bg-radar-input flex items-center justify-center">
                         {previewUrl ? (
                             <img src={previewUrl} className="w-full h-full object-cover" />
                         ) : (
                             <span className="text-radar-textdim text-[10px]">IMG</span>
                         )}
                    </div>
                    <div>
                        <div className="font-bold text-radar-text flex items-center gap-2">
                            {formData.ticker || 'TICKER'}
                        </div>
                        <div className="text-xs text-radar-textdim">{formData.name || 'Token Name'}</div>
                    </div>
                </div>
                <div className="text-right opacity-50">
                    <div className="text-radar-text font-mono">$0.00001</div>
                    <div className="text-xs font-bold text-radar-green">+0.00%</div>
                </div>
            </div>
        </div>

        {/* Configuration */}
        <div className="bg-radar-panel p-4 rounded-lg border border-radar-dim space-y-4">
            {/* Bonding Curve Toggle */}
            <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setFormData({...formData, bondingCurve: !formData.bondingCurve})}>
                <div className="flex items-center gap-2">
                    {formData.bondingCurve ? (
                        <Zap size={16} className="text-yellow-400" />
                    ) : (
                        <Droplets size={16} className="text-blue-400" />
                    )}
                    <span className={`text-sm font-bold ${formData.bondingCurve ? 'text-radar-text' : 'text-radar-textdim'}`}>
                        {formData.bondingCurve ? "Bonding Curve Launch" : "Standard Liquidity Pool"}
                    </span>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${formData.bondingCurve ? 'bg-radar-green' : 'bg-radar-dim'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${formData.bondingCurve ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
            </div>

            {/* Tax Configuration */}
            <div className="pt-2 border-t border-radar-dim">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-radar-green font-bold uppercase flex items-center gap-1"><Percent size={12}/> Tax (Buy/Sell)</label>
                    <span className="text-xs text-radar-text font-mono">{formData.tax}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.5"
                    value={formData.tax} 
                    onChange={(e) => setFormData({...formData, tax: parseFloat(e.target.value)})}
                    className="w-full h-1 bg-radar-dim rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-radar-green [&::-webkit-slider-thumb]:rounded-full"
                />
            </div>
            
             {/* Vesting Configuration */}
             <div className="pt-2 border-t border-radar-dim">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-radar-green font-bold uppercase flex items-center gap-1"><Shield size={12}/> Team Vesting</label>
                    <div 
                        onClick={() => setFormData({...formData, enableVesting: !formData.enableVesting})}
                        className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${formData.enableVesting ? 'bg-radar-green' : 'bg-radar-dim'}`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${formData.enableVesting ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                </div>
                {formData.enableVesting && (
                    <div className="animate-fade-in bg-radar-input p-2 rounded border border-radar-dim">
                        <div className="flex justify-between text-[10px] text-radar-textdim mb-1">
                            <span>Team Allocation Locked</span>
                            <span className="text-radar-text font-mono">{formData.teamAllocation}%</span>
                        </div>
                         <input 
                            type="range" 
                            min="1" 
                            max="20" 
                            value={formData.teamAllocation} 
                            onChange={(e) => setFormData({...formData, teamAllocation: parseInt(e.target.value)})}
                            className="w-full h-1 bg-radar-dim rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-yellow-400 [&::-webkit-slider-thumb]:rounded-full"
                        />
                        <p className="text-[9px] text-radar-textdim mt-1">Allocation locked for 12 months with linear unlocking.</p>
                    </div>
                )}
            </div>

            {/* Lock Duration Config */}
            <div className="space-y-2 pt-2 border-t border-radar-dim">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Lock size={16} className="text-radar-green" />
                        <span className="text-sm font-medium text-radar-text">Liquidity Lock</span>
                    </div>
                    <span className="text-xs text-radar-green font-mono">{formData.lockDuration} Days</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                    {[30, 90, 180, 365].map(days => (
                        <button
                            key={days}
                            onClick={() => setFormData({...formData, lockDuration: days})}
                            className={`text-[10px] py-1.5 rounded border transition-colors ${
                                formData.lockDuration === days 
                                ? 'bg-radar-green text-black border-radar-green font-bold' 
                                : 'bg-radar-input text-radar-textdim border-radar-dim hover:border-radar-textdim'
                            }`}
                        >
                            {days}d
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-radar-dim">
                     <span className="text-[10px] text-radar-textdim uppercase font-bold">Custom:</span>
                     <input 
                        type="number"
                        placeholder="Days"
                        value={formData.lockDuration || ''}
                        onChange={(e) => setFormData({...formData, lockDuration: parseInt(e.target.value) || 0})}
                        className="w-full bg-radar-input border border-radar-dim rounded p-1.5 text-right text-xs text-radar-text outline-none focus:border-radar-green"
                     />
                </div>
            </div>

             <div>
                <div className="flex justify-between mb-1">
                    <label className="text-xs text-radar-textdim">Supply</label>
                    <span className="text-xs text-radar-text font-mono">{formData.supply.toLocaleString()}</span>
                </div>
                <input 
                    type="range" 
                    min="1000000" 
                    max="10000000000" 
                    value={formData.supply} 
                    onChange={(e) => setFormData({...formData, supply: parseInt(e.target.value)})}
                    className="w-full h-1 bg-radar-dim rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-radar-green [&::-webkit-slider-thumb]:rounded-full"
                />
            </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDeploy}
          className="w-full bg-radar-green text-black font-bold text-lg py-4 rounded-lg hover:bg-radar-accent transition-all shadow-[0_0_15px_rgba(0,255,65,0.4)] flex items-center justify-center gap-2"
        >
          <Rocket className="animate-pulse" />
          {formData.bondingCurve ? "START BONDING CURVE" : "DEPLOY POOL"}
        </button>

        <div className="flex items-start gap-2 text-[10px] text-radar-textdim bg-radar-panel p-2 rounded">
            <Info size={14} className="mt-0.5 shrink-0" />
            <p>Deployment fee: ~0.002 ETH. Contract verification and LP creation handled automatically.</p>
        </div>
      </div>
    </div>
  );
};