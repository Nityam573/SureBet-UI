import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContractWrite, useAccount, useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config';
import { parseEther, formatEther } from 'viem';

interface BetItemProps {
  bet: any;
  betId: number;
}

const BetItem: React.FC<BetItemProps> = ({ bet, betId }) => {
  const [amount, setAmount] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { address } = useAccount();
  const betCardRef = useRef<HTMLDivElement>(null);

  const { write: placeBet, data: placeBetData, isLoading: isPlacingBet } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'placeBet',
  });

  const { isLoading: isWaitingForTransaction, isSuccess } = useWaitForTransaction({
    hash: placeBetData?.hash,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (betCardRef.current && !betCardRef.current.contains(event.target as Node)) {
        setSelectedOption(null);
        setAmount('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlaceBet = async () => {
    if (selectedOption !== null && amount && address) {
      try {
        await placeBet({ 
          args: [BigInt(betId), BigInt(selectedOption)], 
          value: parseEther(amount) 
        });
      } catch (error) {
        console.error('Error placing bet:', error);
      }
    }
  };

  return (
    <motion.div
      ref={betCardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl "
    >
      <div className="p-10">
        <motion.h3 
          className="text-xl font-bold mb-3 text-gray-800"
          layoutId={`bet-title-${betId}`}
        >
          {bet.description}
        </motion.h3>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Pool:</span>
            <span className="font-semibold text-blue-600">
              {formatEther(bet.totalPool)} FAZ
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Option 1 Pool:</span>
            <span className="font-medium">{formatEther(bet.option1Pool)} FAZ</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Option 2 Pool:</span>
            <span className="font-medium">{formatEther(bet.option2Pool)} FAZ</span>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedOption(1)}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200 ${
              selectedOption === 1
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Yes
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedOption(2)}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200 ${
              selectedOption === 2
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            No
          </motion.button>
        </div>

        <AnimatePresence>
          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount in FAZ"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                step="0.01"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceBet}
                disabled={isPlacingBet || isWaitingForTransaction}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                  isPlacingBet || isWaitingForTransaction
                    ? 'bg-ff3649 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {isPlacingBet || isWaitingForTransaction ? 'Placing Bet...' : 'Place Bet'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-center text-sm text-green-600"
          >
            Bet placed successfully!
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BetItem;