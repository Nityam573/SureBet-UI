import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import BetList from '../components/Bets/BetList';

const AllBetsPage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>All Bets - BetWin</title>
        <meta name="description" content="View all available bets on our decentralized betting platform" />
      </Head>

      <main className="container mx-auto p-4">
        <BetList />
      </main>
    </Layout>
  );
};

export default AllBetsPage;