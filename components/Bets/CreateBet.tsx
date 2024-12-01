import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContractWrite, useAccount, useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config';
import { Clock, Info, Check, Loader } from 'lucide-react';
import { useRouter } from 'next/router';

const CreateBet: React.FC = () => {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('7');
  const [timeUnit, setTimeUnit] = useState('days');
  const [endTimeString, setEndTimeString] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { address } = useAccount();

  const { write: createBet, data: createData, isLoading: isWriteLoading } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'createBet',
  });

  const { isLoading: isTransactionPending, isSuccess } = useWaitForTransaction({
    hash: createData?.hash,
    onSuccess: () => {
      setShowSuccess(true);
      resetForm();
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    },
  });

  const isLoading = isWriteLoading || isTransactionPending;

  // Update end time only on client side
  useEffect(() => {
    const endTime = new Date(Date.now() + (parseInt(duration) * (timeUnit === 'days' ? 86400000 : 3600000)));
    const formattedDate = endTime.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    setEndTimeString(formattedDate);
  }, [duration, timeUnit]);

  const resetForm = () => {
    setDescription('');
    setDuration('7');
    setTimeUnit('days');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const durationInSeconds = parseInt(duration) * (timeUnit === 'days' ? 86400 : 3600);
    
    try {
      createBet({
        args: [description, BigInt(durationInSeconds)],
      });
    } catch (error) {
      console.error('Error creating bet:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
  <div className="max-w-7xl mx-auto"> {/* Increased max width to accommodate side-by-side layout */}
    {/* Success Notification stays at top */}
    <AnimatePresence>
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <Check className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-green-800 font-medium">Bet Created Successfully!</p>
            <p className="text-green-600 text-sm">Your bet has been created and is now live.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New Bet</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Description Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bet Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 min-h-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="What are people betting on?"
                required
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3 px-4 bg-gradient-to-r from-ff6977 to-ff3649 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={`${isLoading ? 'invisible' : ''}`}>
                Create Bet
              </span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span className="ml-2">
                    {isWriteLoading ? 'Confirm in Wallet...' : 'Creating Bet...'}
                  </span>
                </div>
              )}
            </motion.button>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Duration Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Betting Duration
              </label>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    max={timeUnit === 'days' ? '30' : '720'}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value)}
                  disabled={isLoading}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>

              {endTimeString && (
                <div className="bg-purple-50 rounded-xl p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-purple-700 font-medium">
                      Betting will end on:
                    </p>
                    <p className="text-sm text-purple-600">
                      {endTimeString}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Important Notes:</p>
                <ul className="list-disc ml-4 mt-1 space-y-1">
                  <li>Minimum duration: 1 hour</li>
                  <li>Maximum duration: 30 days</li>
                  <li>You will earn 3% of the total betting pool as the creator</li>
                  <li>Once created, the duration cannot be modified</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
  );
};

export default CreateBet;