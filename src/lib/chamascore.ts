export type ContributionStatus = "paid" | "late" | "pending";

export type Member = {
  id: string;
  name: string;
  wallet: string;
  proof: "onchain-member" | "self-verified" | "self-pending" | "unsupported";
  paidRounds: number;
  lateRounds: number;
  missedRounds: number;
  status: ContributionStatus;
};

export type AgentFinding = {
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
};

export type AgentAction = {
  label: string;
  detail: string;
  type: "reminder" | "payout" | "review" | "feedback";
};

export type CircleConfig = {
  name: string;
  contribution: number;
  tokenSymbol: "USDm" | "USDC" | "USDT";
  round: number;
  payoutRecipient: string;
  members: Member[];
};

export type MemberScore = Member & {
  score: number;
  reliability: "excellent" | "steady" | "watch" | "risk";
};

export type AgentReport = {
  circleScore: number;
  collectedThisRound: number;
  expectedThisRound: number;
  readyForPayout: boolean;
  verifiedMembers: number;
  selfVerifiedMembers: number;
  memberScores: MemberScore[];
  findings: AgentFinding[];
  nextActions: AgentAction[];
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const shortAddress = (value: string) => {
  if (!value || value.length < 12) return value || "Not connected";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

export function scoreMember(member: Member): MemberScore {
  const totalRounds = Math.max(
    member.paidRounds + member.lateRounds + member.missedRounds,
    1,
  );
  const paidRatio = member.paidRounds / totalRounds;
  const latePenalty = member.lateRounds * 8;
  const missedPenalty = member.missedRounds * 22;
  const currentPenalty =
    member.status === "late" ? 12 : member.status === "pending" ? 4 : 0;
  const score = clamp(
    Math.round(paidRatio * 100 - latePenalty - missedPenalty - currentPenalty),
    0,
    100,
  );

  let reliability: MemberScore["reliability"] = "risk";
  if (score >= 88) reliability = "excellent";
  else if (score >= 72) reliability = "steady";
  else if (score >= 52) reliability = "watch";

  return {
    ...member,
    score,
    reliability,
  };
}

export function runChamaScoreAgent(config: CircleConfig): AgentReport {
  const memberScores = config.members.map(scoreMember);
  const paidCount = config.members.filter((member) => member.status === "paid")
    .length;
  const lateMembers = config.members.filter((member) => member.status === "late");
  const riskMembers = memberScores.filter((member) => member.score < 52);
  const verifiedMembers = config.members.filter(
    (member) => member.proof === "onchain-member" || member.proof === "self-verified",
  ).length;
  const selfVerifiedMembers = config.members.filter(
    (member) => member.proof === "self-verified",
  ).length;
  const collectedThisRound = paidCount * config.contribution;
  const expectedThisRound = config.members.length * config.contribution;
  const readyForPayout =
    config.members.length > 0 && collectedThisRound >= expectedThisRound;

  const findings: AgentFinding[] = [];
  if (lateMembers.length > 0) {
    findings.push({
      title: `${lateMembers.length} late contribution${
        lateMembers.length === 1 ? "" : "s"
      }`,
      detail: `${lateMembers
        .map((member) => member.name)
        .join(", ")} should receive a reminder before payout.`,
      severity: lateMembers.length > 1 ? "high" : "medium",
    });
  }

  if (riskMembers.length > 0) {
    findings.push({
      title: `${riskMembers.length} member${
        riskMembers.length === 1 ? "" : "s"
      } need trust review`,
      detail:
        "The agent should record a risk flag and publish ERC-8004 feedback after this round so future groups can inspect reliability.",
      severity: "high",
    });
  }

  if (selfVerifiedMembers === 0) {
    findings.push({
      title: "Self verification pending",
      detail:
        "Members are onchain-confirmed for the demo circle; Self Agent ID or unsupported-region proof should be added before final submission.",
      severity: "medium",
    });
  }

  if (readyForPayout) {
    findings.push({
      title: "Round is funded",
      detail: `${config.payoutRecipient} is eligible for the next rotating payout.`,
      severity: "low",
    });
  }

  if (findings.length === 0) {
    findings.push({
      title: "Circle is healthy",
      detail:
        "No missed or late contributions detected. Keep reminders active until the payout window closes.",
      severity: "low",
    });
  }

  const nextActions: AgentAction[] = [];
  if (lateMembers.length > 0) {
    nextActions.push({
      label: "Send reminder",
      detail: `Notify ${lateMembers.map((member) => member.name).join(", ")} with the prepared MiniPay payment request.`,
      type: "reminder",
    });
  }

  nextActions.push({
    label: readyForPayout ? "Prepare payout" : "Hold payout",
    detail: readyForPayout
      ? `Prepare ${expectedThisRound.toFixed(2)} ${config.tokenSymbol} payout to ${config.payoutRecipient}.`
      : `Wait for ${(expectedThisRound - collectedThisRound).toFixed(2)} ${config.tokenSymbol} before release.`,
    type: "payout",
  });

  nextActions.push({
    label: "Publish reputation",
    detail:
      "Record the late-payment risk flag onchain, then link the report from the ERC-8004 profile.",
    type: "feedback",
  });

  const averageScore =
    memberScores.reduce((total, member) => total + member.score, 0) /
    Math.max(memberScores.length, 1);
  const fundingScore =
    expectedThisRound === 0 ? 0 : (collectedThisRound / expectedThisRound) * 100;
  const circleScore = clamp(Math.round(averageScore * 0.65 + fundingScore * 0.35), 0, 100);

  return {
    circleScore,
    collectedThisRound,
    expectedThisRound,
    readyForPayout,
    verifiedMembers,
    selfVerifiedMembers,
    memberScores,
    findings,
    nextActions,
  };
}

export const sampleCircle: CircleConfig = {
  name: "Celo Sepolia Launch Chama",
  contribution: 0.5,
  tokenSymbol: "USDC",
  round: 1,
  payoutRecipient: "Devanshu",
  members: [
    {
      id: "devanshu",
      name: "Devanshu",
      wallet: "0xE6df1c1EcC9cEe37B09172366B92a7eDc026b603",
      proof: "onchain-member",
      paidRounds: 3,
      lateRounds: 0,
      missedRounds: 0,
      status: "paid",
    },
    {
      id: "amina",
      name: "Amina",
      wallet: "0x19A12f8b9e8eF0A1443B86F842cC3901d9C09a91",
      proof: "onchain-member",
      paidRounds: 2,
      lateRounds: 1,
      missedRounds: 0,
      status: "late",
    },
  ],
};
