import React, { useEffect, useState } from 'react';
import { usePublicClient, useAccount, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config';
import BetItem from './BetItem';

interface Bet {
  id: number;
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

const BetList: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const { data: betsCount, isError: isBetsCountError, isLoading: isBetsCountLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'nextBetId',
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadBets = async () => {
      if (betsCount && publicClient) {
        setIsLoading(true);
        try {
          console.log('Bets count:', betsCount);
          const fetchedBets: Bet[] = [];
          for (let i = 0; i < Number(betsCount); i++) {
            try {
              const bet = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'bets',
                args: [BigInt(i)],
              }) as any[];
              console.log(`Raw bet ${i} data:`, bet);
              
              const betObject: Bet = {
                id: i,
                creator: bet[0],
                description: bet[1],
                totalPool: BigInt(bet[2]),
                option1Pool: BigInt(bet[3]),
                option2Pool: BigInt(bet[4]),
                creationTime: BigInt(bet[5]),
                endTime: BigInt(bet[6]),
                isResolved: bet[7],
                winningOption: Number(bet[8])
              };
              
              // Only add bets that are not resolved and haven't expired
              const currentTime = BigInt(Math.floor(Date.now() / 1000));
              if (!betObject.isResolved && betObject.endTime > currentTime) {
                console.log(`Adding active bet ${i}:`, betObject);
                fetchedBets.push(betObject);
              }
            } catch (err) {
              console.error(`Error fetching bet ${i}:`, err);
            }
          }
          console.log('All active bets:', fetchedBets);
          setBets(fetchedBets);
        } catch (err) {
          console.error('Error fetching bets:', err);
          setError('Failed to fetch bets. Please check your connection and try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isClient) {
      loadBets();
    }
  }, [betsCount, publicClient, isClient]);

  if (!isClient) return null;

  if (isLoading || isBetsCountLoading) return <div>Loading bets...</div>;
  if (isBetsCountError) return <div>Error loading bets count</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Active Bets (Total: {bets.length})</h2>
      {bets.length === 0 ? (
        <p>No active bets available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bets.map((bet) => (
            <BetItem key={bet.id} bet={bet} betId={bet.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BetList;