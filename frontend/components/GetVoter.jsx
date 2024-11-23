'use client';
import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { contractAddress, contractAbi } from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GetVoter = () => {
    const [inputAddress, setInputAddress] = useState("");
    const [voterData, setVoterData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { refetch } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getVoter",
        args: [inputAddress],
        enabled: false,
    });

    const handleFetch = async () => {
        setError(null);
        setVoterData(null);
        if (!inputAddress) {
            setError("Please use valid Ethereum address");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await refetch();
            setVoterData(data);
        } catch (e) {
            setError(e.message || "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-4xl font-extrabold mb-4 mt-8">Get Voter</h2>

            <div className="mb-4">
                <Input
                    placeholder="Ethereum address"
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value)}
                />
            </div>

            <Button
                onClick={handleFetch}
                disabled={isLoading}
                className="hover:bg-gray-600 bg-gray-700 text-white"
            >
                {isLoading ? "Loading..." : "Search"}
            </Button>

            {error && (
                <Alert className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {voterData && (
                <Alert className="mt-4">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                        <p>Whitelisted :{voterData.isRegistered ? "Yes" : "No"}</p>
                        <p>Has voted :{voterData.hasVoted ? "Yes" : "No"}</p>
                        <p>Vote ID :{voterData.votedProposalId?.toString() || "None"}</p>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default GetVoter;