import { useReadContract } from 'wagmi';
import { contractAddress, contractAbi } from "@/constants";

const GetWinningProposal = () => {
    const { data: winningProposalId, isLoading, error } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "winningProposalID",
    });

    if (isLoading)
        return <p>Loading...</p>;
    if (error)
        return <p>Error: {error.message}</p>;

    return (
        <>
            <h2 className="text-4xl font-extrabold mb-4 mt-8">Winning Proposal</h2>
            <div className="mb-4">
                <p>{winningProposalId ? winningProposalId.toString() : "No data available"}</p>
            </div>
        </>
    );
};

export default GetWinningProposal;