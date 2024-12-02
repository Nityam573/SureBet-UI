import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import TpsTester from '../components/Bets/TPStest';


const MyBetsPage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>TPSTest - SureBet</title>
        <meta name="description" content="View your bets and winnings on our decentralized betting platform" />
      </Head>

      <main className="container mx-auto p-4">
        <TpsTester />
        
      </main>
    </Layout>
  );
};

export default MyBetsPage;