'use client';
import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { contractAddress, contractAbi } from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const SetVote = () => {
    const { address } = useAccount();
    const { toast } = useToast();
    const [ vote, setVote] = useState("");

    const { data: voteId, isPending, error, writeContract } = useWriteContract();

    const addVote = async () => {
        try {
            writeContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: "setVote",
                args: [vote],
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
        voteId,
    });

    useEffect(() => {
        if (isConfirmed) {
            toast({
                title: "Success",
                description: "Your vote has been registered",
                className: "bg-green-600",
            });
            setVote("");
        }
    }, [isConfirmed]);

    return (
        <>
            <h2 className="text-4xl font-extrabold mb-4 mt-8">Vote for proposal</h2>

            <div className="mb-4">
                <Input
                    placeholder="Proposal ID"
                    value={vote}
                    onChange={(e) => setVote(e.target.value)}
                />
            </div>

            <Button
                onClick={addVote}
                className="hover:bg-gray-600 bg-gray-700 text-white"
                disabled={isPending || isConfirming}
            >
                {isPending || isConfirming ? "Adding..." : "Add"}
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
                    <AlertDescription>Vote registered</AlertDescription>
                </Alert>
            )}
        </>
    );
};

export default SetVote;