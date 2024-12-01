import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePublicClient, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config';
import { formatEther } from 'viem';

const CHUNK_SIZE = 2000; // Maximum blocks per request

const UserWinnings: React.FC = () => {
  const [totalWinnings, setTotalWinnings] = useState('0');
  const [isClient, setIsClient] = useState(false);
  const publicClient = usePublicClient();
  const { address } = useAccount();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchClaimedWinnings = async () => {
      if (!publicClient || !address) return;

      try {
        // Get the most recent block
        const latestBlock = await publicClient.getBlockNumber();
        let total = 0n;

        // Get deployment block or use a known starting block
        const deploymentBlock = 36656282n - 10000n; // Adjust this to your contract deployment block
        
        // Fetch in chunks of 2000 blocks
        for (let fromBlock = deploymentBlock; fromBlock < latestBlock; fromBlock += BigInt(CHUNK_SIZE)) {
          const toBlock = (fromBlock + BigInt(CHUNK_SIZE)) > latestBlock 
            ? latestBlock 
            : fromBlock + BigInt(CHUNK_SIZE);

          const logs = await publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: {
              type: 'event',
              name: 'Withdrawal',
              inputs: [
                { indexed: true, type: 'address', name: 'user' },
                { indexed: false, type: 'uint256', name: 'amount' }
              ]
            },
            args: {
              user: address as `0x${string}`
            },
            fromBlock: fromBlock,
            toBlock: toBlock
          });

          for (const log of logs) {
            const amount = BigInt(log.data);
            total += amount;
            console.log('Found withdrawal:', formatEther(amount));
          }
        }

        console.log('Total claimed winnings:', formatEther(total));
        setTotalWinnings(formatEther(total));

      } catch (error) {
        console.error('Error fetching winnings:', error);
      }
    };

    if (isClient && address) {
      fetchClaimedWinnings();
    }
  }, [publicClient, address, isClient]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Total Winnings</h2>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-ff3649 to-ff6977 p-6 text-white"
      >
        <div className="relative z-10">
          <p className="text-purple-100 mb-2">Total Claimed Earnings</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold">
              {parseFloat(totalWinnings).toFixed(4)}
            </span>
            <span className="text-xl text-purple-100">AVAX</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10" />
      </motion.div>

      <div className="mt-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"
        >
          <span className="text-gray-600">Status</span>
          <span className="font-medium text-green-600">Available</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"
        >
          <span className="text-gray-600">Network</span>
          <span className="font-medium text-gray-800">Avalanche Fuji</span>
        </motion.div>
      </div>
    </div>
  );
};

export default UserWinnings;