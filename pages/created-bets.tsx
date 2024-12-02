import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import CreatedBets from '../components/Bets/CreatedBets';

const CreatedBetsPage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Created Bet - SureBet</title>
        <meta name="description" content="Create a new bet on our decentralized betting platform" />
      </Head>

      <main className="container mx-auto p-4">
        <CreatedBets />
      </main>
    </Layout>
  );
};

export default CreatedBetsPage;