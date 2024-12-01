import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicClient, useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config';
import { Trophy, Timer, Users, ArrowRight, AlertCircle, Loader } from 'lucide-react';

interface CreatedBet {
  id: number;
  creator: string;
  description: string;
  totalPool: bigint;
  option1Pool: bigint;
  option2Pool: bigint;
  creationTime: bigint;
  endTime: bigint;
  isResolved: boolean;
}

const CreatedBets: React.FC = () => {
  const [createdBets, setCreatedBets] = useState<CreatedBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingBetId, setResolvingBetId] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<1 | 2 | null>(null);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const { write: resolveBet, data: resolveData } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'resolveBet',
    onError: (error: any) => {
      setError(error?.message || 'Failed to resolve bet');
      setTimeout(() => setError(null), 5000);
    },
  });

  const { isLoading: isResolving } = useWaitForTransaction({
    hash: resolveData?.hash,
    onSuccess: () => {
      setResolvingBetId(null);
      setSelectedOption(null);
      fetchCreatedBets();
    },
    onError: (error: any) => {
      setError(error?.message || 'Transaction failed');
      setTimeout(() => setError(null), 5000);
    },
  });

  const { data: betsCount } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'nextBetId',
  });

  const fetchCreatedBets = async () => {
    if (!betsCount || !publicClient || !address) return;

    setIsLoading(true);
    try {
      const fetchedBets: CreatedBet[] = [];
      
      for (let i = 0; i < Number(betsCount); i++) {
        try {
          const bet = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'bets',
            args: [BigInt(i)],
          }) as any[];
          
          if (bet[0].toLowerCase() === address.toLowerCase()) {
            const betObj: CreatedBet = {
              id: i,
              creator: bet[0],
              description: bet[1],
              totalPool: bet[2],
              option1Pool: bet[3],
              option2Pool: bet[4],
              creationTime: bet[5],
              endTime: bet[6],
              isResolved: bet[7],
            };
            fetchedBets.push(betObj);
          }
        } catch (err) {
          console.error(`Error fetching bet ${i}:`, err);
        }
      }
      
      setCreatedBets(fetchedBets);
    } catch (error) {
      console.error('Error fetching created bets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatedBets();
  }, [betsCount, publicClient, address]);

  const handleResolve = (betId: number) => {
    const bet = createdBets.find(b => b.id === betId);
    if (!bet) return;

    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime < Number(bet.endTime)) {
      setError('Betting period has not ended yet');
      setTimeout(() => setError(null), 5000);
      return;
    }

    setResolvingBetId(betId);
    setSelectedOption(null);
  };

  const handleConfirmResolution = () => {
    if (resolvingBetId === null || selectedOption === null) return;

    resolveBet({
      args: [BigInt(resolvingBetId), selectedOption === 1],
    });
  };

  const BetCard = ({ bet }: { bet: CreatedBet }) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const isEnded = Number(bet.endTime) < currentTime;
    const canResolve = isEnded && !bet.isResolved;

    return (
      <motion.div
        layout
        className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-800">{bet.description}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              bet.isResolved
                ? 'bg-green-100 text-green-600'
                : isEnded
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-blue-100 text-blue-600'
            }`}>
              {bet.isResolved ? 'Resolved' : isEnded ? 'Ended' : 'Active'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Option 1 Pool</div>
              <div className="text-lg font-bold text-purple-600">
                {formatEther(bet.option1Pool)} FAZ
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Option 2 Pool</div>
              <div className="text-lg font-bold text-pink-600">
                {formatEther(bet.option2Pool)} FAZ
              </div>
            </div>
          </div>

          <div className="flex justify-between text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              Total Pool: {formatEther(bet.totalPool)} FAZ
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              {new Date(Number(bet.endTime) * 1000).toLocaleDateString()}
            </div>
          </div>

          {canResolve && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleResolve(bet.id)}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Resolve Bet
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg flex items-center gap-3 z-50"
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-800">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-red-400 hover:text-red-500"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Created Bets</h1>
          <div className="text-gray-600">Total: {createdBets.length}</div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : createdBets.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            You have not created any bets yet
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {createdBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} />
            ))}
          </div>
        )}

        {/* Resolution Modal */}
        <AnimatePresence>
          {resolvingBetId !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setResolvingBetId(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-6 max-w-md w-full border border-gray-200 shadow-xl"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Resolve Bet</h3>
                <p className="text-gray-600 mb-6">
                  Select the winning option to resolve this bet. This action cannot be undone.
                </p>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setSelectedOption(1)}
                    className={`w-full p-4 rounded-lg border transition-all duration-300 ${
                      selectedOption === 1
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:border-purple-200'
                    }`}
                  >
                    Option 1 (Yes)
                  </button>
                  <button
                    onClick={() => setSelectedOption(2)}
                    className={`w-full p-4 rounded-lg border transition-all duration-300 ${
                      selectedOption === 2
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:border-purple-200'
                    }`}
                  >
                    Option 2 (No)
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setResolvingBetId(null)}
                    className="flex-1 py-3 px-4 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmResolution}
                    disabled={selectedOption === null || isResolving}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                      selectedOption === null || isResolving
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                    } transition-all duration-300`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isResolving && <Loader className="w-4 h-4 animate-spin" />}
                      {isResolving ? 'Confirming...' : 'Confirm Resolution'}
                    </span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreatedBets;