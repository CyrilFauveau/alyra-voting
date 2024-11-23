import { useState } from "react";
import { useReadContract } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";

const GetOneProposal = () => {
    const [proposalID, setProposalID] = useState("");
    const [proposalData, setProposalData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { refetch } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getOneProposal",
        args: [proposalID],
        enabled: false,
    });

    const handleFetch = async () => {
        setError(null);
        setProposalData(null);
        if (!proposalID) {
            setError("Please use valid ID");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await refetch();
            setProposalData(data);
        } catch (e) {
            setError(e.message || "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-4xl font-extrabold mb-4 mt-8">Get Proposal</h2>

            <div className="mb-4">
                <Input
                    placeholder="Proposal ID"
                    value={proposalID}
                    onChange={(e) => setProposalID(e.target.value)}
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

            {proposalData && (
                <Alert className="mt-4">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                        <p>Proposal :{proposalData.description}</p>
                    </AlertDescription>
                </Alert>
            )}
        </>
    )
}

export default GetOneProposal;