'use client';

import Voting from "@/components/Voting";
import NotConnected from "@/components/NotConnected";

import { useAccount } from "wagmi";

export default function Home() {

  const { isConnected } = useAccount();

  return (
    <>
      {isConnected ? (
        <Voting />
      ) : (
        <NotConnected />
      )}
    </>
  );
}