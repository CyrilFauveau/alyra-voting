'use client';
import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { contractAddress, contractAbi } from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const TallyVotes = () => {
    const { address } = useAccount();
    const { toast } = useToast();
    const [batchSize, setBatchSize] = useState("");

    const { data: hash, isPending, error, writeContract } = useWriteContract();

    const tallyVotes = async () => {
        try {
            writeContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: "tallyVotes",
                args: [batchSize],
                account: address,
            });
        } catch (e) {
            console.error(e);
            toast({
                title: "Error",
                description: "An error occurred during transaction",
                className: "bg-red-600",
            });
        }
    };

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isConfirmed) {
            toast({
                title: "Success",
                description: "The address ${voterAddress} has been added as a voter",
                className: "bg-green-600",
            });
            setBatchSize("");
        }
    }, [isConfirmed]);

    return (
        <>
            <h2 className="text-4xl font-extrabold mb-4 mt-8">Tally votes</h2>

            <div className="mb-4">
                <Input
                    placeholder="Batch size"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                />
            </div>

            <Button
                onClick={tallyVotes}
                className="hover:bg-gray-600 bg-gray-700 text-white"
                disabled={isPending || isConfirming}
            >
                {isPending || isConfirming ? "Tallying..." : "Tally"}
            </Button>

            {error && (
                <Alert className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}

            {isConfirmed && (
                <Alert className="mt-4">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>Votes have been tallied!</AlertDescription>
                </Alert>
            )}
        </>
    );
};

export default TallyVotes;