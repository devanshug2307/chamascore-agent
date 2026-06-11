// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract ChamaScoreCircle {
    struct Circle {
        address organizer;
        IERC20 token;
        uint256 contributionAmount;
        uint256 currentRound;
        bool active;
        string metadataURI;
        address[] members;
    }

    uint256 public nextCircleId;

    mapping(uint256 => Circle) private circles;
    mapping(uint256 => mapping(address => bool)) public isMember;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasContributed;
    mapping(uint256 => mapping(uint256 => uint256)) public roundTotal;

    event CircleCreated(
        uint256 indexed circleId,
        address indexed organizer,
        address indexed token,
        uint256 contributionAmount,
        string metadataURI
    );
    event ContributionRecorded(
        uint256 indexed circleId,
        uint256 indexed round,
        address indexed member,
        uint256 amount
    );
    event PayoutExecuted(
        uint256 indexed circleId,
        uint256 indexed round,
        address indexed recipient,
        uint256 amount
    );
    event RiskFlagRecorded(
        uint256 indexed circleId,
        address indexed member,
        string reason,
        uint8 severity
    );

    modifier onlyOrganizer(uint256 circleId) {
        require(msg.sender == circles[circleId].organizer, "NOT_ORGANIZER");
        _;
    }

    function createCircle(
        address token,
        uint256 contributionAmount,
        address[] calldata members,
        string calldata metadataURI
    ) external returns (uint256 circleId) {
        require(token != address(0), "TOKEN_REQUIRED");
        require(contributionAmount > 0, "AMOUNT_REQUIRED");
        require(members.length > 1, "MEMBERS_REQUIRED");

        circleId = nextCircleId++;
        Circle storage circle = circles[circleId];
        circle.organizer = msg.sender;
        circle.token = IERC20(token);
        circle.contributionAmount = contributionAmount;
        circle.active = true;
        circle.metadataURI = metadataURI;

        for (uint256 i = 0; i < members.length; i++) {
            address member = members[i];
            require(member != address(0), "INVALID_MEMBER");
            require(!isMember[circleId][member], "DUPLICATE_MEMBER");
            isMember[circleId][member] = true;
            circle.members.push(member);
        }

        emit CircleCreated(circleId, msg.sender, token, contributionAmount, metadataURI);
    }

    function contribute(uint256 circleId) external {
        Circle storage circle = circles[circleId];
        require(circle.active, "CIRCLE_INACTIVE");
        require(isMember[circleId][msg.sender], "NOT_MEMBER");
        require(
            !hasContributed[circleId][circle.currentRound][msg.sender],
            "ALREADY_CONTRIBUTED"
        );

        hasContributed[circleId][circle.currentRound][msg.sender] = true;
        roundTotal[circleId][circle.currentRound] += circle.contributionAmount;

        require(
            circle.token.transferFrom(msg.sender, address(this), circle.contributionAmount),
            "TRANSFER_FAILED"
        );

        emit ContributionRecorded(
            circleId,
            circle.currentRound,
            msg.sender,
            circle.contributionAmount
        );
    }

    function executePayout(uint256 circleId) external onlyOrganizer(circleId) {
        Circle storage circle = circles[circleId];
        require(circle.active, "CIRCLE_INACTIVE");
        uint256 expectedTotal = circle.contributionAmount * circle.members.length;
        uint256 available = roundTotal[circleId][circle.currentRound];
        require(available >= expectedTotal, "ROUND_NOT_FUNDED");

        address recipient = circle.members[circle.currentRound % circle.members.length];
        roundTotal[circleId][circle.currentRound] = 0;
        circle.currentRound += 1;

        require(circle.token.transfer(recipient, expectedTotal), "PAYOUT_FAILED");

        emit PayoutExecuted(circleId, circle.currentRound - 1, recipient, expectedTotal);
    }

    function recordRiskFlag(
        uint256 circleId,
        address member,
        string calldata reason,
        uint8 severity
    ) external onlyOrganizer(circleId) {
        require(isMember[circleId][member], "NOT_MEMBER");
        require(severity > 0 && severity <= 3, "INVALID_SEVERITY");

        emit RiskFlagRecorded(circleId, member, reason, severity);
    }

    function getCircle(uint256 circleId)
        external
        view
        returns (
            address organizer,
            address token,
            uint256 contributionAmount,
            uint256 currentRound,
            bool active,
            string memory metadataURI
        )
    {
        Circle storage circle = circles[circleId];
        return (
            circle.organizer,
            address(circle.token),
            circle.contributionAmount,
            circle.currentRound,
            circle.active,
            circle.metadataURI
        );
    }

    function getMembers(uint256 circleId) external view returns (address[] memory) {
        return circles[circleId].members;
    }
}
