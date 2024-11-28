import { useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractAddress, contractAbi } from '@/constants';
import { Button } from './ui/button';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

const AdvanceStatus = () => {
    const { data: status, isPending, error, writeContract } = useWriteContract();

    const { data: workflowStatus, isStatusLoading, statusError } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "workflowStatus",
        enabled: true,
    });
    if (isStatusLoading) return <p>Loading...</p>;
    if (statusError) return <p>Error : {statusError.message}</p>;

    const advanceStatus = () => {
        try {
            switch (workflowStatus) {
                case 0:
                    writeContract({
                        address: contractAddress,
                        abi: contractAbi,
                        functionName: "startProposalsRegistering",
                    });
                    break;
                case 1:
                    writeContract({
                        address: contractAddress,
                        abi: contractAbi,
                        functionName: "endProposalsRegistering",
                    });
                    break;
                case 2:
                    writeContract({
                        address: contractAddress,
                        abi: contractAbi,
                        functionName: "startVotingSession",
                    });
                    break;

                case 3:
                    writeContract({
                        address: contractAddress,
                        abi: contractAbi,
                        functionName: "endVotingSession",
                    });
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.error(e);
            toast({
                title: "Error",
                description: "An error occurred during transaction",
                className: "bg-red-600",
            });
        }
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        status,
    });

    useEffect(() => {
        if (isConfirmed) {
            toast({
                title: "Success",
                description: "Status has changed",
                className: "bg-green-600",
            });
        }
    }, [isConfirmed]);

    return (
        <>
            <h2 className="text-4xl font-extrabold mb-4 mt-8">Advance the status</h2>

            <div className="mt-4">
                <Button
                    onClick={advanceStatus}
                    className="hover:bg-gray-600 bg-gray-700 text-white"
                    disabled={isPending || isConfirming}
                >
                    {isPending || isConfirming ? "Advancing..." : "Go to next status"}
                </Button>
            </div>

            {error && (
                <Alert className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}

            {isConfirmed && (
                <Alert className="mt-4">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>Status advanced!</AlertDescription>
                </Alert>
            )}
        </>
    )
}

export default AdvanceStatus;