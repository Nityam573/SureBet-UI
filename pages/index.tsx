import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { 
  BrainCircuit, 
  CircleGauge, 
  ShieldCheck, 
  Users, 
  ArrowBigRightDash
} from 'lucide-react';

import Image from 'next/image';
import SureBet from '@/assets/SureBet.png';

interface FeatureCardProps {
  Icon: any;
  title: string;
  description: string;
}

interface StatCardProps {
  value: string;
  label: string;
}

const FeatureCard = ({ Icon, title, description }: FeatureCardProps) => (
  <div className="group relative overflow-hidden rounded-2xl">
    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20" />
    <div className="relative p-8 bg-ff3649  border border-white/20 rounded-2xl transform transition-all duration-500 hover:scale-[1.02]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-ff3649 rounded-full blur-2xl transform translate-x-16 -translate-y-8 group-hover:translate-x-8 transition-transform duration-700" />
      <div className="flex items-center justify-center w-16 h-16 mb-6 relative">
        <div className="absolute inset-0 bg-black rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
        <div className="absolute inset-0.5 bg-white rounded-xl" />
        <Icon className="relative w-8 h-8 text-ff3649 group-hover:scale-110 transition-transform duration-300" />
      </div>
      <h3 className="text-2xl font-bold mb-3 text-black">{title}</h3>
      <p className="text-black leading-relaxed">{description}</p>
    </div>
  </div>
);

const StatCard = ({ value, label }: StatCardProps) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-2xl blur-xl transition-opacity duration-300 opacity-50 group-hover:opacity-100" />
    <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl text-center transform transition-all duration-300 hover:-translate-y-1 border border-white/50">
      <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
        {value}
      </div>
      <div className="text-sm font-medium text-gray-600 mt-1">{label}</div>
    </div>
  </div>
);

const Home: NextPage = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStartBetting = () => {
    router.push('/all-bets');
  };

  return (
    <Layout>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        :global(.animate-float) {
          animation: float 6s ease-in-out infinite;
        }
        
        :global(.animate-float-delayed) {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        :global(.animate-wiggle) {
          animation: wiggle 2s ease-in-out infinite;
        }
      `}</style>

      <Head>
        <title>SureBet</title>
        <meta name="description" content="Where smart contracts meet smart bets. Join the coolest betting platform on Avalanche!" />
        <link rel="icon" href="/Sure-Bet.svg" />
      </Head>
      <main className="min-h-screen relative bg-gray-50">
    <div className={`relative container mx-auto px-4 pt-20 pb-32 transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
        
        <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center">
        <Image 
        src={SureBet}
        alt="Background Logo"
        className="object-cover w-full h-full"
        fill
        priority
        sizes="100vw"
    />

        </div>

        <div className="text-center max-w-5xl mx-auto mb-20 relative z-10">
            <h1 className="text-8xl font-black text-gray-900">
                <span className="block text-8xl font-light uppercase text-red-500 tracking-[0.2em] 
                            transform hover:scale-105 transition-all duration-300
                            relative z-10"
                    style={{
                        fontFamily: 'inter, sans-serif',
                        textShadow: '0 4px 12px rgba(255, 54, 73, 0.2)'
                    }}>
                    Sure
                </span>
                <span className="block text-8xl font-light uppercase text-red-500 tracking-[0.2em] 
                            transform hover:scale-105 transition-all duration-300
                            relative z-10"
                    style={{
                        fontFamily: 'inter, sans-serif',
                        textShadow: '0 4px 12px rgba(255, 54, 73, 0.2)'
                    }}>
                    Bet!
                </span>
              </h1>
              
            
            <p className="text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">Not your average gambling site. Unless your grandpa moonlights as a blockchain wizard and considers probability algorithms his bedtime reading. In that case, bump fists with him from us! 🎲
            </p>
            <div className="flex justify-center gap-6">
              <button 
                onClick={handleStartBetting}
                className="group relative overflow-hidden px-10 py-5 rounded-2xl bg-gradient-to-r  from-ff6977 to-ff3649 text-white font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-3">
                 
                 Get Started <ArrowBigRightDash />
                  <span className="text-2xl"></span>
                </span>
              </button>
            </div>
          </div>

          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4 text-gray-800">
              Why we are Better?
              <span className="inline-block ml-3 transform animate-wiggle">✨</span>
            </h2>
            <p className="text-xl text-gray-600 mb-16">
              No cap, just facts. And maybe a little sass. 
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
            <FeatureCard
              Icon={CircleGauge}
              title="Lightning Fast"
              description="Blink and you might miss how fast we settle. Actually, don't blink. Cuz you wanna see this. ⚡"
            />
            <FeatureCard
              Icon={ShieldCheck}
              title="Firewall Flex"
              description="Our security makes bank encryption look like a garage lock. 🔒"
            />
            <FeatureCard
              Icon={Users}
              title="Risk Takers Anonymous"
              description="Where HODL isn't just a typo, it's our sacred oath. 🚀"
            />
            <FeatureCard
              Icon={BrainCircuit}
              title="Jackpot Mindset"
              description="Second place? More like first warm-up. 🎯"
            />
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Home;