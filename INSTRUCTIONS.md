# Project Instructions

## 1. Overview
**Farcaster Alpha Radar** is a Base Mini App designed for the Farcaster ecosystem. It serves as a comprehensive crypto companion allowing users to:
- **Radar**: Discover trending tokens on Base.
- **Launchpad**: Deploy new tokens with automated liquidity pool creation and bonding curves.
- **Swap**: Trade assets directly within the app (simulated/real integration).
- **Liquidity**: Manage liquidity positions.
- **Portfolio**: Track holdings, net worth, and "Alpha Radar" XP level.
- **Airdrop**: Distribute tokens to Farcaster followers based on on-chain criteria.

The app uses a "Cyberpunk/Terminal" aesthetic with a dark mode default, utilizing Tailwind CSS for styling.

## 2. Tech Stack
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain Interaction**: 
  - Wagmi (Hooks & Configuration)
  - Viem (Low-level primitives)
  - Base Mainnet (Chain ID 8453)
- **Farcaster Integration**: 
  - `@farcaster/miniapp-sdk`: For user context and actions.
  - `@farcaster/miniapp-wagmi-connector`: For WalletConnect/Base Account injection.
- **Icons**: Lucide React
- **State Management**: React `useState` / `useEffect` (Local state), Wagmi (Wallet state).

## 3. Project Structure
- `index.html`: Entry point, contains CSS variables, Tailwind config, and importmap.
- `src/index.tsx`: React root, wraps App in `Providers`.
- `src/App.tsx`: Main layout, navigation logic, and view routing.
- `src/config.ts`: Wagmi client configuration for Base chain.
- `src/types.ts`: TypeScript interfaces for User, Tokens, and ViewStates.
- `src/components/`:
  - `Providers.tsx`: Wagmi and QueryClient providers.
  - `Navigation.tsx`: Bottom tab navigation.
  - `Radar.tsx`: Token discovery feed.
  - `Launchpad.tsx`: Token deployment UI.
  - `Swap.tsx`: DEX interface.
  - `Liquidity.tsx`: LP management.
  - `Portfolio.tsx`: User profile and asset tracking.
  - `Airdrop.tsx`: Token distribution tool.
- `src/services/farcasterService.ts`: Abstraction for Farcaster SDK interactions.
- `public/.well-known/farcaster.json`: Farcaster Frame/MiniApp Manifest.

## 4. Coding Standards
- **Functional Components**: Use `React.FC` with typed props.
- **Styling**: Use utility-first Tailwind classes. Avoid external CSS files where possible.
- **Mobile First**: Ensure layouts handle `safe-area-inset-bottom` and touch targets (min 44px).
- **Type Safety**: No `any`. Define interfaces in `types.ts`.
- **Async Handling**: Use `async/await` and handle loading states explicitly (e.g., `isProcessing`, `isReady`).
- **Wagmi**: Use `useAccount`, `useConnect` hooks for wallet interactions. Do not use `window.ethereum` directly if possible.

## 5. User Stories
1. **Connect**: As a user, I want my wallet to connect automatically when opening the Mini App on Base/Farcaster.
2. **Discover**: As a trader, I want to filter tokens by "Top Gainers" or "Volume" to find alpha.
3. **Launch**: As a creator, I want to deploy a token with one click, automatically seeding liquidity without handling complex ABI calls manually in the UI.
4. **Trade**: As a user, I want to swap ETH for tokens with clear gas estimates and slippage controls.
5. **Gamification**: As a user, I want to earn XP for every action (Swap, Launch, LP) to level up my profile.

## 6. APIs and Integrations
- **Base Mainnet**: Primary L2 network.
- **Farcaster Context**: Used to get `fid`, `username`, and `pfpUrl`.
- **Wagmi Connectors**: `farcasterMiniApp` connector is critical for the "Base Account" experience.
