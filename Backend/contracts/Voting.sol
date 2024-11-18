// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Voting system
/// @author Alyra
/// @dev Implements a voting process with multiple workflow stages
contract Voting is Ownable {
    /// @notice ID of the winning proposal after votes are tallied
    uint public winningProposalID;
    /// @notice Id for incremental tally
    uint public lastTalliedIndex;
    
    /// @notice Struct representing a voter
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    /// @notice Struct representing a proposal
    struct Proposal {
        string description;
        uint voteCount;
    }

    /// @notice Enum representing the workflow statuses of the voting process
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /// @notice Current workflow status of the voting process
    WorkflowStatus public workflowStatus;
    /// @notice Array containing all registered proposals
    Proposal[] proposalsArray;
    /// @notice Mapping of voter addresses to voter details
    mapping (address => Voter) voters;

    /// @dev Emitted when a voter is registered
    event VoterRegistered(address voterAddress); 
    /// @dev Emitted when the workflow status changes
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    /// @dev Emitted when a proposal is registered
    event ProposalRegistered(uint proposalId);
    /// @dev Emitted when a vote is cast
    event Voted(address voter, uint proposalId);

    constructor() Ownable(msg.sender) {}

    /// @dev Modifier to restrict access to registered voters only
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }

    // ::::::::::::: GETTERS ::::::::::::: //

    /// @notice Returns the details of a voter
    /// @param _addr Address of the voter to query
    /// @return Voter The voter's details
    function getVoter(address _addr) external view onlyVoters returns (Voter memory) {
        return voters[_addr];
    }
    
    /// @notice Returns the details of a proposal
    /// @param _id ID of the proposal to query
    /// @return Proposal The proposal's details
    function getOneProposal(uint _id) external view onlyVoters returns (Proposal memory) {
        return proposalsArray[_id];
    }

    // ::::::::::::: REGISTRATION ::::::::::::: // 

    /// @notice Registers a voter
    /// @dev Can only be called by the contract owner during the voter registration phase
    /// @param _addr Address of the voter to register
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Voters registration is not open yet");
        require(!voters[_addr].isRegistered, "Already registered");
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }

    // ::::::::::::: PROPOSAL ::::::::::::: // 

    /// @notice Adds a new proposal
    /// @dev Can only be called by registered voters during the proposal registration phase
    /// @param _desc Description of the proposal
    function addProposal(string calldata _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals are not allowed yet");
        require(bytes(_desc).length > 0, "You cannot submit an empty proposal");
        proposalsArray.push(Proposal({description: _desc, voteCount: 0}));
        emit ProposalRegistered(proposalsArray.length - 1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /// @notice Casts a vote for a proposal
    /// @dev Can only be called by registered voters during the voting session
    /// @param _id ID of the proposal to vote for
    function setVote(uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session hasn't started yet");
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_id < proposalsArray.length, "Proposal not found");
        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;
        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /// @notice Starts the proposal registration phase
    /// @dev Can only be called by the contract owner during the voter registration phase
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Cannot start registering proposals now");
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        proposalsArray.push(Proposal({description: "GENESIS", voteCount: 0}));
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /// @notice Ends the proposal registration phase
    /// @dev Can only be called by the contract owner during the proposal registration phase
    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration hasn't started yet");
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /// @notice Starts the voting session
    /// @dev Can only be called by the contract owner after the proposal registration phase ends
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, "Proposals registration phase is not finished");
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /// @notice Ends the voting session
    /// @dev Can only be called by the contract owner during the voting phase
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session hasn't started yet");
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /// @notice Tallies votes and determines the winning proposal
    /// @dev Can only be called by the contract owner after the voting session ends
    /// @param batchSize Size of the batch
    function tallyVotes(uint batchSize) external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");

        uint endIndex = lastTalliedIndex + batchSize;
        if (endIndex > proposalsArray.length) {
            endIndex = proposalsArray.length;
        }

        for (uint i = lastTalliedIndex; i < endIndex; i++) {
            if (proposalsArray[i].voteCount > proposalsArray[winningProposalID].voteCount) {
                winningProposalID = i;
            }
        }

        lastTalliedIndex = endIndex;
    
        if (lastTalliedIndex == proposalsArray.length) {
            workflowStatus = WorkflowStatus.VotesTallied;
            emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
        }
    }
}
