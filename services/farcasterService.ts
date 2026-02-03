import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { FarcasterUser } from '../types';

export const useFarcasterSDK = () => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<FarcasterUser | undefined>();

  useEffect(() => {
    const init = async () => {
      // Initialize SDK
      sdk.actions.ready();
      setIsReady(true);
      
      // Load User Context
      try {
        if (await sdk.isInMiniApp()) {
           const context = await sdk.context;
           if (context.user) {
             setUser({
               fid: context.user.fid,
               username: context.user.username || '',
               displayName: context.user.displayName || '',
               pfpUrl: context.user.pfpUrl || ''
             });
           }
        }
      } catch (e) {
        console.error("Error loading Farcaster context", e);
      }
    };
    
    init();
  }, []);

  const shareCast = (text: string, embeds?: string[]) => {
    sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}${embeds ? `&embeds[]=${embeds[0]}` : ''}`);
  };

  return { isReady, user, shareCast, sdk };
};