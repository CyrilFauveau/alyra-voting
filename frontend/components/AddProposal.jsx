'use client';
import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { contractAddress, contractAbi } from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const AddProposal = () => {
    const { address } = useAccount();
    const { toast } = useToast();
    const [ proposalDescription, setProposalDescription] = useState("");

    const { data: proposal, isPending, error, writeContract } = useWriteContract();

    const addProposal = async () => {
        try {
            writeContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: "addProposal",
                args: [proposalDescription],
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
        proposal,
    });

    useEffect(() => {
        if (isConfirmed) {
            toast({
                title: "Success",
                description: "The proposal has been registered",
                className: "bg-green-600",
            });
            setProposalDescription("");
        }
    }, [isConfirmed]);

    return (
        <>
            <h2 className="text-4xl font-extrabold mb-4 mt-8">Add Proposal</h2>

            <div className="mb-4">
                <Input
                    placeholder="Description"
                    value={proposalDescription}
                    onChange={(e) => setProposalDescription(e.target.value)}
                />
            </div>

            <Button
                onClick={addProposal}
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
                    <AlertDescription>Proposal has been added!</AlertDescription>
                </Alert>
            )}
        </>
    );
};

export default AddProposal;