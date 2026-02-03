export enum ViewState {
  RADAR = 'RADAR',
  LAUNCH = 'LAUNCH',
  SWAP = 'SWAP',
  LIQUIDITY = 'LIQUIDITY',
  PORTFOLIO = 'PORTFOLIO',
  AIRDROP = 'AIRDROP'
}

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

export interface TokenForm {
  name: string;
  ticker: string;
  supply: number;
  tax: number;
  image: File | null;
  description: string;
  bondingCurve: boolean;
  lockDuration: number;
  teamAllocation: number;
  enableVesting: boolean;
}

export interface TokenData {
  id: string;
  name: string;
  ticker: string;
  price: number;
  change24h: number;
  marketCap: string;
  volume: string;
  image: string;
  twitter?: string;
}

export interface PortfolioItem {
  token: string;
  balance: string;
  value: string;
  isCreated?: boolean;
  vesting?: {
    total: string;
    unlockDate: string;
    percentage: number;
  };
}

export interface UserXP {
  current: number;
  level: number;
  nextLevelAt: number;
  history: { action: string; amount: number; timestamp: number }[];
}