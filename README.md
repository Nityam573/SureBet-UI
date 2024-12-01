# BetWin - Decentralized Betting Platform on Avalanche 🎲

BetWin is a modern, user-friendly decentralized betting platform built on the Avalanche blockchain. Create custom betting events, participate in bets, and earn rewards in a transparent and trustless environment.

## 🌟 Features

### For Bettors
- **Create Custom Bets**: Set up binary outcome betting events with customizable duration
- **Participate in Bets**: Browse and join active betting pools
- **Smart Settlement**: Automatic winnings calculation and distribution
- **User Dashboard**: Track your active and resolved bets
- **Instant Claims**: Claim your winnings with one click
- **Real-time Updates**: Live updates on bet status and pool sizes

### For Bet Creators
- **Earn Rewards**: Get 3% of the total pool size as a creator fee
- **Flexible Duration**: Set betting periods from 1 hour to 30 days
- **Resolution Control**: Resolve your bets when the outcome is known
- **Creator Dashboard**: Manage all your created bets in one place

### Platform Features
- **Lightning Fast**: Built on Avalanche for near-instant finality
- **Low Fees**: Minimal transaction costs on Avalanche
- **Transparent**: All betting logic secured by smart contracts
- **Mobile Responsive**: Seamless experience across all devices
- **User-Friendly**: Modern UI with smooth animations and transitions

## 🔧 Technical Stack

### Frontend
- Next.js for server-side rendering
- TailwindCSS for styling
- Framer Motion for animations
- RainbowKit for wallet connection
- wagmi for blockchain interactions

### Smart Contracts
- Solidity 0.8.19
- OpenZeppelin contracts for security
- Non-custodial design
- Automated settlement logic

### Blockchain
- Avalanche C-Chain Testnet
- EVM compatible
- Smart contract powered

## 🎯 How It Works

### Creating a Bet
1. Connect your wallet
2. Click "Create Bet"
3. Enter bet description
4. Set duration (1 hour to 30 days)
5. Confirm transaction
6. Share with participants

### Placing a Bet
1. Browse available bets
2. Choose your position (Yes/No)
3. Enter bet amount
4. Confirm transaction
5. Wait for resolution

### Resolution & Claiming
1. Creator resolves bet after end time
2. Winners can claim their share
3. Automatic fee distribution to creator
4. Proportional winnings based on bet size

## 💎 Pool Distribution

For each bet:
- 97% distributed among winners
- 3% to bet creator
- Proportional distribution based on bet size

Example:
```
Total Pool: 100 AVAX
Yes Pool: 40 AVAX (2 bettors: 15 & 25 AVAX)
No Pool: 60 AVAX (3 bettors)

If "Yes" wins:
- Creator gets: 3 AVAX (3%)
- First bettor (15 AVAX) gets: ~36.5 AVAX
- Second bettor (25 AVAX) gets: ~60.5 AVAX
```
## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Basic betting functionality
- ✅ User dashboard
- ✅ Creator rewards

### Phase 2
- Multiple outcome bets
- Social features
- Bet categories
- Advanced analytics

### Phase 3
- Liquidity pools
- Token integration
- Governance system
- Mobile app

Built with ❤️ by XavierOP877