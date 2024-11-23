import { useState, useEffect } from "react";
import { parseAbiItem } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import AddVoter from "./AddVoter";
import GetVoter from "./GetVoter";
import AdvanceStatus from "./AdvanceStatus";
import GetStatus from "./GetStatus";
import AddProposal from "./AddProposal";
import GetOneProposal from "./getOneProposal";
import Events from "./Events";
import SetVote from "./SetVote";
import TallyVotes from "./TallyVotes";
import GetWinningProposal from "./GetWinningProposal";
import { publicClient } from "@/utils/client";

const Voting = () => {
    const { address } = useAccount();
    const [events, setEvents] = useState([]);

    const { data: owner, isOwnerLoading, ownerError } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "owner",
        enabled: true,
    });

    const { data: voter, isVoterLoading, voterError } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getVoter",
        args: [address],
        enabled: true,
    });
    let voterAddress = "";
    if (voter) { voterAddress = voter.isRegistered; }

    const { data: workflowStatus, isWorkflowStatusLoading, workflowStatusError } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "workflowStatus",
        enabled: true,
    });

    if (isOwnerLoading || isVoterLoading ||isWorkflowStatusLoading)
        return <p>Loading...</p>;
    if (ownerError || voterError || workflowStatusError)
        return <p>Error loading data</p>;


    const getEvents = async() => {
        const voterEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event VoterRegistered(address voterAddress)'),
            fromBlock: 0n,
            toBlock: 'latest'
        });

        const workflowStatusEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event WorkflowStatusChange(uint8 previousStatus, uint8 newStatus)'),
            fromBlock: 0n,
            toBlock: 'latest'
        });

        const proposalEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event ProposalRegistered(uint proposalId)'),
            fromBlock: 0n,
            toBlock: 'latest'
        });

        const votingEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event Voted(address voter, uint proposalId)'),
            fromBlock: 0n,
            toBlock: 'latest'
        });

        const combinedEvents = voterEvents.map((event) => ({
            type: 'Add Voter',
            address: event.args.account,
            blockNumber: Number(event.blockNumber),
        })).concat(workflowStatusEvents.map((event) => ({
            type: 'Change Status',
            address: event.args.account,
            blockNumber: Number(event.blockNumber),
        }))).concat(proposalEvents.map((event) => ({
            type: 'Add Proposal',
            address: event.args.account,
            blockNumber: Number(event.blockNumber),
        }))).concat(votingEvents.map((event) => ({
            type: 'Set Vote',
            address: event.args.account,
            blockNumber: Number(event.blockNumber),
        })));

        combinedEvents.sort(function(a,b) {
            return b.blockNumber - a.blockNumber;
        });

        setEvents(combinedEvents);
    }

    useEffect(() => {
        const getAllEvents = async() => {
            if(address !== 'undefined') {
                await getEvents();
            }
        }
        getAllEvents();
    }, [address]);

    return (
        <>
            {(owner === address && voterAddress) ? (
                <>
                    <p>You are an admin and a voter</p>
                    <AddVoter />
                    <GetVoter />
                    <hr className="mt-4" />
                    <AddProposal />
                    <GetOneProposal />
                    <hr className="mt-4" />
                    <AdvanceStatus />
                    <GetStatus />
                    <hr className="mt-4" />
                    <SetVote />
                    <hr className="mt-4" />
                    <TallyVotes />
                    <GetWinningProposal />
                </>
            ) : (owner === address) ? (
                <>
                    <p>You are an admin</p>
                    <AddVoter />
                    <hr className="mt-4" />
                    <AdvanceStatus />
                    <GetStatus />
                    <hr className="mt-4" />
                    <GetWinningProposal />
                </>
            ) : (voterAddress) ? (
                <>
                    <p>You are a voter</p>
                    <GetVoter />
                    <hr className="mt-4" />
                    <AddProposal />
                    <GetOneProposal />
                    <hr className="mt-4" />
                    <SetVote />
                    <hr className="mt-4" />
                    <GetWinningProposal />
                </>
            ) : (
                <>
                    <p>You are not whitelisted</p>
                    <GetWinningProposal />
                </>
            )}
            <Events events={events} />
        </>
    );
};

export default Voting;
