'use client';
import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { contractAddress, contractAbi } from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const AddVoter = () => {
    const { address } = useAccount();
    const { toast } = useToast();
    const [voterAddress, setVoterAddress] = useState("");

    const { data: hash, isPending, error, writeContract } = useWriteContract();

    const addVoter = async () => {
        if (voterAddress.trim() === "") {
            toast({
                title: "Error",
                description: "Please use valid Ethereum address",
                className: "bg-red-600",
            });
            return;
        }

        try {
            writeContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: "addVoter",
                args: [voterAddress],
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
            setVoterAddress("");
        }
    }, [isConfirmed]);

    return (
        <>
            <h2 className="text-4xl font-extrabold mb-4 mt-8">Add Voter</h2>

            <div className="mb-4">
                <Input
                    placeholder="Ethereum address"
                    value={voterAddress}
                    onChange={(e) => setVoterAddress(e.target.value)}
                />
            </div>

            <Button
                onClick={addVoter}
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
                    <AlertDescription>Address has been added!</AlertDescription>
                </Alert>
            )}
        </>
    );
};

export default AddVoter;