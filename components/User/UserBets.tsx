import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicClient, useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config';
import { formatEther } from 'viem';
import { Trophy, Timer, Users, ArrowRight, Loader } from 'lucide-react';

interface BetStructOutput {
  creator: string;
  description: string;
  totalPool: bigint;
  option1Pool: bigint;
  option2Pool: bigint;
  creationTime: bigint;
  endTime: bigint;
  isResolved: boolean;
  winningOption: number;
}

interface UserBet {
  id: number;
  description: string;
  amount: bigint;
  isResolved: boolean;
  winningOption: number;
  option: number;
  totalPool: bigint;
  option1Pool: bigint;
  option2Pool: bigint;
  creator: string;
  creationTime: bigint;
  endTime: bigint;
}

const UserBets: React.FC = () => {
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [expandedBetId, setExpandedBetId] = useState<number | null>(null);
  const [claimingBetId, setClaimingBetId] = useState<number | null>(null);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { address } = useAccount();

  const { data: betsCount } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'nextBetId',
  });

  const { write: claimWinnings, data: claimData } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'claimWinnings',
    onSuccess: (data) => {
      setClaimTxHash(data.hash);
    },
    onError: (error: any) => {
      setError(error?.message || 'Failed to claim winnings');
      setClaimingBetId(null);
      setTimeout(() => setError(null), 5000);
    },
  });

  const { isLoading: isClaimPending } = useWaitForTransaction({
    hash: claimTxHash as `0x${string}`,
    onSuccess: () => {
      fetchUserBets();
      setClaimingBetId(null);
      setClaimTxHash(null);
    },
    onError: (error) => {
      setError('Transaction failed. Please try again.');
      setClaimingBetId(null);
      setClaimTxHash(null);
      setTimeout(() => setError(null), 5000);
    },
  });

  const calculateWinnings = (bet: UserBet) => {
    if (bet.winningOption !== bet.option) return BigInt(0);
    
    const winningPool = bet.winningOption === 1 ? bet.option1Pool : bet.option2Pool;
    const userShare = (bet.amount * bet.totalPool) / winningPool;
    const creatorFee = (userShare * BigInt(3)) / BigInt(100);
    
    return userShare - creatorFee;
  };

  const fetchUserBets = async () => {
    if (betsCount && publicClient && address) {
      setIsLoading(true);
      try {
        const fetchedBets: UserBet[] = [];
        for (let i = 0; i < Number(betsCount); i++) {
          const userBet1 = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'userBets',
            args: [BigInt(i), address, 1],
          }) as bigint;
          const userBet2 = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'userBets',
            args: [BigInt(i), address, 2],
          }) as bigint;
          
          if (userBet1 > BigInt(0) || userBet2 > BigInt(0)) {
            type BetDataArray = [string, string, bigint, bigint, bigint, bigint, bigint, boolean, number];
            
            const betData = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'bets',
              args: [BigInt(i)],
            }) as BetDataArray;

            const bet: UserBet = {
              id: i,
              creator: betData[0],
              description: betData[1],
              totalPool: betData[2],
              option1Pool: betData[3],
              option2Pool: betData[4],
              amount: userBet1 > BigInt(0) ? userBet1 : userBet2,
              creationTime: betData[5],
              endTime: betData[6],
              isResolved: betData[7],
              winningOption: betData[8],
              option: userBet1 > BigInt(0) ? 1 : 2
            };

            fetchedBets.push(bet);
          }
        }
        setUserBets(fetchedBets);
      } catch (err) {
        console.error('Error fetching user bets:', err);
        setError('Failed to fetch your bets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchUserBets();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBetClick = (betId: number) => {
    setExpandedBetId(expandedBetId === betId ? null : betId);
  };

  const handleClaimClick = async (betId: number) => {
    const bet = userBets.find(b => b.id === betId);
    if (!bet) return;

    try {
      setClaimingBetId(betId);
      claimWinnings({
        args: [BigInt(betId)],
      });
    } catch (error) {
      console.error('Error claiming winnings:', error);
      setError('Failed to claim winnings. Please try again.');
      setClaimingBetId(null);
    }
  };

  useEffect(() => {
    if (betsCount && publicClient && address) {
      fetchUserBets();
    }
  }, [betsCount, publicClient, address]);
  const BetCard = ({ bet }: { bet: UserBet }) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const isEnded = Number(bet.endTime) < currentTime;
    const hasWon = bet.isResolved && bet.winningOption === bet.option;
    const winnings = calculateWinnings(bet);
    const winningPool = bet.winningOption === 1 ? bet.option1Pool : bet.option2Pool;

    return (
      <motion.div
        layoutId={`bet-${bet.id}`}
        onClick={() => handleBetClick(bet.id)}
        className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-purple-600 font-semibold text-lg">
              Your Bet: {formatEther(bet.amount)} FAZ
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                bet.isResolved
                  ? hasWon 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {bet.isResolved 
                ? hasWon ? 'Won' : 'Lost'
                : 'Active'
              }
            </span>
          </div>
          <motion.div
            animate={{ rotate: expandedBetId === bet.id ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </div>

        <AnimatePresence>
          {expandedBetId === bet.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Bet Description</h4>
                  <p className="text-gray-800 font-medium bg-gray-50 p-3 rounded-lg">
                    {bet.description || 'No description available'}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Your Choice</h4>
                    <p className="text-purple-600 font-medium">
                      {bet.option === 1 ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Total Pool</h4>
                    <p className="text-gray-800 font-medium">
                      {formatEther(bet.totalPool)} FAZ
                    </p>
                  </div>
                </div>

                {bet.isResolved && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Outcome</h4>
                      <p className={`font-medium ${hasWon ? 'text-green-600' : 'text-red-600'}`}>
                        {bet.winningOption === 1 ? 'Yes' : 'No'}
                      </p>
                    </div>

                    {hasWon && winnings > BigInt(0) && (
                      <>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Your Bet</span>
                            <span className="font-medium">{formatEther(bet.amount)} FAZ</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Pool</span>
                            <span className="font-medium">{formatEther(bet.totalPool)} FAZ</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Winning Side Total</span>
                            <span className="font-medium">{formatEther(winningPool)} FAZ</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Your Share</span>
                            <span className="font-medium">
                              {((Number(bet.amount) * 100) / Number(winningPool)).toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Expected Winnings (Before Fee)</span>
                            <span className="font-medium">
                              {formatEther((bet.amount * bet.totalPool) / winningPool)} FAZ
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Creator Fee (3%)</span>
                            <span className="font-medium">
                              {formatEther((winnings * BigInt(3)) / BigInt(97))} FAZ
                            </span>
                          </div>
                          <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                            <span className="text-green-600">Final Winnings</span>
                            <span className="text-green-600">{formatEther(winnings)} FAZ</span>
                          </div>
                          <div className="text-sm text-gray-500 pt-2">
                            <span>Net Profit: </span>
                            <span className="font-medium text-green-600">
                              {formatEther(winnings - bet.amount)} FAZ
                            </span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimClick(bet.id);
                          }}
                          disabled={claimingBetId === bet.id || isClaimPending}
                          className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {claimingBetId === bet.id ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              <span>Claiming...</span>
                            </>
                          ) : (
                            <>
                              <Trophy className="w-4 h-4" />
                              Claim Winnings
                            </>
                          )}
                        </motion.button>
                      </>
                    )}
                  </>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">End Time</h4>
                  <p className="text-gray-600">
                    {new Date(Number(bet.endTime) * 1000).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-red-500 text-center py-4"
      >
        {error}
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Bets</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-ff6977 rounded-lg hover:bg-ff6977 transition-colors"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </motion.button>
        </div>
       
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
            />
          </div>
        ) : userBets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-gray-600 text-lg">You have not placed any bets yet.</p>
          </motion.div>
        ) : (
          <>
            <div className="flex space-x-2 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab('active');
                  setExpandedBetId(null);
                }}
                className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200
                  ${activeTab === 'active'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Active Bets ({userBets.filter(bet => !bet.isResolved).length})
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab('resolved');
                  setExpandedBetId(null);
                }}
                className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200
                  ${activeTab === 'resolved'
                    ? 'bg-ff3649 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Resolved Bets ({userBets.filter(bet => bet.isResolved).length})
              </motion.button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {userBets
                  .filter(bet => (activeTab === 'active' ? !bet.isResolved : bet.isResolved))
                  .map((bet) => (
                    <BetCard key={bet.id} bet={bet} />
                  ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default UserBets;