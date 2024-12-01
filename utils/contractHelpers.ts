import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config';

export const getContract = (signer: ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const createBet = async (contract: ethers.Contract, description: string) => {
  const tx = await contract.createBet(description);
  await tx.wait();
};

export const fetchBets = async (contract: ethers.Contract) => {
  try {
    const betsCount = await contract.nextBetId();
    const bets = [];
    for (let i = 0; i < betsCount.toNumber(); i++) {
      const bet = await contract.bets(i);
      bets.push({
        id: i,
        description: bet.description,
        totalPool: bet.totalPool,
        option1Pool: bet.option1Pool,
        option2Pool: bet.option2Pool,
        creationTime: bet.creationTime,
        endTime: bet.endTime,
        isResolved: bet.isResolved,
        winningOption: bet.winningOption
      });
    }
    return bets;
  } catch (error) {
    console.error("Error fetching bets:", error);
    throw error;
  }
};

export const placeBet = async (contract: ethers.Contract, betId: number, option: number, amount: string) => {
  try {
    const tx = await contract.placeBet(betId, option, {
      value: ethers.utils.parseEther(amount)
    });
    await tx.wait();
  } catch (error) {
    console.error("Error placing bet:", error);
    throw error;
  }
};

export const fetchUserBets = async (contract: ethers.Contract, userAddress: string) => {
  const betsCount = await contract.nextBetId();
  const userBets = [];
  for (let i = 0; i < betsCount; i++) {
    const userBet1 = await contract.userBets(i, userAddress, 1);
    const userBet2 = await contract.userBets(i, userAddress, 2);
    if (userBet1.gt(0) || userBet2.gt(0)) {
      const bet = await contract.bets(i);
      userBets.push({
        id: i,
        description: bet.description,
        amount: userBet1.add(userBet2),
        isResolved: bet.isResolved,
        winnings: bet.isResolved ? await contract.calculateWinnings(i, userAddress) : ethers.BigNumber.from(0),
      });
    }
  }
  return userBets;
};