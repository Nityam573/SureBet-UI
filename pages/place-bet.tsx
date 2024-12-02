import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import CreateBet from '../components/Bets/CreateBet';

const CreateBetPage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Place Bet - SureBet</title>
        <meta name="description" content="Create a new bet on our decentralized betting platform" />
      </Head>

      <main className="container mx-auto p-4">
        <CreateBet />
      </main>
    </Layout>
  );
};

export default CreateBetPage;