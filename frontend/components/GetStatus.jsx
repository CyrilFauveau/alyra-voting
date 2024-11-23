import { useReadContract } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";

const GetStatus = () => {
    const { data: workflowStatus, isLoading, error } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "workflowStatus",
        enabled: false,
    });
    if (isLoading) { return <p>Loading...</p>; }
    if (error) { return <p>Error : {error.message}</p>; }

    return (
        <p>Actual status : {workflowStatus}</p>
    )
}

export default GetStatus;