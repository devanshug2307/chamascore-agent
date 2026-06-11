import { createPublicClient, erc20Abi, formatUnits, getAddress, http, parseAbi } from "viem";
import { celoSepolia } from "viem/chains";

const CONTRACT = getAddress(
  process.env.NEXT_PUBLIC_CHAMASCORE_CONTRACT ||
    "0xAE849506E7C2c8E8B356A4a57aFdca7Bf42D93E5",
);
const CIRCLE_ID = BigInt(process.env.NEXT_PUBLIC_CHAMASCORE_CIRCLE_ID || "2");
const USDC = getAddress(
  process.env.NEXT_PUBLIC_CHAMASCORE_USDC ||
    "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
);
const DEMO_WALLET = getAddress(
  process.env.CHAMASCORE_DEMO_WALLET ||
    "0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603",
);
const EXPECTED_CONTRIBUTION = 500000n;

const circleAbi = parseAbi([
  "function getCircle(uint256 circleId) view returns (address organizer, address token, uint256 contributionAmount, uint256 currentRound, bool active, string metadataURI)",
  "function getMembers(uint256 circleId) view returns (address[] members)",
  "function hasContributed(uint256 circleId, uint256 round, address member) view returns (bool)",
  "function roundTotal(uint256 circleId, uint256 round) view returns (uint256)",
]);

const client = createPublicClient({
  chain: celoSepolia,
  transport: http(process.env.CELO_SEPOLIA_RPC_URL || undefined),
});

function assertState(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sameAddress(a, b) {
  return getAddress(a) === getAddress(b);
}

async function main() {
  const [organizer, token, contributionAmount, currentRound, active, metadataURI] =
    await client.readContract({
      address: CONTRACT,
      abi: circleAbi,
      functionName: "getCircle",
      args: [CIRCLE_ID],
    });

  const members = await client.readContract({
    address: CONTRACT,
    abi: circleAbi,
    functionName: "getMembers",
    args: [CIRCLE_ID],
  });

  const hasContributed = await client.readContract({
    address: CONTRACT,
    abi: circleAbi,
    functionName: "hasContributed",
    args: [CIRCLE_ID, currentRound, DEMO_WALLET],
  });

  const roundTotal = await client.readContract({
    address: CONTRACT,
    abi: circleAbi,
    functionName: "roundTotal",
    args: [CIRCLE_ID, currentRound],
  });

  const demoWalletUsdcBalance = await client.readContract({
    address: USDC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [DEMO_WALLET],
  });

  assertState(active, "Circle is not active.");
  assertState(sameAddress(token, USDC), `Circle token ${token} does not match USDC ${USDC}.`);
  assertState(
    contributionAmount === EXPECTED_CONTRIBUTION,
    `Contribution amount is ${contributionAmount}, expected ${EXPECTED_CONTRIBUTION}.`,
  );
  assertState(hasContributed, "Demo wallet has not contributed to the active round.");
  assertState(
    roundTotal >= EXPECTED_CONTRIBUTION,
    `Round total is ${roundTotal}, expected at least ${EXPECTED_CONTRIBUTION}.`,
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        network: "celo-sepolia",
        contract: CONTRACT,
        circleId: Number(CIRCLE_ID),
        organizer,
        token,
        contributionAmount: `${formatUnits(contributionAmount, 6)} USDC`,
        currentRound: Number(currentRound),
        active,
        metadataURI,
        members,
        proof: {
          hasContributed,
          roundTotal: `${formatUnits(roundTotal, 6)} USDC`,
          demoWalletUsdcBalance: `${formatUnits(demoWalletUsdcBalance, 6)} USDC`,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Demo verification failed:");
  console.error(error);
  process.exitCode = 1;
});
